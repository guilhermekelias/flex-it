# Flex-It

O **Flex-It** e uma aplicacao web/PWA desenvolvida como Trabalho de Conclusao de Curso em Engenharia de Software para auxiliar profissionais da area fitness, saude e bem-estar na gestao e no acompanhamento de alunos/clientes.

A plataforma centraliza informacoes importantes do acompanhamento profissional, permitindo gerenciar alunos, cadastrar treinos, registrar planos alimentares, acompanhar metricas corporais e manter comunicacao entre profissional e aluno. Para o aluno, o sistema oferece um portal proprio para consultar treinos, dietas, metricas e mensagens.

## Aplicacao em producao

A aplicacao publicada pode ser acessada em:

**https://flex-it.online/**

## Principais funcionalidades

- Autenticacao de usuarios com perfis de profissional e aluno.
- Dashboard do profissional com resumo dos principais dados do acompanhamento.
- Cadastro, listagem, edicao, visualizacao e remocao de alunos.
- Cadastro e acompanhamento de treinos por aluno.
- Cadastro e acompanhamento de planos alimentares.
- Registro e visualizacao de metricas corporais.
- Portal do aluno para consulta de treinos, dietas, metricas e comunicacao.
- Comunicacao entre profissional e aluno por mensagens vinculadas ao acompanhamento.
- Interface responsiva com foco em uso mobile-first.
- Estrutura de aplicacao web/PWA voltada ao uso em dispositivos moveis.

## Tecnologias utilizadas

### Frontend

- Preact
- Vite
- TypeScript
- CSS
- Vitest

### Backend

- Node.js
- NestJS
- TypeScript
- TypeORM
- API REST
- Autenticacao com JWT
- Jest

### Banco de dados

- PostgreSQL

### Infraestrutura

- Docker
- Docker Compose
- Nginx
- AWS EC2
- GitHub Container Registry

### Qualidade e CI/CD

- GitHub Actions
- SonarCloud
- Jest
- Vitest
- Relatorios de cobertura em LCOV

### Monitoramento

- New Relic configurado no backend para o ambiente de producao.

## Estrutura do projeto

```txt
flex-it/
|-- backend/              # API backend em NestJS, TypeScript e TypeORM
|-- frontend/             # Aplicacao frontend em Preact, Vite e TypeScript
|-- deploy/               # Arquivos, templates e instrucoes de deploy
|-- docs/                 # Documentacoes auxiliares do projeto
|-- scripts/              # Scripts de apoio, como normalizacao de cobertura
|-- .github/              # Workflows de CI/CD no GitHub Actions
|-- DOCUMENTACAO_USO.md   # Roteiro de uso, validacao e avaliacao academica
|-- USUARIOS_TESTE.md     # Usuarios de teste para avaliacao do sistema
`-- README.md             # Documentacao principal do repositorio
```

## Como rodar localmente

### Pre-requisitos

- Node.js instalado.
- npm instalado.
- PostgreSQL disponivel localmente ou via Docker.
- Docker instalado, caso o banco seja executado em container.

### 1. Instalar dependencias

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

### 2. Configurar variaveis de ambiente

O projeto usa variaveis de ambiente para configurar banco, CORS, JWT, URL da API e dados de producao.

Para desenvolvimento local, configure os arquivos `.env` conforme a sua maquina, sem versionar senhas, tokens ou chaves reais. As variaveis mais importantes sao:

Backend:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=seu_usuario_local
DB_PASSWORD=sua_senha_local
DB_DATABASE=flexit
DB_SYNCHRONIZE=true
JWT_SECRET=sua_chave_local
JWT_EXPIRES_IN=1h
```

Frontend:

```env
VITE_API_URL=/api
```

Os exemplos de variaveis para producao ficam em `deploy/env/`:

- `deploy/env/backend.production.env.example`
- `deploy/env/compose.production.env.example`
- `deploy/env/postgres.production.env.example`

### 3. Subir ou iniciar o banco de dados

Em ambiente local, o backend esta preparado para usar PostgreSQL em `localhost`, normalmente na porta `5433`. Caso o container local `flexit-postgres` ja exista, ele pode ser iniciado com:

```bash
docker start flexit-postgres
```

Se estiver usando outro container ou uma instalacao local do PostgreSQL, ajuste as variaveis `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` e `DB_DATABASE`.

### 4. Rodar o backend

```bash
cd backend
npm run start:dev
```

Por padrao, a API fica disponivel em:

```txt
http://localhost:3000
```

### 5. Rodar o frontend

```bash
cd frontend
npm run dev
```

Por padrao, o Vite disponibiliza a aplicacao em:

```txt
http://localhost:5173
```

No ambiente de desenvolvimento, o frontend usa proxy para encaminhar chamadas de `/api` ao backend local.

## Scripts principais

### Backend

```bash
npm run start:dev   # inicia a API em modo desenvolvimento
npm run build       # compila o backend
npm test            # executa testes unitarios com Jest
npm run test:cov    # executa testes com cobertura
npm run lint        # executa ESLint com correcao automatica
```

### Frontend

```bash
npm run dev            # inicia o servidor de desenvolvimento Vite
npm run build          # compila TypeScript e gera build de producao
npm test               # executa testes com Vitest
npm run test:coverage  # executa testes com cobertura
npm run preview        # serve localmente o build gerado
```

Observacao: no `package.json` atual do frontend nao ha script especifico de lint.

## Testes e qualidade

O projeto possui testes automatizados no backend e no frontend.

Backend:

```bash
cd backend
npm test
npm run test:cov
```

Frontend:

```bash
cd frontend
npm test
npm run test:coverage
```

A analise de qualidade e cobertura esta configurada com SonarCloud em:

- `sonar-project.properties`
- `.github/workflows/sonarcloud.yml`

O workflow executa testes com cobertura no backend e no frontend antes da analise do SonarCloud.

## Deploy

O deploy de producao e realizado em ambiente AWS EC2 usando Docker, Docker Compose e Nginx. O Nginx atua como gateway publico, encaminhando:

- `/` para o frontend.
- `/api/` para o backend.

As imagens Docker sao publicadas no GitHub Container Registry e o workflow de producao esta em `.github/workflows/production.yml`.

A documentacao detalhada de deploy esta disponivel em:

- `deploy/README.md`

Nenhuma credencial, token, chave SSH ou segredo de producao deve ser versionado no repositorio.

## Documentacao de uso

A documentacao de uso da aplicacao esta disponivel em:

- `DOCUMENTACAO_USO.md`
- `USUARIOS_TESTE.md`
- `docs/`

Esses arquivos contem o roteiro de uso, usuarios de teste, orientacoes para avaliacao academica e validacoes realizadas durante a evolucao do projeto.

## Status do projeto

O Flex-It esta em fase final de desenvolvimento e apresentacao academica. A versao atual ja contempla os principais fluxos de uso para profissional e aluno, mas ainda pode receber ajustes evolutivos, melhorias de experiencia, refinamentos de seguranca e ampliacao de testes.

## Licenca

Este projeto esta licenciado sob a licenca MIT. Consulte o arquivo `LICENSE` para mais detalhes.
