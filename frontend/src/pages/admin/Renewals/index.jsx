import React from "react";
import "./styles.css";

export default function AdminRenewals() {
  return (
    <div className="admin-renewals">
      <div className="admin-renewals-hero">
        <div className="admin-renewals-badge">Em breve</div>
        <h1>Renovação</h1>
        <p>
          Aqui você vai ver todos os motoristas que solicitaram renovação de
          documentos, com filtros por situação e atalhos para enviar mensagens.
        </p>
      </div>

      <div className="admin-renewals-card">
        <div className="admin-renewals-card-icon" aria-hidden="true">
          ⏱
        </div>
        <div className="admin-renewals-card-content">
          <strong>Em desenvolvimento</strong>
          <span>
            Assim que ativarmos essa etapa, esta tela será integrada aos dados
            reais do banco e ao sistema de mensagens.
          </span>
        </div>
      </div>
    </div>
  );
}

