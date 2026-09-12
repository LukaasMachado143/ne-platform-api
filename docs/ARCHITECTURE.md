# Arquitetura

## Decisões vigentes

- O backend é desenvolvido com NestJS e TypeScript.
- A aplicação adota uma arquitetura de monólito modular.
- O banco de dados é PostgreSQL hospedado no Neon, acessado por meio do Prisma.
- IDs de domínio devem usar UUID.
- Datas devem ser persistidas em UTC.
- `/api/v1` é a fronteira pública, versionada e estável da aplicação.
- Cada módulo deve respeitar os limites do seu domínio e reduzir o acoplamento com os demais.
- Serviços podem ser extraídos no futuro quando houver necessidade concreta.
- Nesse cenário futuro, `ne-platform-api` poderá assumir o papel de BFF/Gateway.
- Microserviços e comunicação distribuída não devem ser introduzidos sem necessidade concreta.
- Abstrações prematuras devem ser evitadas; a estrutura deve crescer conforme os requisitos reais.
