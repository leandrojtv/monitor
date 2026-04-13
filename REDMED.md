# REDMED - Guia completo para executar o projeto com Docker

Este guia mostra, do zero, como baixar o código do Git localmente e subir toda a aplicação (backend + frontend + banco) com Docker.

## 1) Pré-requisitos

Antes de iniciar, confirme que você possui:

- Git instalado
- Docker instalado
- Docker Compose habilitado (`docker compose`)

### Verificação rápida

```bash
git --version
docker --version
docker compose version
```

---

## 2) Baixar o código do repositório Git

Substitua `SEU_USUARIO` e `SEU_REPOSITORIO` pelos valores corretos.

```bash
# Opção HTTPS
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# Entrar na pasta do projeto
cd SEU_REPOSITORIO
```

Se você usa SSH:

```bash
git clone git@github.com:SEU_USUARIO/SEU_REPOSITORIO.git
cd SEU_REPOSITORIO
```

---

## 3) (Opcional) Criar branch local de trabalho

```bash
git checkout -b minha-branch
```

---

## 4) Conferir arquivos esperados

Na raiz do projeto, você deve ver (entre outros):

- `docker-compose.yml`
- `Dockerfile`
- `frontend/Dockerfile`
- `src/` (backend)
- `frontend/` (frontend)

---

## 5) Subir tudo com Docker

Na raiz do projeto:

```bash
docker compose up --build
```

Esse comando sobe:

- `postgres` (banco de dados)
- `backend` (API Node.js)
- `frontend` (React/Vite)

---

## 6) Acessar a aplicação

Após os containers iniciarem:

- Frontend: http://localhost:5173
- Backend (health): http://localhost:3000/health

---

## 7) Comandos úteis de operação

### Ver logs de todos os serviços

```bash
docker compose logs -f
```

### Ver logs de um serviço específico

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Listar containers

```bash
docker compose ps
```

### Parar os containers

```bash
docker compose down
```

### Parar e remover volumes (apaga dados do Postgres)

```bash
docker compose down -v
```

### Rebuild forçado após alterações

```bash
docker compose up --build --force-recreate
```

---

## 8) Atualizar código local com Git

Se você já clonou antes e quer atualizar:

```bash
git pull origin main
```

Se estiver em outra branch:

```bash
git pull origin NOME_DA_BRANCH
```

---

## 9) Fluxo completo (resumo rápido)

```bash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd SEU_REPOSITORIO
docker compose up --build
```

---

## 10) Solução de problemas

### Porta 3000, 5173 ou 5432 já em uso

- Pare processos locais que usem essas portas, ou
- Ajuste o mapeamento de portas no `docker-compose.yml`.

### Frontend não conecta no backend

- Confira se o backend está saudável: `http://localhost:3000/health`
- Verifique logs: `docker compose logs -f backend`

### Erro de build por cache antigo

```bash
docker compose down
docker builder prune -f
docker compose up --build
```

---

## 11) Encerrar ambiente

```bash
docker compose down
```

Se quiser limpar também os dados persistidos:

```bash
docker compose down -v
```
