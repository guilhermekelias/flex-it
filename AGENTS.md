# FlexIt TCC - Instruções para Codex

## Contexto do projeto

O projeto FlexIt PWA é um Trabalho de Conclusão de Curso de Engenharia de Software.

Objetivo:
Criar uma plataforma inteligente para profissionais de saúde e treinamento gerenciarem alunos, treinos, dietas, métricas corporais e evolução física.

Público-alvo:
Profissionais como personal trainers, nutricionistas, coaches e profissionais de saúde/treinamento que precisam acompanhar alunos/clientes.

Stack atual:
- Frontend: Preact + Vite + TypeScript
- Backend: Node.js + NestJS + TypeScript
- Banco de dados: PostgreSQL
- ORM: TypeORM
- Infra local: Docker
- Qualidade: Jest, SonarCloud/SonarQube, GitHub Actions
- Arquitetura: modular monolítica, com separação por domínios

Estrutura atual:
- backend/
  - src/users
  - src/students
  - src/main.ts
  - src/app.module.ts
- frontend/
  - src/app.tsx
  - src/components
  - src/services/api.ts
  - src/types

## Funcionalidades já implementadas

Sprint 1 já contém:
- Login básico de usuário profissional
- Persistência local de sessão
- Dashboard inicial
- Cadastro de aluno
- Listagem de alunos
- Remoção de alunos
- Integração frontend + backend
- PostgreSQL rodando via Docker
- Configuração inicial de API service no frontend
- Uso de variáveis de ambiente para URL da API e CORS

## Próximas funcionalidades desejadas

Sprint 2 deve evoluir o projeto com foco em:
1. Melhorar frontend seguindo o layout/referência do Figma:
   - https://www.figma.com/make/TkHE5n3X3TopRH4WHdZkFD/Mobile-PWA-Gym-App?t=Kl9TKJsFS78cXKnT-1

2. Melhorar arquitetura do frontend:
   - separar páginas
   - separar componentes
   - evitar código duplicado
   - manter services para chamadas HTTP
   - manter types compartilhados

3. Implementar ou preparar:
   - edição de alunos
   - autenticação com JWT
   - proteção de rotas
   - módulos futuros: treinos, métricas e dietas
   - dashboard mais próximo de um app profissional

4. Melhorar qualidade:
   - criar ou atualizar testes unitários
   - rodar testes antes de finalizar
   - rodar lint/build se disponível
   - revisar impacto das alterações
   - não quebrar funcionalidades existentes

## Regras importantes

- Não remover funcionalidades já implementadas sem justificar.
- Não alterar stack principal sem pedir confirmação.
- Não substituir Preact por React sem necessidade.
- Não criar dependências pesadas sem justificar.
- Não colocar URLs fixas diretamente no código.
- Usar variáveis de ambiente quando necessário.
- Não expor senhas em respostas da API.
- Manter compatibilidade com o fluxo atual:
  - frontend em http://localhost:5173
  - backend em http://localhost:3000
  - PostgreSQL via Docker
- Preservar organização modular do NestJS.
- Preservar TypeScript.
- Priorizar código simples, legível e fácil de explicar no TCC.

## Critérios de aceite gerais

Antes de finalizar qualquer tarefa:
- O projeto deve continuar rodando localmente.
- Frontend deve compilar.
- Backend deve subir sem erro.
- Fluxo de login deve continuar funcionando.
- CRUD de alunos deve continuar funcionando.
- Código deve estar organizado e sem duplicação desnecessária.
- Testes relevantes devem ser criados ou atualizados quando aplicável.
- Descrever no final:
  - arquivos alterados
  - o que foi implementado
  - como testar
  - riscos ou pontos pendentes

## Comandos úteis

###Backend:
```bash
#cd backend
#npm install
#npm run start:dev
#npm test


##Frontend:
#cd frontend
#npm install
#npm run dev
#npm run build

#Docker
#docker start flexit-postgres
#docker ps

#Essa seção serve para o Codex saber **quais comandos usar para rodar e testar o projeto**.