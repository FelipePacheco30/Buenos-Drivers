import MessagesRepository from './repository.js';
import DriversRepository from '../drivers/repository.js';
import UsersRepository from '../users/repository.js';
import { sendToUser } from '../../config/websocket.js';

function fmtDatePt(dateLike) {
  if (!dateLike) return '-';
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('pt-BR');
}

function daysUntil(expiresAt, now) {
  const exp = new Date(expiresAt);
  if (Number.isNaN(exp.getTime())) return null;
  const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  return diffDays;
}

function docLabel(docType) {
  const t = String(docType || '');
  if (t === 'CRIMINAL_RECORD') return 'Histórico criminal';
  return t;
}

function buildBanDocsTemplate({ driverName, expiredDocs, localDeEnvio }) {
  const lines =
    expiredDocs.length === 0
      ? ['- Documentação com pendências (verifique a plataforma).']
      : expiredDocs.map((d) => `- ${docLabel(d.type)} – vencido desde ${fmtDatePt(d.expires_at)}`);

  return [
    `Olá ${driverName}, tudo bem?`,
    '',
    'Identificamos que sua conta está temporariamente suspensa devido a pendências na documentação obrigatória.',
    '',
    'No momento, constam as seguintes irregularidades:',
    '',
    ...lines,
    '',
    'Por questões de segurança, conformidade legal e qualidade do serviço prestado aos passageiros, a regularização desses documentos é indispensável para que possamos reativar sua conta.',
    '',
    'Sabemos que imprevistos acontecem e entendemos que a rotina pode ser corrida. Nosso objetivo não é penalizar, mas garantir que todos os motoristas estejam operando dentro das exigências legais e com total segurança.',
    '',
    `Assim que os documentos forem regularizados, basta enviá-los pela plataforma no campo ${localDeEnvio}. Nossa equipe fará a análise com prioridade para que sua conta seja liberada o quanto antes.`,
    '',
    'Caso precise de apoio ou tenha qualquer dúvida sobre o processo, estamos à disposição para orientar você.',
    '',
    'Contamos com sua regularização para que possamos ter você novamente ativo em nossa plataforma.',
    '',
    'Atenciosamente,',
    'Equipe Buenos Drivers.',
  ].join('\n');
}

function buildDocsExpiringTemplate({ driverName, expiringDocs, now, localDeEnvio }) {
  const lines =
    expiringDocs.length === 0
      ? ['- Documentos próximos do vencimento (verifique a plataforma).']
      : expiringDocs.map((d) => {
          const dd = daysUntil(d.expires_at, now);
          const daysTxt = Number.isFinite(dd) ? `${dd} dias` : 'poucos dias';
          return `- ${docLabel(d.type)} – vence em ${daysTxt}, no dia ${fmtDatePt(d.expires_at)}`;
        });

  return [
    `Olá ${driverName}, tudo bem?`,
    '',
    'Estamos entrando em contato para avisar que identificamos documentos próximos do vencimento em seu cadastro:',
    '',
    ...lines,
    '',
    'Queremos ajudar você a evitar qualquer bloqueio temporário na conta. A atualização antes do vencimento garante que suas atividades continuem normalmente, sem interrupções.',
    '',
    'Sabemos que, com a rotina intensa do dia a dia, é fácil deixar passar um prazo. Por isso, antecipamos esse aviso para que você possa se organizar com tranquilidade.',
    '',
    `Após renovar o documento, basta enviá-lo pela plataforma no campo ${localDeEnvio}. Nossa equipe fará a validação rapidamente.`,
    '',
    'Manter sua documentação em dia é essencial para sua segurança, para os passageiros e para o bom funcionamento da plataforma.',
    '',
    'Se precisar de qualquer orientação, estamos à disposição.',
    '',
    'Seguimos juntos para manter sua conta ativa e regular.',
    '',
    'Atenciosamente,',
    'Equipe Buenos drivers',
  ].join('\n');
}

