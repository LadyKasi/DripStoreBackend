# DripStore - Backend

API RESTful desenvolvida para gerenciar o catálogo, categorias, usuários e variações de produtos da plataforma de e-commerce Drip Store. Construída em Node.js com Express.js, persistência em MySQL através do Sequelize ORM, autenticação via JWT e documentação interativa com Swagger.

---

## Tecnologias Utilizadas

* Node.js (Ambiente de execução JavaScript no servidor)
* Express.js (Framework web minimalista para construção de APIs REST)
* MySQL (Banco de dados relacional)
* Sequelize ORM (Modelagem de dados, validações e migrations)
* JSON Web Token (JWT) (Autenticação e proteção de rotas privadas)
* Bcrypt.js (Criptografia unidirecional de senhas com salt)
* Swagger / OpenAPI 3.0 (Documentação interativa dos endpoints)
* Jest & Supertest (Testes automatizados de integração e unidade)
* Dotenv (Gerenciamento seguro de variáveis de ambiente)

---

## Padrão Arquitetural

O projeto foi estruturado seguindo o padrão MVC (Model-View-Controller) complementado por uma camada de Serviços (Service Layer) para isolar regras de negócio e persistência:

* `src/models/`: Definição dos esquemas relacionais do Sequelize (User, Category, Product, ProductImage, ProductOption, ProductCategory).
* `src/controllers/`: Recepção de requisições HTTP, validação preliminar e retorno dos códigos de status adequados.
* `src/services/`: Concentração de todas as regras de negócio, criptografia, geração de tokens e consultas ao banco.
* `src/routes/`: Definição e agrupamento dos endpoints da versão 1 (/v1).
* `src/middleware/`: Middlewares reutilizáveis de autenticação JWT e tratamento centralizado de erros.
* `src/database/`: Migrações estruturadas para versionamento do esquema do banco de dados e seeders para dados iniciais.

Convenção de escrita: camelCase no código JavaScript e nomes de arquivos.

---

## Pré-requisitos

* Node.js (versão 18 ou superior instalada)
* MySQL (instância ativa local ou em container)

---

## Instalação e Configuração

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/dripStoreBackend.git
cd dripStoreBackend
```

### 2. Instalar as Dependências

```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente

Copie o arquivo de exemplo para criar seu `.env`:

```bash
cp .env.example .env
```

> **Atenção:** Se você estiver fazendo o clone do projeto, altere as variáveis de conexão com o seu banco de dados no arquivo `.env` (host, porta, usuário, senha e nome do banco):

```env
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:5000

# Connection string / Credenciais do Banco MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dripstore_db
DB_USER=root
DB_PASSWORD=root
DB_DIALECT=mysql

# Autenticação JWT
JWT_SECRET=dripstore_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
```

### 4. Executar Migrações e Seeds do Banco de Dados

Crie o banco de dados especificado (`dripstore_db`) e execute as migrações e dados de teste:

```bash
# Executa as migrations para criar as tabelas
npx sequelize-cli db:migrate

# (Opcional) Popula o banco com dados de exemplo
npx sequelize-cli db:seed:all
```

---

## Como Executar a Aplicação

### Modo de Desenvolvimento (com auto-reload):

```bash
npm run dev
```

### Modo de Produção:

```bash
npm start
```

O servidor estará rodando em: `http://localhost:5000`

---

## Documentação Interativa (Swagger)

A API possui documentação interativa através do Swagger UI. Com o servidor em execução, acesse em seu navegador:

http://localhost:5000/swagger

---

## Testes Automatizados

O projeto conta com uma suíte de testes de integração cobrindo fluxos completos de autenticação, usuários, categorias e produtos com Jest e Supertest.

Para rodar todos os testes:

```bash
npm test
```

(Os testes utilizam banco SQLite em memória isolado, não interferindo nos dados do MySQL).

---

## Resumo dos Endpoints

### Autenticação & Usuários (/v1/user)

| Método | Rota | Descrição | Protegida por JWT | Status de Sucesso |
| :--- | :--- | :--- | :---: | :---: |
| **POST** | `/v1/user` | Cadastra novo usuário | Não | `201 Created` |
| **POST** | `/v1/user/token` | Realiza login e gera token JWT | Não | `200 OK` |
| **GET** | `/v1/user/:id` | Obtém dados de um usuário pelo ID | Não | `200 OK` |
| **PUT** | `/v1/user/:id` | Atualiza dados do usuário | **Sim** | `204 No Content` |
| **DELETE** | `/v1/user/:id` | Remove um usuário | **Sim** | `204 No Content` |

### Categorias (/v1/category)

| Método | Rota | Descrição | Protegida por JWT | Status de Sucesso |
| :--- | :--- | :--- | :---: | :---: |
| **GET** | `/v1/category/search` | Lista categorias com paginação e filtros | Não | `200 OK` |
| **GET** | `/v1/category/:id` | Obtém dados da categoria por ID | Não | `200 OK` |
| **POST** | `/v1/category` | Cadastra nova categoria | **Sim** | `201 Created` |
| **PUT** | `/v1/category/:id` | Atualiza uma categoria | **Sim** | `204 No Content` |
| **DELETE** | `/v1/category/:id` | Deleta uma categoria | **Sim** | `204 No Content` |

### Produtos (/v1/product)

| Método | Rota | Descrição | Protegida por JWT | Status de Sucesso |
| :--- | :--- | :--- | :---: | :---: |
| **GET** | `/v1/product/search` | Busca produtos com filtros, faixas de preço e opções | Não | `200 OK` |
| **GET** | `/v1/product/:id` | Obtém detalhes completos do produto | Não | `200 OK` |
| **POST** | `/v1/product` | Cadastra produto com imagens e variações | **Sim** | `201 Created` |
| **PUT** | `/v1/product/:id` | Atualiza produto, imagens e opções | **Sim** | `204 No Content` |
| **DELETE** | `/v1/product/:id` | Deleta um produto | **Sim** | `204 No Content` |

---

## Autenticação JWT

Para rotas protegidas (`POST`, `PUT`, `DELETE` de categorias e produtos, e `PUT`, `DELETE` de usuários), inclua o cabeçalho HTTP:

```http
Authorization: Bearer <seu_token_jwt>
```
