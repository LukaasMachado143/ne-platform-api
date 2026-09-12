# Identidade

```text
Organization
├── Role
└── User ── pertence a uma Role da mesma Organization
```

`Organization` delimita os usuários e as classificações de acesso. Nesta fase existe uma única organização, `N&E Bartenders`, mas a integridade dos dados preserva esse limite para crescimento futuro.

## Estados do User

- `PENDING_ACTIVATION`: criado internamente e ainda não ativado.
- `ACTIVE`: ativo para uso da plataforma.
- `INACTIVE`: acesso desativado internamente.

Transições permitidas:

```text
PENDING_ACTIVATION -> ACTIVE
PENDING_ACTIVATION -> INACTIVE
ACTIVE             -> INACTIVE
INACTIVE           -> ACTIVE
```

`User` não contém credenciais nem dados específicos de provedores. Senha e Google poderão autenticar a mesma identidade em fases futuras, sem controlar seu ciclo de vida ou sua autorização.
