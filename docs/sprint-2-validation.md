# Validação da Sprint 2 - FlexIt

## Comandos executados

- `cd backend && npm test`
- `cd frontend && npm run build`
- `cd backend && npm run build`
- `docker ps --filter "name=flexit-postgres"`

## Resultados

### Backend tests
- Test Suites: 6 passed, 6 total
- Tests: 26 passed, 26 total

### Frontend build
- `tsc -b && vite build`
- Build executado com sucesso

### Backend build
- `nest build`
- Build executado com sucesso

### Banco local
- Container `flexit-postgres` em execução
- Porta `5433->5432`

## Fluxos validados

- Login com JWT
- Logout
- Token salvo em `flexit_token`
- Rotas de alunos protegidas com JWT
- CRUD de alunos: criar, listar, editar e remover
- Navegação por abas
- Telas visuais de Treinos, Dietas e Métricas

## Pontos de atenção

- CORS, porta e banco ainda podem ser melhorados com variáveis de ambiente
- Frontend ainda não possui script de teste/lint
- Senha ainda está em texto puro, devendo evoluir futuramente para hash
- Testes e2e ainda não foram implementados

## Conclusão

A Sprint 2 está pronta para validação manual e apresentação, com testes e builds passando.