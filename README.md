# Sistema de Gerenciamento de Tarefas Kanban

Um sistema de gerenciamento de tarefas estilo **Kanban**, desenvolvido com **Next.js** e backend baseado em **PostgreSQL** com Prisma. O projeto permite criar, editar e organizar tarefas e projetos de forma intuitiva e eficiente.

---

## 📌 Tecnologias Utilizadas

- ✅ **Next.js** – Framework React para SSR e SSG  
- ✅ **PostgreSQL** – Banco de dados relacional  
- ✅ **Prisma** – ORM para manipulação do banco de dados  
- ✅ **NextAuth.js** – Autenticação e gerenciamento de usuários  
- ✅ **ShadCN UI** – Biblioteca de componentes estilizados  
- ✅ **React Hook Form** – Gerenciamento de formulários  
- ✅ **Tailwind CSS** – Estilização moderna e responsiva  
- ✅ **Bcrypt** – Para hash de senhas  

---

## 📂 Estrutura do Projeto

```txt
kanban_tcc/
├── src/
│   ├── app/
│   │   ├── api/              # Rotas da API (Next.js API routes)
│   │   ├── blog/             # Página de blog
│   │   ├── cases/            # Casos de sucesso
│   │   ├── create-workspace/ # Criação de workspaces
│   │   ├── dashboard/        # Tela principal do Kanban
│   │   ├── funcionalidades/  # Página de funcionalidades
│   │   ├── login/            # Página de login
│   │   ├── planos/           # Página de planos
│   │   ├── register/         # Registro de usuários
│   ├── components/           # Componentes reutilizáveis
│   ├── lib/                  # Prisma, Auth config etc.
├── prisma/                   # Esquemas do banco (schema.prisma)
├── .env                      # Variáveis de ambiente
├── docker-compose.yml        # Configuração do ambiente com Docker
├── README.md                 # Este arquivo
```

## ⚙️ Instalação e Configuração

### 1️⃣ Clone o repositório

```bash
git clone https://github.com/Nunderns/kanban_tcc.git
cd kanban_tcc
```

### 2️⃣ Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3️⃣ Configure as variáveis de ambiente

Crie um arquivo .env com o seguinte conteúdo:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/kanban"
NEXTAUTH_SECRET="sua_chave_secreta"
NEXTAUTH_URL="http://localhost:3000"
```

### 4️⃣ Rode as migrações do banco

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5️⃣ Inicie o servidor

```bash
npm run dev
```

Abra no navegador: http://localhost:3000

### 6️⃣ Rode os testes

```bash
npm run test
```

Os testes são executados com o [Vitest](https://vitest.dev/), garantindo o funcionamento correto de utilidades como `cn`.

## 🛠 Funcionalidades

- 🔐 Autenticação com NextAuth.js
- 📦 Criação e gerenciamento de tarefas
- 🧱 Organização por colunas (Kanban)
- 🎨 Interface com ShadCN UI + Tailwind CSS
- 🔐 Hash de senhas com Bcrypt
- ⚙️ Backend com Prisma e PostgreSQL
