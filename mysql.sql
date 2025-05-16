--
-- SQLINES DEMO *** se dump
--

-- SQLINES DEMO *** ase version 15.12 (Debian 15.12-1.pgdg120+1)
-- SQLINES DEMO ***  version 15.12 (Debian 15.12-1.pgdg120+1)

/* SET statement_timeout = 0; */
/* SET lock_timeout = 0; */
SET idle_in_transaction_session_timeout = 0;
/* SET client_encoding = 'UTF8'; */
/* SET standard_conforming_strings = on; */
-- SQLINES FOR EVALUATION USE ONLY (14 DAYS)
SELECT pg_catalog.set_config('search_path', '', false);
/* SET check_function_bodies = false; */
SET xmloption = content;
/* SET client_min_messages = warning; */
SET row_security = off;

--
-- SQLINES DEMO *** e: SCHEMA; Schema: -; Owner: postgres
--

-- SQLINES DEMO *** hema, since initdb creates it



--
-- SQLINES DEMO *** ic; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- SQLINES DEMO *** ype: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Priority" AS ENUM (
    'NONE',
    'LOW',
    'MEDIUM',
    'HIGH'
);


ALTER TYPE public.`Priority` OWNER TO postgres;

--
-- SQLINES DEMO *** e: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Status" AS ENUM (
    'BACKLOG',
    'TODO',
    'IN_PROGRESS',
    'DONE'
);