function buildReputationSuspendTemplate({ driverName, startDate }) {
  return [
    `Olá ${driverName}, tudo bem?`,
    '',
    'Após análises recorrentes das avaliações recebidas e do seu histórico recente na plataforma, identificamos que sua reputação ficou abaixo do padrão mínimo exigido em nossos critérios de qualidade.',
    '',
    'Nosso compromisso é garantir segurança, respeito e uma boa experiência para todos — passageiros e motoristas. Por esse motivo, sua conta será suspensa pelo período de 6 meses, a contar de ' +
      `${fmtDatePt(startDate)}.`,
    '',
    'Durante esse período, recomendamos que você revise atentamente os nossos Termos e Condições, especialmente as diretrizes relacionadas a:',
    '',
    '- Conduta profissional',
    '- Respeito aos passageiros',
    '- Comunicação adequada',
    '- Cumprimento das normas da plataforma',
    '',
    'Essa suspensão tem caráter educativo e preventivo. Nosso objetivo é oferecer a oportunidade de readequação antes de medidas mais severas.',
    '',
    'É importante ressaltar que, após o retorno às atividades, caso ocorra novo descumprimento das regras ou reincidência em comportamentos que impactem negativamente sua reputação, sua conta poderá ser banida permanentemente, sem possibilidade de novo cadastro na plataforma.',
    '',
    'Reforçamos que a qualidade do serviço e o respeito são pilares essenciais para mantermos um ambiente seguro e profissional para todos.',
    '',
    'Caso tenha dúvidas, nossa equipe está à disposição.',
    '',
    'Atenciosamente,',
    'Equipe Buenos Drivers',
  ].join('\n');
}

function buildReputationWarningTemplate({ driverName }) {
  return [
    'Atenção: sua reputação está abaixo do esperado',
    '',
    `Olá ${driverName}, tudo bem?`,
    '',
    'Identificamos que sua reputação na plataforma está abaixo do nível ideal, com base nas avaliações recentes recebidas dos passageiros.',
    '',
    'Gostaríamos de reforçar a importância de manter uma postura profissional, respeitosa e alinhada aos nossos Termos e Condições. Pontos fundamentais incluem:',
    '',
    '- Tratar todos os passageiros com cordialidade e respeito',
    '- Manter comunicação clara e educada',
    '- Cumprir as regras de trânsito e as políticas da plataforma',
    '- Garantir uma experiência segura e confortável',
    '',
    'A reputação é um dos principais critérios para permanência ativa na plataforma. Caso a média de avaliações continue abaixo do padrão mínimo estabelecido, sua conta poderá ser suspensa temporariamente ou, em casos de reincidência, banida permanentemente.',
    '',
    'Nosso objetivo é apoiar você na melhoria contínua. Recomendamos a leitura completa dos Termos e Condições em [link] e a adoção imediata das boas práticas exigidas.',
    '',
    'Contamos com seu comprometimento para manter um ambiente profissional, seguro e respeitoso para todos.',
    '',
    'Se precisar de orientação, estamos à disposição.',
    '',
    'Atenciosamente,',
    'Equipe Buenos Drivers',
  ].join('\n');
}

class MessagesService {
  async listConversationsForAdmin() {
    return MessagesRepository.listConversationsForAdmin();
  }

  async listByDriverId(driverId) {
    return MessagesRepository.listByDriverId(driverId);
  }

  async markThreadReadByAdmin({ driverId }) {
    const updated = await MessagesRepository.markReadByAdmin(driverId);
    if (!updated || updated.length === 0) return { updated: [] };

    const driver = await DriversRepository.getForAdminByDriverId(driverId);
    if (driver?.user_id) {
      sendToUser(driver.user_id, {
        type: 'CHAT_READ',
        driver_id: driverId,
        reader_role: 'ADMIN',
        ids: updated.map((u) => u.id),
        read_at: updated[0]?.read_by_admin_at || null,
      });
    }
    return { updated };
  }

  async markThreadReadByDriver({ driverUserId }) {
    const driver = await DriversRepository.findByUserId(driverUserId);
    if (!driver) {
      throw new Error('DRIVER_NOT_FOUND');
    }

    const updated = await MessagesRepository.markReadByDriver(driver.id);
    if (!updated || updated.length === 0) return { updated: [], driverId: driver.id };

    const admins = await UsersRepository.listAdmins();
    admins.forEach((a) =>
      sendToUser(a.id, {
        type: 'CHAT_READ',
        driver_id: driver.id,
        reader_role: 'DRIVER',
        ids: updated.map((u) => u.id),
        read_at: updated[0]?.read_by_driver_at || null,
      })
    );

    return { updated, driverId: driver.id };
  }

