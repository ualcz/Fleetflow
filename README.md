# FleetFlow — Plataforma de Gestão e Análise de Frotas

> Um sistema full-stack de gestão de frotas para gerenciar veículos, motoristas, viagens, registros de manutenção e consumo de combustível — com painel de métricas e análises operacionais.

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Visão Geral da Arquitetura](#2-visão-geral-da-arquitetura)
3. [Tecnologias Utilizadas](#3-tecnologias-utilizadas)
4. [Como Iniciar](#4-como-iniciar)
5. [Arquitetura do Backend](#5-arquitetura-do-backend)
6. [Modelo de Dados](#6-modelo-de-dados)
7. [Modelo de Estados e Fluxo](#7-modelo-de-estados-e-fluxo)
8. [Autenticação & Autorização](#8-autenticação--autorização)
9. [Arquitetura do Frontend](#9-arquitetura-do-frontend)
10. [Referência da API](#10-referência-da-api)
11. [Camada de Regras de Negócio](#11-camada-de-regras-de-negócio)
12. [Relatórios e Métricas](#12-relatórios-e-métricas)
13. [Validação & Tratamento de Erros](#13-validação--tratamento-de-erros)
14. [Filosofia de Design](#14-filosofia-de-design)
15. [Melhorias Futuras](#15-melhorias-futuras)

---

## 1. Visão Geral do Projeto

O FleetFlow é um sistema completo de gerenciamento de frotas construído com Node.js, Express, Prisma e MySQL no backend, e React + Vite + Zustand no frontend.

O sistema segue uma **arquitetura modular no backend** acoplada a um painel frontend em React, garantindo separação clara entre interface de usuário, regras de negócio e persistência de dados. **O frontend nunca se comunica diretamente com o banco de dados** — todas as operações trafegam exclusivamente pela API do backend.

### Recursos Principais

- Gestão do ciclo de vida dos veículos — acompanhamento de status, capacidade e alocações
- Gestão de motoristas — CNH, validade, prontidão e alocação de viagens
- Despacho de viagens — fluxo completo de `RASCUNHO → DESPACHADA` com validações de segurança
- Registros de manutenção — associação de serviços de oficina a veículos específicos
- Registros de combustível — controle de abastecimento e consumo por veículo
- Relatórios e métricas operacionais — dados calculados no servidor para o painel em tempo real

---

## 2. Visão Geral da Arquitetura

O FleetFlow adota a clássica **arquitetura cliente-servidor em três camadas**:

```
Frontend (React + Zustand + Axios)
            │
            ▼
Backend API (Express + Prisma)
            │
            ▼
    Banco MySQL
```

### Princípios de Design

- O **frontend** é um cliente desacoplado — renderiza telas e consome endpoints da API
- O **backend** é a única camada autorizada a acessar o banco de dados
- As **regras de negócio** ficam centralizadas na camada de serviços (`services`)
- O **Prisma ORM** gerencia todas as operações com o banco com segurança de tipos
- O **controle de acesso baseado em papéis (RBAC)** protege todos os endpoints da API

### Ciclo de Vida de uma Requisição

```
Ação do Usuário (React UI)
      │
      ▼  Requisição Axios com Token JWT
      │
      ▼  Middleware de Autenticação Express
      │
      ▼  Definição de Rotas (Routes)
      │
      ▼  Controller  (interpreta parâmetros, valida e responde)
      │
      ▼  Camada de Serviços (regras de negócio + transações)
      │
      ▼  Prisma ORM
      │
      ▼  Banco MySQL
      │
      ▼  Resposta padronizada: { success, message, data }
```

---

## 3. Tecnologias Utilizadas

### Backend

| Pacote / Ferramenta | Finalidade |
|---|---|
| Node.js | Ambiente de execução JavaScript |
| Express | Framework HTTP e middlewares |
| Prisma ORM | Mapeador objeto-relacional com tipagem estrita |
| MySQL | Banco de dados relacional |
| Zod | Validação de esquemas e dados de entrada |
| jsonwebtoken | Emissão e validação de tokens JWT |
| bcryptjs | Criptografia e hashing seguro de senhas |

### Frontend

| Pacote / Ferramenta | Finalidade |
|---|---|
| React | Biblioteca para construção de interfaces |
| Vite | Ferramenta moderna e ultra-rápida de build |
| Zustand | Gerenciamento de estado global leve e reativo |
| Axios | Cliente HTTP com suporte a interceptores |
| Tailwind CSS | Estilização utilitária |
| Recharts | Gráficos e visualizações de dados analíticos |
| Lucide React | Ícones vetoriais modernos |

---

## 4. Como Iniciar

### Pré-requisitos

- Node.js v18+
- MySQL 8+
- npm ou yarn

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="mysql://root@localhost:3306/fleetflow"
JWT_SECRET="sua-chave-secreta-longa-e-segura"
JWT_EXPIRES_IN="7d"
PORT=5000
```

Se o usuário `root` do MySQL tiver senha, inclua-a na URL: `mysql://root:sua_senha@localhost:3306/fleetflow`.

### Inicialização do Backend

```bash
# Instalar dependências
npm install

# Aplicar as migrações MySQL no banco local
npx prisma migrate dev

# Iniciar o servidor em modo de desenvolvimento
npm run dev
```

### Inicialização do Frontend

```bash
cd fleetflow-frontend
npm install
npm run dev
```

O frontend será executado em `http://localhost:5173` e consumirá o backend em `http://localhost:5000`.

---

## 5. Arquitetura do Backend

O backend está organizado em **módulos por funcionalidade**. Cada módulo concentra rotas, controladores e serviços:

```
Rotas (Routes) → Controladores (Controllers) → Serviços (Services) → Prisma
```

### Módulos

| Módulo | Domínio de Responsabilidade |
|---|---|
| `auth` | Cadastro, login, emissão de JWT e verificação de senhas |
| `vehicles` | CRUD e controle de status de veículos da frota |
| `drivers` | Cadastro de condutores, controle de CNH e score de segurança |
| `trips` | Criação, despacho, conclusão e cancelamento de viagens |
| `maintenance` | Histórico e ordem de serviços de manutenção por veículo |
| `fuel` | Histórico e registros de abastecimento |
| `analytics` | Métricas operacionais agregadas, ROI e desempenho |

---

## 6. Modelo de Dados

O modelo de dados é gerenciado através do Prisma em `prisma/schema.prisma`.

### Entidades Principais

| Entidade | Descrição | Campos Chave |
|---|---|---|
| `User` | Autenticação e permissões | id, email, password, role |
| `Vehicle` | Veículos da frota | id, name, licensePlate, maxCapacity, odometer, status |
| `Driver` | Condutores | id, name, licenseNumber, licenseExpiry, safetyScore, status |
| `Trip` | Viagens vinculando veículo e motorista | id, vehicleId, driverId, status, cargoWeight, revenue |
| `MaintenanceLog` | Ordens de manutenção | id, vehicleId, description, cost, date, completed |
| `FuelLog` | Abastecimentos | id, vehicleId, liters, cost, date |

---

## 7. Modelo de Estados e Fluxo

O FleetFlow utiliza **enums** para controlar rigorosamente os estados de veículos, motoristas e viagens:

| Enum | Valores |
|---|---|
| `Role` | `MANAGER` (Gerente), `DISPATCHER` (Despachante), `SAFETY` (Segurança), `FINANCE` (Financeiro) |
| `VehicleStatus` | `AVAILABLE` (Disponível), `ON_TRIP` (Em Viagem), `IN_SHOP` (Em Oficina), `RETIRED` (Inativo) |
| `DriverStatus` | `ON_DUTY` (Em Serviço), `ON_TRIP` (Em Viagem), `OFF_DUTY` (Fora de Serviço), `SUSPENDED` (Suspenso) |
| `TripStatus` | `DRAFT` (Rascunho), `DISPATCHED` (Despachada), `COMPLETED` (Concluída), `CANCELLED` (Cancelada) |

### Transição de Despacho Atômica

```
Viagem:     DRAFT      ──►  DISPATCHED
Veículo:    AVAILABLE  ──►  ON_TRIP
Motorista:  ON_DUTY    ──►  ON_TRIP
```

Todas as três atualizações são realizadas dentro de uma **única transação atômica do Prisma** — garantindo consistência total no banco.

---

## 8. Autenticação & Autorização

1. O usuário envia credenciais para `POST /api/auth/login`.
2. A senha criptografada é validada com `bcrypt.compare()`.
3. É gerado um token JWT contendo `{ userId, role }`.
4. O frontend armazena o token via Zustand / localStorage e o anexa em todas as requisições (`Bearer <token>`).
5. No backend, o middleware `authorizeRoles` protege as rotas verificando se o usuário possui os papéis autorizados.

---

## 9. Tratamento de Erros e Validação

- Todas as entradas da API são validadas com esquemas **Zod** em `src/validators/schemas.js`.
- Erros assíncronos são capturados pelo utilitário `catchAsync`.
- O middleware `errorHandler.js` intercepta erros do Prisma, JWT e validações, retornando respostas padronizadas em português com códigos HTTP apropriados.