ALTER TYPE public.`Status` OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- SQLINES DEMO *** n; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.`Notification` (
    id integer NOT NULL,
    message longtext NOT NULL,
    `userId` integer NOT NULL,
    `createdAt` datetime(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.`Notification` OWNER TO postgres;

--
-- SQLINES DEMO *** n_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CALL CreateSequence('public.`Notification_id_seq`', 1, 1)
    NO 1;


ALTER TABLE public.`Notification_id_seq` OWNER TO postgres;

--
-- SQLINES DEMO *** n_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Notification_id_seq" OWNED BY public.`Notification`.id;


--
-- SQLINES DEMO *** pe: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.`Project` (
    id integer NOT NULL,
    name longtext NOT NULL,
    description longtext,
    `createdAt` datetime(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updatedAt` datetime(3) NOT NULL,
    `ownerId` integer NOT NULL
);


ALTER TABLE public.`Project` OWNER TO postgres;

--
-- SQLINES DEMO *** seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CALL CreateSequence('public.`Project_id_seq`', 1, 1)
    NO 1;


ALTER TABLE public.`Project_id_seq` OWNER TO postgres;

--
-- SQLINES DEMO *** seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Project_id_seq" OWNED BY public.`Project`.id;


--
-- SQLINES DEMO *** pe: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.`Session` (
    id integer NOT NULL,
    token longtext NOT NULL,
    `userId` integer NOT NULL,
    `createdAt` datetime(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.`Session` OWNER TO postgres;

--
-- SQLINES DEMO *** seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CALL CreateSequence('public.`Session_id_seq`', 1, 1)
    NO 1;


ALTER TABLE public.`Session_id_seq` OWNER TO postgres;

--
-- SQLINES DEMO *** seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Session_id_seq" OWNED BY public.`Session`.id;


--
-- SQLINES DEMO *** ype: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.`Settings` (
    id integer NOT NULL,
    `userId` integer NOT NULL,
    `darkMode` boolean DEFAULT false NOT NULL,
    `notificationsEnabled` boolean DEFAULT true NOT NULL,
    `createdAt` datetime(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updatedAt` datetime(3) NOT NULL
);


ALTER TABLE public.`Settings` OWNER TO postgres;

--
-- SQLINES DEMO *** _seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CALL CreateSequence('public.`Settings_id_seq`', 1, 1)
    NO 1;


ALTER TABLE public.`Settings_id_seq` OWNER TO postgres;

--
-- SQLINES DEMO *** _seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Settings_id_seq" OWNED BY public.`Settings`.id;


--
-- SQLINES DEMO ***  TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.`Task` (
    id integer NOT NULL,
    title longtext NOT NULL,
    description longtext,
    status public."Status" DEFAULT 'BACKLOG'::public."Status" NOT NULL,
    priority public."Priority" DEFAULT 'NONE'::public."Priority" NOT NULL,
    `startDate` datetime(3),
    `dueDate` datetime(3),
    module longtext,
    cycle longtext,
    assignees longtext[],
    labels longtext[],
    `createdAt` datetime(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updatedAt` datetime(3) NOT NULL,
    `userId` integer NOT NULL,
    `projectId` integer
);


ALTER TABLE public.`Task` OWNER TO postgres;

--
-- SQLINES DEMO *** y; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.`TaskActivity` (
    id integer NOT NULL,
    `taskId` integer NOT NULL,
    `user` longtext NOT NULL,
    action longtext NOT NULL,
    field longtext,
    `oldValue` longtext,
    `newValue` longtext,
    `createdAt` datetime(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.`TaskActivity` OWNER TO postgres;

--
-- SQLINES DEMO *** y_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CALL CreateSequence('public.`TaskActivity_id_seq`', 1, 1)
    NO 1;


ALTER TABLE public.`TaskActivity_id_seq` OWNER TO postgres;

--
-- SQLINES DEMO *** y_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TaskActivity_id_seq" OWNED BY public.`TaskActivity`.id;


--
-- SQLINES DEMO *** ; Type: SEQUENCE; Schema: public; Owner: postgres
--

CALL CreateSequence('public.`Task_id_seq`', 1, 1)
    NO 1;


ALTER TABLE public.`Task_id_seq` OWNER TO postgres;

--
-- SQLINES DEMO *** ; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Task_id_seq" OWNED BY public.`Task`.id;


--
-- SQLINES DEMO ***  TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.`User` (
    id integer NOT NULL,
    name longtext NOT NULL,
    email longtext NOT NULL,
    password longtext NOT NULL,
    `googleId` longtext,
    `createdAt` datetime(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updatedAt` datetime(3) NOT NULL
);


ALTER TABLE public.`User` OWNER TO postgres;

--
-- SQLINES DEMO *** ; Type: SEQUENCE; Schema: public; Owner: postgres
--

CALL CreateSequence('public.`User_id_seq`', 1, 1)
    NO 1;


ALTER TABLE public.`User_id_seq` OWNER TO postgres;

--
-- SQLINES DEMO *** ; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public.`User`.id;


--
-- SQLINES DEMO *** Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.`Workspace` (
    id integer NOT NULL,
    name longtext NOT NULL,
    `companySize` integer NOT NULL,
    slug longtext NOT NULL,
    `userId` integer NOT NULL,
    `createdAt` datetime(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updatedAt` datetime(3) NOT NULL
);


ALTER TABLE public.`Workspace` OWNER TO postgres;

--
-- SQLINES DEMO *** mber; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.`WorkspaceMember` (
    id integer NOT NULL,
    `userId` integer NOT NULL,
    `workspaceId` integer NOT NULL,
    role longtext DEFAULT 'Membro'::longtext NOT NULL,
    `joinedAt` datetime(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.`WorkspaceMember` OWNER TO postgres;

--
-- SQLINES DEMO *** mber_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CALL CreateSequence('public.`WorkspaceMember_id_seq`', 1, 1)
    NO 1;


ALTER TABLE public.`WorkspaceMember_id_seq` OWNER TO postgres;

--
-- SQLINES DEMO *** mber_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."WorkspaceMember_id_seq" OWNED BY public.`WorkspaceMember`.id;


--
-- SQLINES DEMO *** d_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CALL CreateSequence('public.`Workspace_id_seq`', 1, 1)
    NO 1;


ALTER TABLE public.`Workspace_id_seq` OWNER TO postgres;

--
-- SQLINES DEMO *** d_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Workspace_id_seq" OWNED BY public.`Workspace`.id;


--
-- SQLINES DEMO *** rations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at datetime,
    migration_name character varying(255) NOT NULL,
    logs longtext,
    rolled_back_at datetime,
    started_at datetime DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- SQLINES DEMO *** n id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification" ALTER COLUMN id SET DEFAULT nextval('public."Notification_id_seq"'::regclass);


--
-- SQLINES DEMO ***  Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project" ALTER COLUMN id SET DEFAULT nextval('public."Project_id_seq"'::regclass);


--
-- SQLINES DEMO ***  Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session" ALTER COLUMN id SET DEFAULT nextval('public."Session_id_seq"'::regclass);


--
-- SQLINES DEMO *** ; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settings" ALTER COLUMN id SET DEFAULT nextval('public."Settings_id_seq"'::regclass);


--
-- SQLINES DEMO *** pe: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task" ALTER COLUMN id SET DEFAULT nextval('public."Task_id_seq"'::regclass);


--
-- SQLINES DEMO *** y id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskActivity" ALTER COLUMN id SET DEFAULT nextval('public."TaskActivity_id_seq"'::regclass);


--
-- SQLINES DEMO *** pe: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- SQLINES DEMO *** d; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Workspace" ALTER COLUMN id SET DEFAULT nextval('public."Workspace_id_seq"'::regclass);


--
-- SQLINES DEMO *** mber id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkspaceMember" ALTER COLUMN id SET DEFAULT nextval('public."WorkspaceMember_id_seq"'::regclass);


--
-- SQLINES DEMO *** tification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.`Notification`(id, message, `userId`, `createdAt`) FROM stdin;
.


--
-- SQLINES DEMO *** oject; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.`Project`(id, name, description, `createdAt`, `updatedAt`, `ownerId`) FROM stdin;
.


--
-- SQLINES DEMO *** ssion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.`Session`(id, token, `userId`, `createdAt`) FROM stdin;
.


--
-- SQLINES DEMO *** ttings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.`Settings`(id, `userId`, `darkMode`, `notificationsEnabled`, `createdAt`, `updatedAt`) FROM stdin;
.


--
-- SQLINES DEMO *** sk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.`Task`(id, title, description, status, priority, `startDate`, `dueDate`, module, cycle, assignees, labels, `createdAt`, `updatedAt`, `userId`, `projectId`) FROM stdin;
.


--
-- SQLINES DEMO *** skActivity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.`TaskActivity`(id, `taskId`, `user`, action, field, `oldValue`, `newValue`, `createdAt`) FROM stdin;
.


--
-- SQLINES DEMO *** er; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.`User`(id, name, email, password, `googleId`, `createdAt`, `updatedAt`) FROM stdin;
.


--
-- SQLINES DEMO *** rkspace; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.`Workspace`(id, name, `companySize`, slug, `userId`, `createdAt`, `updatedAt`) FROM stdin;
.


--
-- SQLINES DEMO *** rkspaceMember; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.`WorkspaceMember`(id, `userId`, `workspaceId`, role, `joinedAt`) FROM stdin;
.


--
-- SQLINES DEMO *** risma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations(id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8733bf5e-da4e-403c-a4ca-51edba3ce3d4	c14ef9309444e797046de4ffe89d604b2b94a29e0bf973712d36281910188bd3	2025-04-30 19:59:11.312729+00	20250430195911_init_postgres	N	N	2025-04-30 19:59:11.220993+00	1
.


--
-- SQLINES DEMO *** n_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Notification_id_seq"', 1, false);


--
-- SQLINES DEMO *** seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Project_id_seq"', 1, false);


--
-- SQLINES DEMO *** seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Session_id_seq"', 1, false);


--
-- SQLINES DEMO *** _seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Settings_id_seq"', 1, false);


--
-- SQLINES DEMO *** y_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TaskActivity_id_seq"', 1, false);


--
-- SQLINES DEMO *** ; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Task_id_seq"', 1, false);


--
-- SQLINES DEMO *** ; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, false);


--
-- SQLINES DEMO *** mber_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."WorkspaceMember_id_seq"', 1, false);


--
-- SQLINES DEMO *** d_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Workspace_id_seq"', 1, false);


--
-- SQLINES DEMO *** n Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT `Notification_pkey` PRIMARY KEY(id);


--
-- SQLINES DEMO *** ject_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT `Project_pkey` PRIMARY KEY(id);


--
-- SQLINES DEMO *** sion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT `Session_pkey` PRIMARY KEY(id);


--
-- SQLINES DEMO *** ttings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT `Settings_pkey` PRIMARY KEY(id);


--
-- SQLINES DEMO *** y TaskActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskActivity"
    ADD CONSTRAINT `TaskActivity_pkey` PRIMARY KEY(id);


--
-- SQLINES DEMO *** key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT `Task_pkey` PRIMARY KEY(id);


--
-- SQLINES DEMO *** key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT `User_pkey` PRIMARY KEY(id);


--
-- SQLINES DEMO *** mber WorkspaceMember_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkspaceMember"
    ADD CONSTRAINT `WorkspaceMember_pkey` PRIMARY KEY(id);


--
-- SQLINES DEMO *** orkspace_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Workspace"
    ADD CONSTRAINT `Workspace_pkey` PRIMARY KEY(id);


--
-- SQLINES DEMO *** rations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY(id);


--
-- SQLINES DEMO *** en_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX `Session_token_key` ON public.`Session` USING btree(token);


--
-- SQLINES DEMO *** erId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX `Settings_userId_key` ON public.`Settings` USING btree(`userId`);


--
-- SQLINES DEMO *** key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX `User_email_key` ON public.`User` USING btree(email);


--
-- SQLINES DEMO *** Id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX `User_googleId_key` ON public.`User` USING btree(`googleId`);


--
-- SQLINES DEMO *** mber_userId_workspaceId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX `WorkspaceMember_userId_workspaceId_key` ON public.`WorkspaceMember` USING btree(`userId`, `workspaceId`);


--
-- SQLINES DEMO *** lug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX `Workspace_slug_key` ON public.`Workspace` USING btree(slug);


--
-- SQLINES DEMO *** n Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY(`userId`) REFERENCES public.`User`(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- SQLINES DEMO *** ject_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT `Project_ownerId_fkey` FOREIGN KEY(`ownerId`) REFERENCES public.`User`(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- SQLINES DEMO *** sion_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY(`userId`) REFERENCES public.`User`(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- SQLINES DEMO *** ttings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT `Settings_userId_fkey` FOREIGN KEY(`userId`) REFERENCES public.`User`(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- SQLINES DEMO *** y TaskActivity_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskActivity"
    ADD CONSTRAINT `TaskActivity_taskId_fkey` FOREIGN KEY(`taskId`) REFERENCES public.`Task`(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- SQLINES DEMO *** rojectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT `Task_projectId_fkey` FOREIGN KEY(`projectId`) REFERENCES public.`Project`(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- SQLINES DEMO *** serId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT `Task_userId_fkey` FOREIGN KEY(`userId`) REFERENCES public.`User`(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- SQLINES DEMO *** mber WorkspaceMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkspaceMember"
    ADD CONSTRAINT `WorkspaceMember_userId_fkey` FOREIGN KEY(`userId`) REFERENCES public.`User`(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- SQLINES DEMO *** mber WorkspaceMember_workspaceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkspaceMember"
    ADD CONSTRAINT `WorkspaceMember_workspaceId_fkey` FOREIGN KEY(`workspaceId`) REFERENCES public.`Workspace`(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- SQLINES DEMO *** orkspace_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Workspace"
    ADD CONSTRAINT `Workspace_userId_fkey` FOREIGN KEY(`userId`) REFERENCES public.`User`(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- SQLINES DEMO *** ic; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- SQLINES DEMO *** se dump complete
--

