# Documentacao de uso - Flex-It

## Link da aplicacao

Aplicacao publicada: https://flex-it.online/

## Objetivo da solucao

O Flex-It e uma PWA voltada ao acompanhamento de alunos/clientes por profissionais de saude, treinamento e bem-estar, como personal trainers, nutricionistas, coaches e profissionais de acompanhamento fisico.

A solucao centraliza informacoes importantes do acompanhamento, permitindo que o profissional gerencie alunos, registre treinos, cadastre planos alimentares, acompanhe metricas corporais e mantenha comunicacao com o aluno. Para o aluno, a aplicacao oferece um portal simples para consultar o que foi prescrito, acompanhar sua evolucao e enviar mensagens ao profissional.

## Perfis de usuario

### Profissional

Perfil usado por quem realiza o acompanhamento dos alunos.

Principais permissoes e funcionalidades:

- acessar o dashboard profissional;
- cadastrar, editar, visualizar e remover alunos;
- abrir o detalhe de cada aluno;
- cadastrar, editar, visualizar e remover treinos;
- cadastrar, editar, visualizar e remover dietas/planos alimentares;
- cadastrar, editar, visualizar e remover metricas corporais;
- enviar mensagens e orientacoes para alunos vinculados.

### Aluno

Perfil usado pelo aluno/cliente acompanhado por um profissional.

Principais permissoes e funcionalidades:

- acessar o portal do aluno;
- visualizar resumo do acompanhamento;
- visualizar treinos cadastrados pelo profissional;
- visualizar dietas/planos alimentares cadastrados pelo profissional;
- visualizar metricas corporais registradas pelo profissional;
- enviar mensagens ao profissional quando existir vinculo com um cadastro de aluno.

## Principais fluxos de uso

### 1. Login

1. Acesse https://flex-it.online/.
2. Informe e-mail e senha.
3. Clique para entrar na aplicacao.
4. Apos autenticacao, a aplicacao direciona automaticamente conforme o perfil:
   - usuarios com perfil `professional` acessam o dashboard profissional;
   - usuarios com perfil `student` acessam o portal do aluno.

Observacao: a sessao autenticada e mantida localmente no navegador. Caso o token expire ou seja invalido, a aplicacao solicita novo login.

### 2. Acesso ao dashboard

No perfil Profissional, o dashboard exibe:

- resumo de alunos cadastrados;
- quantidade de treinos;
- quantidade de dietas;
- quantidade de metricas;
- dados da sessao atual;
- navegacao inferior para as areas Home, Alunos, Treinos, Dietas e Metricas.

Esse painel serve como ponto inicial para acompanhar a carteira de alunos e acessar os modulos de acompanhamento.

### 3. Gestao de alunos

No perfil Profissional:

1. Acesse a aba Alunos.
2. Use o formulario de cadastro para informar:
   - nome do aluno;
   - e-mail do aluno;
   - idade;
   - objetivo.
3. Clique em Cadastrar aluno.
4. O aluno passa a aparecer na lista de alunos cadastrados.

Na lista de alunos, o profissional pode:

- abrir detalhes do aluno;
- editar dados cadastrais;
- remover o aluno.

Ao abrir os detalhes de um aluno, ficam disponiveis as abas de resumo, treinos, dietas, metricas e comunicacao.

### 4. Visualizacao e cadastro de treinos

No perfil Profissional:

1. Acesse Alunos.
2. Clique em Ver detalhes no aluno desejado.
3. Acesse a aba Treinos.
4. Preencha o formulario de novo treino com as informacoes solicitadas.
5. Salve o treino.

Na mesma aba, o profissional pode visualizar, editar e remover treinos ja cadastrados para aquele aluno.

Na aba geral Treinos do dashboard, o profissional visualiza os treinos cadastrados para seus alunos, com resumo de quantidade, duracao media e tipos de treino.

No perfil Aluno:

1. Acesse o portal do aluno.
2. Abra a aba Treinos.
3. Visualize os treinos cadastrados pelo profissional.

### 5. Visualizacao e cadastro de dietas

No perfil Profissional:

1. Acesse Alunos.
2. Clique em Ver detalhes no aluno desejado.
3. Acesse a aba Dietas.
4. Preencha o formulario de novo plano alimentar com objetivo, calorias, macronutrientes, refeicoes e observacoes.
5. Salve o plano alimentar.

Na mesma aba, o profissional pode visualizar, editar e remover planos alimentares ja cadastrados para o aluno.

Na aba geral Dietas do dashboard, o profissional visualiza os planos alimentares cadastrados para seus alunos, com resumo de quantidade, media de refeicoes e objetivos.

No perfil Aluno:

1. Acesse o portal do aluno.
2. Abra a aba Dietas.
3. Visualize os planos alimentares cadastrados pelo profissional.

### 6. Visualizacao e cadastro de metricas

No perfil Profissional:

1. Acesse Alunos.
2. Clique em Ver detalhes no aluno desejado.
3. Acesse a aba Metricas.
4. Registre as metricas corporais, como peso, altura, percentual de gordura, massa muscular, data da avaliacao e observacoes.
5. Salve a metrica.

Na mesma aba, o profissional pode visualizar, editar e remover metricas ja registradas para o aluno.

Na aba geral Metricas do dashboard, o profissional visualiza a evolucao e o historico de metricas dos alunos.

No perfil Aluno:

1. Acesse o portal do aluno.
2. Abra a aba Metricas.
3. Visualize as metricas registradas pelo profissional.

### 7. Comunicacao entre profissional e aluno

No perfil Profissional:

1. Acesse Alunos.
2. Clique em Ver detalhes no aluno desejado.
3. Acesse a aba Comunicacao.
4. Escreva uma mensagem ou orientacao.
5. Envie a mensagem.

No perfil Aluno:

1. Acesse o portal do aluno.
2. Abra a aba Comunicacao.
3. Visualize mensagens recebidas.
4. Escreva uma resposta ou relato.
5. Envie a mensagem.

Para a comunicacao funcionar no portal do aluno, o usuario Aluno precisa estar vinculado a um cadastro de aluno. Esse vinculo ocorre pelo e-mail: o e-mail do cadastro do aluno deve ser igual ao e-mail do usuario com perfil `student`.

### 8. Portal do aluno

O portal do aluno e acessado automaticamente quando o login e realizado por um usuario com perfil Aluno.

Areas disponiveis:

- Resumo: mostra os principais numeros do acompanhamento;
- Treinos: lista treinos cadastrados pelo profissional;
- Dietas: lista planos alimentares cadastrados pelo profissional;
- Metricas: mostra metricas corporais registradas;
- Comunicacao: permite consultar e enviar mensagens.

## Observacoes para avaliacao academica

- Os usuarios de teste estao documentados no arquivo `USUARIOS_TESTE.md`.
- As credenciais informadas sao ficticias e destinadas apenas a avaliacao academica.
- A aplicacao publicada deve ser acessada em https://flex-it.online/.
- Caso os usuarios de teste ainda nao existam no banco do ambiente publicado, eles precisam ser criados antes da avaliacao.
- Para que o portal do aluno exiba dados, o usuario Aluno deve estar vinculado a um cadastro de aluno pelo mesmo e-mail.
- A documentacao descreve o comportamento esperado da versao atual sem alterar regras de negocio, infraestrutura, autenticacao, Docker, pipeline ou banco de dados.
- Em ambiente local, o frontend normalmente roda em `http://localhost:5173`, o backend em `http://localhost:3000` e o PostgreSQL via Docker, conforme configuracao do projeto.
