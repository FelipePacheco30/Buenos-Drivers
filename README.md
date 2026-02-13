# Buenos Drivers

Aplicação **mobile-first** (responsiva) para gerenciamento de corridas/entregas com 3 perfis: **USER**, **DRIVER** e **ADMIN**.

O projeto já nasce com **integração real** com o backend (Express + PostgreSQL) e suporte a **WebSocket** para chat e atualizações em tempo real.

## Visão geral (o que existe hoje)

- **Autenticação**: login por email/senha; token simples (para dev) com **Bearer `<userId>`**.
- **Motorista (DRIVER)**:
  - `/driver`: home com simulação de viagens/entregas e mapa (OSRM).
  - `/driver/account`: perfil com reputação real, documentos e veículos; avaliações negativas (somente leitura).
  - `/driver/renewals`: envio de atualização de documentos vencidos/próximos e solicitação de adição de veículo (vai para o admin).
  - `/driver/messages`: chat direto com a administração (sem “lista intermediária”).
  - `/driver/wallet`: saldo e últimas corridas; saque (fluxo estético + endpoint real).
- **Admin (ADMIN)**:
  - `/admin`: dashboard com cards/estética argentina (mock de métricas).
  - `/admin/drivers`: lista + detalhe do motorista (documentos, veículos, avaliações negativas com exclusão).
  - `/admin/requests`: solicitações para virar motorista (mock, com validação local).
  - `/admin/messages`: inbox e chat com motoristas (tempo real).
  - `/admin/renewals`: lista/detalhe/aprovação de renovações (tempo real).
- **Tempo real (WebSocket)**:
  - chat (`CHAT_MESSAGE`) + leitura (`CHAT_READ`)
  - renovações (`RENEWAL_CREATED`, `RENEWAL_UPDATED`, `RENEWAL_APPROVED`)
  - carteira/perfil (`WALLET_UPDATED`, `PROFILE_UPDATED`, `REVIEWS_UPDATED`)
- **Jobs automáticos**:
  - `documentExpirationJob`: recalcula status de documentos, ajusta status do usuário e garante mensagens automáticas (banido/irregular/reputação).
  - `renewalCleanupJob`: limpeza de renovações antigas (retenção de 7 dias).

## Paleta e UI/UX (regras do projeto)

- **Azul principal**: `#75aadb`
- **Branco**: `#ffffff`
- **Amarelo destaque**: `#fcbf45`
- **Mobile-first** e altamente responsivo.
- Evitar aparência “tutorial”/genérica: UI profissional, clara e distinta.

## Stack

### Frontend
- **React 18** + **React Router DOM**
- **Vite** (dev server e build)
- **React-Leaflet + Leaflet** (mapa)
- **react-icons** (ícones)

### Backend
- **Node.js** + **Express**
- **PostgreSQL**
- **ws** (WebSocket)

### Infra/Dev
- **Docker Compose** com Postgres + backend + frontend (Nginx servindo o build)

## Estrutura de pastas (principal)

```text
.
├─ backend/
│  ├─ src/
│  │  ├─ config/            # database, env, websocket
│  │  ├─ jobs/              # jobs agendados (documentos, retenção)
│  │  ├─ middlewares/       # auth/role
│  │  ├─ modules/           # domínios (auth, drivers, messages, renewals, wallet, etc.)
│  │  ├─ routes/            # rotas HTTP (Express Router)
│  │  └─ server.js          # bootstrap HTTP + WS + jobs
│  ├─ Dockerfile
│  └─ Dockerfile.dev
├─ frontend/
│  ├─ src/
│  │  ├─ assets/            # imagens/ícones
│  │  ├─ components/        # componentes comuns (Sidebar, DriverMap, etc.)
│  │  ├─ context/           # AuthContext e afins
│  │  ├─ hooks/             # useWebSocket (singleton), useAuth, etc.
│  │  ├─ layouts/           # DriverLayout/AdminLayout/AuthLayout
│  │  ├─ pages/             # telas (admin/driver/auth)
│  │  ├─ routes/            # rotas do app (PrivateRoute, etc.)
│  │  ├─ services/          # api/services (fetch + token)
│  │  └─ utils/             # helpers
│  ├─ Dockerfile
│  └─ Dockerfile.dev
├─ db/
│  └─ init.sql              # schema + seed usado pelo docker-compose.yml
├─ database/
│  ├─ migrations/           # migrations SQL (histórico)
│  └─ seeds/                # seeds SQL (histórico)
├─ docker-compose.yml       # stack completo (pg + api + web)
└─ docker-compose.dev.yml   # dev (hot reload) — requer DB externo
```

## Como rodar (recomendado) — Docker Compose (stack completo)

Pré-requisitos:
- Docker Desktop

Subir tudo:

```bash
docker compose up --build
```

Acessos:
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:3333/health`
- **Postgres**: `localhost:5432` (user/pass/db: `buenos` / `buenos` / `buenos`)

Reset completo (apaga volume do banco):

```bash
docker compose down -v
docker compose up --build
```

## Rodar em modo DEV (hot reload)

O `docker-compose.dev.yml` sobe **frontend + backend** com hot reload, mas **não inclui Postgres**.
Você precisa fornecer um Postgres (local/externo) e um `.env` na raiz (referenciado pelo compose dev).

```bash
docker compose -f docker-compose.dev.yml up --build
```

Frontend DEV (Vite): `http://localhost:5173`

