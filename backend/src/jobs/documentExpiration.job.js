import pool from '../config/database.js';
import UsersRepository from '../modules/users/repository.js';
import NotificationsService from '../modules/notifications/service.js';

/**
 * Job diário:
 * - verifica documentos vencidos ou próximos do vencimento
 * - atualiza status do documento
 * - atualiza status do usuário
 * - envia notificações automáticas
 */
async function documentExpirationJob() {
  console.log('⏱️ Iniciando job de verificação de documentos');

  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT d.id AS document_id,
             d.driver_id,
             d.type,
             d.expires_at,
             u.id AS user_id,
             u.status
      FROM documents d
      JOIN drivers dr ON dr.id = d.driver_id
      JOIN users u ON u.id = dr.user_id
    `);

    const today = new Date();

    for (const row of result.rows) {
      const expDate = new Date(row.expires_at);
      const diffDays = Math.ceil(
        (expDate - today) / (1000 * 60 * 60 * 24)
      );

      let newDocStatus = 'VALID';
      let newUserStatus = row.status;

      if (diffDays <= 0) {
        newDocStatus = 'EXPIRED';
        newUserStatus = 'BANNED';
      } else if (diffDays <= 14) {
        newDocStatus = 'EXPIRING';
        if (row.status === 'ACTIVE') {
          newUserStatus = 'IRREGULAR';
        }
      }

      // Atualiza documento
      await client.query(
        'UPDATE documents SET status = $1 WHERE id = $2',
        [newDocStatus, row.document_id]
      );

      // Atualiza usuário se necessário
      if (newUserStatus !== row.status) {
        await UsersRepository.updateStatus(row.user_id, newUserStatus);
      }

      // Notificação automática
      if (newDocStatus !== 'VALID') {
        await NotificationsService.notify(row.user_id, {
          title: 'Documento em situação irregular',
          message:
            newDocStatus === 'EXPIRED'
              ? 'Seu documento venceu e sua conta foi bloqueada.'
              : 'Seu documento está próximo do vencimento.',
          type: 'SYSTEM',
        });
      }
    }

    console.log('✅ Job de documentos finalizado');
  } catch (err) {
    console.error('❌ Erro no job de documentos', err);
  } finally {
    client.release();
  }
}

export default documentExpirationJob;
