import { pool } from '../config/database.js';
import UsersRepository from '../modules/users/repository.js';
import MessagesService from '../modules/messages/service.js';
import MessagesRepository from '../modules/messages/repository.js';








async function documentExpirationJob() {
  console.log('⏱️ Iniciando job de verificação de documentos');

  let client;
  try {
    client = await pool.connect();
  } catch (err) {
    console.error('❌ Erro ao conectar no PostgreSQL (job de documentos)', err);
    return;
  }

  try {
    const result = await client.query(`
      SELECT
        d.id AS document_id,
        d.driver_id,
        d.type,
        d.status AS old_status,
        d.expires_at,
        u.id AS user_id,
        u.name AS user_name,
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
          userName: row.user_name,
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

    const expectedStatusFrom = ({ reputationScore, overallDocStatus, oldUserStatus, docsCount }) => {
      if (!docsCount || docsCount <= 0) return oldUserStatus;
      const rep = Number(reputationScore);
      if (Number.isFinite(rep) && rep < 4) return 'BANNED';
      if (overallDocStatus === 'EXPIRED') return 'BANNED';
      if (overallDocStatus === 'EXPIRING') return 'IRREGULAR';
      return 'ACTIVE';
    };

    const systemEventFrom = ({ expectedUserStatus, reputationScore, overallDocStatus }) => {
      const rep = Number(reputationScore);
      if (expectedUserStatus === 'BANNED') {
        if (Number.isFinite(rep) && rep < 4) return 'REPUTATION_SUSPEND';
        if (overallDocStatus === 'EXPIRED') return 'BAN_DOCS';
        return 'BAN';
      }
      if (expectedUserStatus === 'IRREGULAR') return 'DOC_EXPIRING';
      return 'APPROVED';
    };

    
    for (const entry of byDriver.values()) {
      const oldUserStatus = entry.oldUserStatus;

      const newStatuses = entry.docs.map((d) => calcDocStatus(d.expires_at));
      const newOverall = overallFromStatuses(newStatuses);

      
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

      
      
      
      const expectedUserStatus = expectedStatusFrom({
        reputationScore: entry.reputationScore,
        overallDocStatus: newOverall,
        oldUserStatus,
        docsCount: entry.docs.length,
      });

      if (expectedUserStatus !== oldUserStatus) {
        await UsersRepository.updateStatus(entry.userId, expectedUserStatus);
      }

      
      
      
      const evt = systemEventFrom({
        expectedUserStatus,
        reputationScore: entry.reputationScore,
        overallDocStatus: newOverall,
      });
      let shouldSend = expectedUserStatus !== oldUserStatus;

      if (!shouldSend && (expectedUserStatus === 'IRREGULAR' || expectedUserStatus === 'BANNED')) {
        const last = await MessagesRepository.getLatestSystemByEvent(entry.driverId, evt);
        if (!last) {
          shouldSend = true;
        } else {
          const body = String(last.body || '');
          const hasSignature =
            body.toLowerCase().includes('equipe buenos drivers') ||
            body.toLowerCase().includes('equipe buenos drivers.');
          shouldSend = !hasSignature;
        }
      }

      if (shouldSend) {
        await MessagesService.sendSystemMessageRealtime({
          driverId: entry.driverId,
          systemEvent: evt,
          body: MessagesService.buildSystemMessageBody({
            systemEvent: evt,
            driverName: entry.userName,
            documents: entry.docs,
            now: today,
          }),
          receiverUserId: entry.userId,
        });
      }

      const rep = Number(entry.reputationScore);
      const shouldWarnReputation =
        expectedUserStatus === 'ACTIVE' && Number.isFinite(rep) && rep >= 4.0 && rep < 4.5;
      if (shouldWarnReputation) {
        const warnEvt = 'REPUTATION_WARNING';
        const lastWarn = await MessagesRepository.getLatestSystemByEvent(entry.driverId, warnEvt);
        const warnBody = String(lastWarn?.body || '');
        const warnHasSignature = warnBody.toLowerCase().includes('equipe buenos drivers');
        if (!lastWarn || !warnHasSignature) {
          await MessagesService.sendSystemMessageRealtime({
            driverId: entry.driverId,
            systemEvent: warnEvt,
            body: MessagesService.buildSystemMessageBody({
              systemEvent: warnEvt,
              driverName: entry.userName,
              documents: entry.docs,
              now: today,
            }),
            receiverUserId: entry.userId,
          });
        }
      }
    }

    const bannedOrIrregular = await client.query(
      `
      SELECT
        dr.id AS driver_id,
        u.id AS user_id,
        u.name,
        u.status AS user_status,
        u.reputation_score
      FROM drivers dr
      JOIN users u ON u.id = dr.user_id
      WHERE u.status IN ('BANNED', 'IRREGULAR')
      ORDER BY dr.created_at DESC
      `
    );

    for (const r of bannedOrIrregular.rows || []) {
      const driverId = r.driver_id;
      const userId = r.user_id;
      const name = r.name;
      const st = r.user_status;
      const rep = Number(r.reputation_score);

      const docsRes = await client.query(
        `SELECT id, driver_id, type, expires_at FROM documents WHERE driver_id = $1 ORDER BY type ASC`,
        [driverId]
      );
      const docs = docsRes.rows || [];
      const statuses = docs.map((d) => calcDocStatus(d.expires_at));
      const overallDocStatus = overallFromStatuses(statuses);

      let evt = null;
      if (st === 'BANNED') {
        if (Number.isFinite(rep) && rep < 4) evt = 'REPUTATION_SUSPEND';
        else if (overallDocStatus === 'EXPIRED') evt = 'BAN_DOCS';
        else evt = 'BAN';
      } else if (st === 'IRREGULAR') {
        evt = 'DOC_EXPIRING';
      } else {
        continue;
      }

      const last = await MessagesRepository.getLatestSystemByEvent(driverId, evt);
      const body = String(last?.body || '');
      const hasSignature = body.toLowerCase().includes('equipe buenos drivers');
      if (last && hasSignature) continue;

      await MessagesService.sendSystemMessageRealtime({
        driverId,
        systemEvent: evt,
        body: MessagesService.buildSystemMessageBody({
          systemEvent: evt,
          driverName: name,
          documents: docs,
          now: today,
        }),
        receiverUserId: userId,
      });
    }

    console.log('✅ Job de documentos finalizado');
  } catch (err) {
    console.error('❌ Erro no job de documentos', err);
  } finally {
    client.release();
  }
}

export default documentExpirationJob;
