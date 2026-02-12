import { pool } from '../config/database.js';
import UsersRepository from '../modules/users/repository.js';
import MessagesService from '../modules/messages/service.js';

/**
 * Job diário:
 * - verifica documentos vencidos ou próximos do vencimento
 * - atualiza status do documento
 * - atualiza status do usuário
 * - envia mensagens SYSTEM no chat (tempo real via WS) quando o STATUS do motorista muda
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

    const expectedStatusFrom = ({ reputationScore, overallDocStatus }) => {
      const rep = Number(reputationScore);
      if (Number.isFinite(rep) && rep < 4) return 'BANNED';
      if (overallDocStatus === 'EXPIRED') return 'BANNED';
      if (overallDocStatus === 'EXPIRING') return 'IRREGULAR';
      return 'ACTIVE';
    };

    const systemEventFromUserStatus = (userStatus) => {
      if (userStatus === 'BANNED') return 'BAN';
      if (userStatus === 'IRREGULAR') return 'DOC_EXPIRING';
      return 'APPROVED';
    };

    const systemBodyFrom = (evt) => {
      if (evt === 'BAN') {
        return 'Conta bloqueada. Existem pendências (documentos ou reputação). Regularize para voltar a operar.';
      }
      if (evt === 'DOC_EXPIRING') {
        return 'Aviso: sua conta está irregular. Verifique documentos e mantenha tudo em dia para evitar bloqueio.';
      }
      return 'Situação regularizada. Sua conta está liberada para operar.';
    };

    // processa por motorista (evita spam: só quando o status muda)
    for (const entry of byDriver.values()) {
      const oldUserStatus = entry.oldUserStatus;

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

      // Atualiza usuário conforme:
      // - reputação (<4) tem prioridade (banido)
      // - senão, documentos (expired/expiring/valid)
      const expectedUserStatus = expectedStatusFrom({
        reputationScore: entry.reputationScore,
        overallDocStatus: newOverall,
      });

      if (expectedUserStatus !== oldUserStatus) {
        await UsersRepository.updateStatus(entry.userId, expectedUserStatus);
      }

      // Mensagem SYSTEM:
      // - quando muda o status do usuário
      // - OU quando o status já é IRREGULAR/BANNED e ainda não existe uma mensagem SYSTEM desse tipo
      const evt = systemEventFromUserStatus(expectedUserStatus);
      let shouldSend = expectedUserStatus !== oldUserStatus;

      if (!shouldSend && (expectedUserStatus === 'IRREGULAR' || expectedUserStatus === 'BANNED')) {
        const exists = await client.query(
          `
          SELECT 1
          FROM messages
          WHERE driver_id = $1
            AND sender_role = 'SYSTEM'
            AND system_event = $2
          LIMIT 1
          `,
          [entry.driverId, evt]
        );
        shouldSend = (exists.rows || []).length === 0;
      }

      if (shouldSend) {
        await MessagesService.sendSystemMessageRealtime({
          driverId: entry.driverId,
          systemEvent: evt,
          body: systemBodyFrom(evt),
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
