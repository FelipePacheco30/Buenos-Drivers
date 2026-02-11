import { pool } from '../config/database.js';
import UsersRepository from '../modules/users/repository.js';
import MessagesService from '../modules/messages/service.js';

/**
 * Job diário:
 * - verifica documentos vencidos ou próximos do vencimento
 * - atualiza status do documento
 * - atualiza status do usuário
 * - envia mensagens SYSTEM no chat (tempo real via WS)
 */
async function documentExpirationJob() {
  console.log('⏱️ Iniciando job de verificação de documentos');

  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT
        d.id AS document_id,
        d.driver_id,
        d.type,
        d.status AS old_status,
        d.expires_at,
        u.id AS user_id,
        u.status AS old_user_status,
        u.reputation_score
      FROM documents d
      JOIN drivers dr ON dr.id = d.driver_id
      JOIN users u ON u.id = dr.user_id
      ORDER BY d.driver_id ASC, d.type ASC
    `);

    const today = new Date();

    const byDriver = new Map();
    for (const row of result.rows) {
      if (!byDriver.has(row.driver_id)) {
        byDriver.set(row.driver_id, {
          driverId: row.driver_id,
          userId: row.user_id,
          oldUserStatus: row.old_user_status,
          reputationScore: row.reputation_score,
          docs: [],
        });
      }
      byDriver.get(row.driver_id).docs.push(row);
    }

    const calcDocStatus = (expiresAt) => {
      const expDate = new Date(expiresAt);
      const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'EXPIRED';
      if (diffDays <= 14) return 'EXPIRING';
      return 'VALID';
    };

    const overallFromStatuses = (statuses) => {
      if (statuses.includes('EXPIRED')) return 'EXPIRED';
      if (statuses.includes('EXPIRING')) return 'EXPIRING';
      return 'VALID';
    };

    // processa por motorista (evita spam por documento)
    for (const entry of byDriver.values()) {
      const oldStatuses = entry.docs.map((d) => d.old_status);
      const oldOverall = overallFromStatuses(oldStatuses);

      const newStatuses = entry.docs.map((d) => calcDocStatus(d.expires_at));
      const newOverall = overallFromStatuses(newStatuses);

      // Atualiza docs que mudaram
      for (let i = 0; i < entry.docs.length; i++) {
        const doc = entry.docs[i];
        const nextStatus = newStatuses[i];
        if (doc.old_status !== nextStatus) {
          await client.query(
            'UPDATE documents SET status = $1, updated_at = NOW() WHERE id = $2',
            [nextStatus, doc.document_id]
          );
        }
      }

      // Atualiza usuário conforme overall
      // Regra: banimento por reputação (ex: < 4.0) tem prioridade sobre documentos.
      // Se já estiver BANIDO e a reputação for <4, o job NÃO pode “desbanir” por docs em dia.
      const rep = Number(entry.reputationScore);
      const bannedByReputation = entry.oldUserStatus === 'BANNED' && Number.isFinite(rep) && rep < 4;

      let newUserStatus = entry.oldUserStatus;
      if (!bannedByReputation) {
        if (newOverall === 'EXPIRED') newUserStatus = 'BANNED';
        else if (newOverall === 'EXPIRING') newUserStatus = 'IRREGULAR';
        else newUserStatus = 'ACTIVE';
      }

      if (newUserStatus !== entry.oldUserStatus) {
        await UsersRepository.updateStatus(entry.userId, newUserStatus);
      }

      // Mensagem SYSTEM somente quando muda o overall
      // Evita mensagens “liberada” quando o motorista segue banido por reputação.
      if (!bannedByReputation && newOverall !== oldOverall) {
        const evt =
          newOverall === 'EXPIRED'
            ? 'BAN'
            : newOverall === 'EXPIRING'
              ? 'DOC_EXPIRING'
              : 'APPROVED';

        const body =
          evt === 'BAN'
            ? 'Conta bloqueada: existe documento vencido. Regularize para voltar a operar.'
            : evt === 'DOC_EXPIRING'
              ? 'Aviso: existe documento próximo do vencimento. Atualize para evitar bloqueio.'
              : 'Documentos regularizados. Sua conta foi liberada para operar.';

        await MessagesService.sendSystemMessageRealtime({
          driverId: entry.driverId,
          systemEvent: evt,
          body,
          receiverUserId: entry.userId,
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
