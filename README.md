# TaskFlow

A full-stack task management application built with **Angular 19** and **Spring Boot 3**,
secured with **stateless JWT authentication**.

Each user registers or signs in, receives a JSON Web Token, and manages their own tasks
through a REST API. The ownership of a task is derived from the token on the server side,
so one user can never read or modify another user's tasks — not even by forging a request.

```
┌─────────────────┐   /api/*  (dev proxy or nginx)   ┌──────────────────────┐
│  Angular 19 SPA │ ────────────────────────────────► │  Spring Boot 3 REST  │
│  standalone      │ ◄──────────────────────────────── │  JWT + JPA           │
│  components      │        JSON / problem+json       └──────────┬───────────┘
└─────────────────┘                                             │
                                                    owner-scoped   │
                                                    queries       ▼
                                                        ┌────────────────┐
                                                        │  H2 (dev)      │
                                                        │  MySQL (Docker)│
                                                        └────────────────┘
```

## Features

- **Authentication** — `POST /api/auth/register` and `POST /api/auth/login`, BCrypt
  password hashing, stateless JWT (HS256) with a configurable lifetime.
- **Protected API** — every task endpoint requires `Authorization: Bearer <token>`;
  method-level `@PreAuthorize("hasRole('USER')")` guards the controller.
- **Per-user tasks** — create, list, update, complete and delete tasks. The owner is
  taken from the JWT subject, and the queries are owner-scoped, so a foreign task id
  simply does not exist (404) for another user.
- **Input validation** — Bean Validation on the request records, with the field errors
  returned in an RFC 7807 `application/problem+json` payload.
- **Consistent error contract** — a `@RestControllerAdvice` turns every error into a
  problem document (`title`, `status`, `detail`, `fieldErrors`).
- **Front-end** — standalone Angular components, a functional HTTP interceptor that
  attaches the token and reacts to 401, a route guard, and a small reactive task UI.
- **Tests** — 4 backend integration tests (MockMvc) and 12 front-end unit tests (Karma
  with `HttpTestingController`), both executed by the CI workflow.
- **Containerised** — `docker compose up` starts MySQL, the API and an nginx-served
  Angular build.

## Tech stack

| Layer | Choice |
|-------|--------|
| Front-end | Angular 19 (standalone components, signals-ready, functional interceptor), TypeScript 5.5, Bootstrap 5 |
| Back-end | Spring Boot 3.2, Spring Web, Spring Security 6, Spring Data JPA, Bean Validation |
| Security | JWT (HS256) via `spring-security-oauth2-resource-server`, BCrypt |
| Database | H2 (file mode) for local runs, MySQL 8.4 in the Compose stack |
| Build | Maven 3.9, JDK 17, npm 11 |
| Tests | JUnit 5 + MockMvc (back-end), Jasmine + Karma + Chrome Headless (front-end) |
| Ops | Docker multi-stage builds, nginx reverse proxy, GitHub Actions CI |

## Repository layout

```
taskflow/
├── backend/                    Spring Boot REST API
│   ├── src/main/java/com/ghayeth/taskflow/
│   │   ├── auth/               login, register, token issuance
│   │   ├── user/               JPA user entity + Spring Security bridge
│   │   ├── todo/               task entity, repository, REST controller
│   │   ├── config/             security chain, CORS, seed data
│   │   └── common/             RFC 7807 error handling
│   └── src/test/               integration tests
├── frontend/                   Angular application
│   ├── src/app/
│   │   ├── service/            auth service, JWT interceptor, route guard
│   │   ├── service/data/       task REST client
│   │   ├── model/              TypeScript models
│   │   └── login|menu|logout|list-todos|todo|error/   components
│   ├── proxy.conf.json         dev-server proxy to the API
│   └── nginx.conf              production reverse proxy
├── docker-compose.yml          MySQL + API + front-end
└── .github/workflows/ci.yml    build and test on every push
```

## Running it locally

**Requirements:** JDK 17, Maven 3.9, Node 20+.

**1. API**

```bash
cd backend
mvn spring-boot:run
# http://localhost:8080  (H2 file database created in backend/data)
```

**2. Front-end**

```bash
cd frontend
npm ci
npm start          # http://localhost:4200, /api is proxied to the API
```

Sign in with the seeded demo account `demo` / `demo1234`, or register a new one from
the API:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"password123"}'
```

**With Docker Compose**

```bash
docker compose up --build
# front-end  http://localhost:4200
# API        http://localhost:8080
```

## API reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | no | Create an account (409 if the username exists) |
| POST | `/api/auth/login` | no | Exchange credentials for a JWT (401 on bad credentials) |
| GET | `/api/todos` | yes | List the tasks of the authenticated user |
| GET | `/api/todos/{id}` | yes | Read one of the authenticated user's tasks |
| POST | `/api/todos` | yes | Create a task (400 on invalid payload) |
| PUT | `/api/todos/{id}` | yes | Update description, status and target date |
| DELETE | `/api/todos/{id}` | yes | Delete a task (204) |

Example of an authenticated call:

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"demo1234"}' | jq -r .token)

curl http://localhost:8080/api/todos -H "Authorization: Bearer $TOKEN"
```

## Security notes

- **Stateless**: no session, no cookie, no CSRF token — the token travels in the
  `Authorization` header, and the API is protected by Spring's resource-server filter.
- **Passwords**: stored with BCrypt; the plain password never reaches the database.
- **Secret**: the signing key is read from `taskflow.jwt.secret` and can be overridden
  with the `JWT_SECRET` environment variable. The committed value is a development
  default only.
- **Ownership**: the owner of a task is the JWT subject. Repository queries are
  owner-scoped, so cross-user access returns 404 instead of leaking the resource.
- **Errors**: details are returned as problem documents; stack traces are never exposed.

## Tests

```bash
cd backend  && mvn test                # 4 integration tests (MockMvc)
cd frontend && npm run test:ci         # 12 unit tests, headless Chrome
```

The back-end tests cover the login flow, the 401 path, the isolation between two users
and the validation errors. The front-end tests cover the auth service, the interceptor
and the task REST client.

## What I built on top of the base project

This repository started from the **vprofile**-style tutorial material published by
[in28minutes](https://github.com/in28minutes/full-stack-with-angular-and-spring-boot)
(MIT licence), whose final step is a Spring Boot + Angular application with JWT
authentication. The tutorial code was the starting point; the application in this
repository is my own work on top of it:

- replaced the in-memory, hard-coded authentication by a real user table with BCrypt
  hashing, registration and login endpoints;
- replaced the in-memory task list by a JPA model with owner-scoped queries and a
  complete REST API (create, read, update, delete) with validation;
- rewrote the front-end authentication: the hard-coded and basic-auth services of the
  tutorial were replaced by a JWT service, a functional HTTP interceptor and a route
  guard;
- added a consistent RFC 7807 error contract and CORS configuration;
- added the test suites (4 back-end, 12 front-end) and a CI workflow;
- containerised the stack with Docker Compose and nginx.

## Credits and licence

The base project is [in28minutes/full-stack-with-angular-and-spring-boot](https://github.com/in28minutes/full-stack-with-angular-and-spring-boot)
(MIT). This repository is released under the MIT licence — see [LICENSE](LICENSE).

All credentials shipped in this repository are development placeholders.