  async listThreadForAdmin(driverId) {
    await this.markThreadReadByAdmin({ driverId });
    return MessagesRepository.listByDriverId(driverId);
  }

  async sendAdminMessage({ adminUserId, driverId, body }) {
    const driver = await DriversRepository.getForAdminByDriverId(driverId);
    if (!driver) {
      throw new Error('DRIVER_NOT_FOUND');
    }

    const message = await MessagesRepository.create({
      driverId,
      senderRole: 'ADMIN',
      systemEvent: null,
      senderUserId: adminUserId,
      receiverUserId: driver.user_id,
      body,
    });

    return message;
  }

  async sendAdminMessageRealtime({ adminUserId, driverId, body }) {
    const message = await this.sendAdminMessage({ adminUserId, driverId, body });

    
    const driver = await DriversRepository.getForAdminByDriverId(driverId);
    const admins = await UsersRepository.listAdmins();

    const payload = {
      type: 'CHAT_MESSAGE',
      driver_id: driverId,
      message,
    };

    if (driver?.user_id) sendToUser(driver.user_id, payload);
    admins.forEach((a) => sendToUser(a.id, payload));

    return message;
  }

  async sendDriverMessageRealtime({ driverUserId, body }) {
    const driver = await DriversRepository.findByUserId(driverUserId);
    if (!driver) {
      throw new Error('DRIVER_NOT_FOUND');
    }

    const admins = await UsersRepository.listAdmins();
    const primaryAdmin = admins[0];

    const message = await MessagesRepository.create({
      driverId: driver.id,
      senderRole: 'DRIVER',
      systemEvent: null,
      senderUserId: driverUserId,
      receiverUserId: primaryAdmin?.id || null,
      body,
    });

    const payload = {
      type: 'CHAT_MESSAGE',
      driver_id: driver.id,
      message,
    };

    
    sendToUser(driverUserId, payload);
    admins.forEach((a) => sendToUser(a.id, payload));

    return message;
  }

  async listThreadForDriverUser(driverUserId) {
    const driver = await DriversRepository.findByUserId(driverUserId);
    if (!driver) {
      throw new Error('DRIVER_NOT_FOUND');
    }
    return MessagesRepository.listByDriverId(driver.id);
  }

  async sendSystemMessageRealtime({ driverId, systemEvent, body, receiverUserId }) {
    const admins = await UsersRepository.listAdmins();

    const message = await MessagesRepository.create({
      driverId,
      senderRole: 'SYSTEM',
      systemEvent,
      senderUserId: null,
      receiverUserId: receiverUserId || null,
      body,
    });

    const payload = {
      type: 'CHAT_MESSAGE',
      driver_id: driverId,
      message,
    };

    
    if (receiverUserId) sendToUser(receiverUserId, payload);
    admins.forEach((a) => sendToUser(a.id, payload));

    return message;
  }

  buildSystemMessageBody({ systemEvent, driverName, documents, now }) {
    const localDeEnvio = 'Conta > Enviar documentos';
    const docs = Array.isArray(documents) ? documents : [];
    const evt = String(systemEvent || '').trim();
    const today = now instanceof Date ? now : new Date();

    if (evt === 'BAN' || evt === 'BAN_DOCS') {
      const expiredDocs = docs.filter((d) => {
        const exp = daysUntil(d.expires_at, today);
        return Number.isFinite(exp) && exp <= 0;
      });
      return buildBanDocsTemplate({
        driverName: driverName || 'Motorista',
        expiredDocs,
        localDeEnvio,
      });
    }

    if (evt === 'DOC_EXPIRING') {
      const expiringDocs = docs.filter((d) => {
        const dd = daysUntil(d.expires_at, today);
        return Number.isFinite(dd) && dd > 0 && dd <= 14;
      });
      return buildDocsExpiringTemplate({
        driverName: driverName || 'Motorista',
        expiringDocs,
        now: today,
        localDeEnvio,
      });
    }

    if (evt === 'REPUTATION_SUSPEND') {
      return buildReputationSuspendTemplate({
        driverName: driverName || 'Motorista',
        startDate: today,
      });
    }

    if (evt === 'REPUTATION_WARNING') {
      return buildReputationWarningTemplate({
        driverName: driverName || 'Motorista',
      });
    }

    return 'Situação regularizada. Sua conta está liberada para operar.';
  }
}

export default new MessagesService();

