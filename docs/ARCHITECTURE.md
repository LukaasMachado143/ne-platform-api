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

## Identidade organizacional

- `Organization` é a fronteira organizacional dos dados e usuários.
- `User` representa a identidade interna e permanece separado dos mecanismos de autenticação.
- `Role` classifica o nível de acesso do usuário; permissões granulares serão modeladas em uma fase posterior.
- O e-mail é a principal identificação de login e é único dentro de cada Organization.
- Autenticação futura por senha ou Google deve convergir para o mesmo `User`.
- Google nunca controla criação, ativação, desativação, Role ou autorização de usuários.
