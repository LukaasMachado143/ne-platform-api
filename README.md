# N&E Platform API

Fundação técnica da API pública da N&E Platform, construída com NestJS, TypeScript, PostgreSQL e Prisma.

## Pré-requisitos

- Node.js 22 ou superior
- pnpm 10 ou superior
- Uma instância PostgreSQL (o ambiente oficial utiliza Neon)

## Instalação

```bash
pnpm install
```

## Configuração

Copie `.env.example` para `.env` e informe a conexão com o banco e a origem permitida pelo CORS:

```env
DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

Mais de uma origem pode ser informada em `CORS_ORIGIN`, separada por vírgulas.

## Execução local

```bash
pnpm start:dev
```

A API fica disponível, por padrão, em `http://localhost:3000/api/v1`.

## Comandos

```bash
pnpm build             # compila a aplicação
pnpm start:prod        # executa o build de produção
pnpm lint              # verifica o código com ESLint
pnpm test              # executa os testes unitários
pnpm prisma:generate   # gera o Prisma Client
pnpm prisma:migrate    # cria e aplica migrations no ambiente de desenvolvimento
pnpm prisma:seed       # aplica os dados iniciais de forma idempotente
```

Após alterar o schema do Prisma, execute `pnpm prisma:generate`. O schema está em `prisma/schema.prisma`. Configure `DATABASE_URL` antes de executar migrations ou o seed.

## Health check

```http
GET /api/v1/health
```

Resposta esperada:

```json
{
  "status": "ok"
}
```

As decisões estruturais do projeto estão registradas em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