## Autenticação

- Endpoint: `POST /auth/login`
- O backend retorna:
  - `token`: **o próprio `user.id`** (apenas para dev)
  - `user`: `{ id, name, email, role, status, city, reputation_score }`
- O frontend armazena sessão em **`sessionStorage`** (com fallback para `localStorage`).

Header padrão:

```http
Authorization: Bearer <userId>
```

## WebSocket (tempo real)

- URL padrão no frontend: `ws://localhost:3333/ws?user_id=<uuid>`
- O servidor registra o cliente pelo `user_id` e entrega eventos direcionados por usuário/role.

Eventos principais:
- **Chat**
  - `CHAT_MESSAGE` `{ driver_id, message }`
  - `CHAT_READ` `{ driver_id, reader_role, ids, read_at }`
- **Renovações**
  - `RENEWAL_CREATED` (para ADMINs)
  - `RENEWAL_UPDATED` (para ADMINs)
  - `RENEWAL_APPROVED` (para o DRIVER específico)
- **Financeiro/Perfil**
  - `WALLET_UPDATED`
  - `PROFILE_UPDATED`
  - `REVIEWS_UPDATED`

## Regras de negócio (resumo)

### Status do motorista
- `ACTIVE`: tudo ok
- `IRREGULAR`: documentos próximos do vencimento
- `BANNED`: documentação vencida **ou** reputação abaixo do mínimo

### Documentos
Tipos:
- `CNH`
- `CRLV` (associado a um veículo)
- `CRIMINAL_RECORD`

Status:
- `VALID`
- `EXPIRING` (até 14 dias para vencer)
- `EXPIRED`

### Veículos
- Cada motorista tem **1 a 2** veículos (`CAR`/`MOTO`) com `brand`, `model`, `year`, `color`, `plate`.
- O limite é reforçado no backend.
- Se o motorista tiver **mais de 1 veículo**, o app exige seleção antes de iniciar uma corrida.

### Renovações (driver → admin)
- Driver cria solicitação em `/driver/renewals` (frontend) → `POST /driver/renewals` (backend).
- Admin vê em `/admin/renewals` → valida → aprova em `POST /admin/renewals/:renewalId/approve`.
- Atualizações são propagadas via WebSocket.
- Retenção: solicitações antigas são removidas automaticamente (job de 7 dias).

### Carteira e viagens
- Simulação cria/fecha viagem e credita carteira.
- A plataforma cobra **25%** (crédito líquido).
- Endpoints:
  - `POST /trips/start`
  - `POST /trips/finish`
  - `GET /driver/wallet`
  - `POST /driver/wallet/withdraw`

### Mensagens automáticas (SYSTEM)

O sistema envia mensagens automáticas para motoristas:
- com conta **banida/irregular** (docs)
- com **reputação baixa**:
  - **Aviso preventivo**: 4.0 ≤ reputação < 4.5 (`REPUTATION_WARNING`)
  - **Suspensão**: reputação < 4.0 (`REPUTATION_SUSPEND`)

Essas mensagens são geradas pelo `documentExpirationJob` e aparecem no chat como mensagens do `SYSTEM`.

## API (principais rotas)

Base URL: `http://localhost:3333`

- **Auth**
  - `POST /auth/login`
- **Driver**
  - `GET /drivers/me`
  - `GET /documents`, `POST /documents`
  - `GET /vehicles`, `POST /vehicles`
  - `GET /driver/messages`, `POST /driver/messages`, `POST /driver/messages/read`
  - `GET /driver/wallet`, `POST /driver/wallet/withdraw`
  - `POST /driver/renewals`
- **Admin**
  - `GET /admin/drivers`, `GET /admin/drivers/:driverId`
  - `GET /admin/messages`, `GET /admin/messages/:driverId`, `POST /admin/messages/:driverId`
  - `POST /admin/messages/:driverId/system` (mensagem automática)
  - `GET /admin/renewals`, `GET /admin/renewals/:renewalId`, `POST /admin/renewals/:renewalId/approve`

## Mapa e rotas (OSRM)

Para simulação realista de deslocamento, o frontend consulta:
- `https://router.project-osrm.org/nearest` (snap para rua)
- `https://router.project-osrm.org/route` (rota)

## Dados iniciais (seed)

No Docker (`docker-compose.yml`), o banco é inicializado a partir de:
- `db/init.sql`

Ele cria schema e popula dados (users/drivers/docs/vehicles/mensagens/trips/carteira/avaliações negativas/renovações).

## Troubleshooting

### “Mensagens automáticas não chegam”
- Em ambiente Docker, aguarde o Postgres ficar pronto. O backend possui pré-check e execução com retry no startup.
- Verifique logs do backend:

```bash
docker compose logs --tail 200 backend
```

### Build do Docker falhando
- Limpe caches do Docker/BuildKit (se necessário) e tente novamente:
  - `docker builder prune`
  - `docker buildx prune`
  - `docker system prune`

## Segurança (nota importante)

O token atual é o próprio `user.id` (UUID) e não deve ser usado em produção. É intencional para acelerar o desenvolvimento e testes locais.
