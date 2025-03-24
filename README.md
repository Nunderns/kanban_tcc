# 🚀 Kanban TCC

Um sistema de gerenciamento de tarefas estilo **Kanban**, desenvolvido com **Next.js** e um backend baseado em **MySQL** com Prisma. O projeto permite criar, editar e gerenciar tarefas e projetos de forma intuitiva e eficiente.

## 📌 Tecnologias Utilizadas

- **Next.js** - Framework React para SSR e SSG
- **MySQL** - Banco de dados relacional
- **Prisma** - ORM para manipulação do banco de dados
- **ShadCN UI** - Biblioteca de componentes estilizados
- **Bcrypt** - Para hash de senhas
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de dados
- **Tailwind CSS** - Estilização moderna e responsiva
- **Axios** - Requisições HTTP
- **NextAuth.js** - Autenticação e gerenciamento de usuários

## 📂 Estrutura do Projeto

```
kanban_tcc/
├── src/
│   ├── app/
│   │   ├── api/         # Rotas da API
│   │   ├── dashboard/   # Página principal do Kanban
│   │   ├── auth/        # Sistema de autenticação
│   ├── components/      # Componentes reutilizáveis
│   ├── lib/             # Configurações gerais (Prisma, Auth, etc.)
├── prisma/              # Configuração do banco de dados
├── .env                 # Variáveis de ambiente
├── docker-compose.yml   # Configuração do ambiente Docker
├── README.md            # Documentação
```

## ⚙️ Configuração e Instalação

### 1️⃣ Clone o repositório
```sh
git clone https://github.com/Nunderns/kanban_tcc.git
cd kanban_tcc
```

### 2️⃣ Instale as dependências
```sh
npm install
# ou
yarn install
```

### 3️⃣ Configure as variáveis de ambiente
Crie um arquivo `.env` e adicione as seguintes variáveis:
```sh
DATABASE_URL="mysql://user:password@localhost:3306/kanban"
NEXTAUTH_SECRET="sua_chave_secreta"
NEXTAUTH_URL="http://localhost:3000"
```

### 4️⃣ Configure o Banco de Dados
```sh
npx prisma migrate dev --name init
npx prisma generate
```

### 5️⃣ Inicie o servidor
```sh
npm run dev
```
O projeto estará rodando em **http://localhost:3000**.

## 🛠 Funcionalidades

✅ Autenticação com **NextAuth.js**
✅ Criação e edição de tarefas e projetos
✅ Organização por colunas no estilo **Kanban**
✅ Interface moderna com **ShadCN UI** e **Tailwind CSS**
✅ Hash de senhas com **Bcrypt**
✅ API otimizada utilizando **Prisma ORM**

## 📜 Licença

Este projeto está sob a licença **MIT**. Sinta-se livre para contribuir! 🎉
