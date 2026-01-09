# Fastify Demo

A production-ready REST API built with Fastify, TypeScript, and MongoDB.

## Features

- ✅ RESTful API with OpenAPI documentation
- ✅ MongoDB database with official Fastify plugin
- ✅ User authentication and session management
- ✅ Role-based access control (RBAC)
- ✅ File upload support
- ✅ CSV export functionality
- ✅ Rate limiting and security headers
- ✅ Full TypeScript support
- ✅ Comprehensive test coverage

**Prerequisites:** Node.js version 18 or higher

## About

This is a Fastify application with user authentication, role-based permissions, and file handling capabilities.

## Getting started
Install the dependencies:
```bash
npm install
```

### Environment variables

Create a `.env` file based on `.env.example` and update values as needed.

Make sure `COOKIE_SECRET` is set to a secret with at least 32 characters.

### Database

You can run a MongoDB instance with Docker:
```bash
docker compose up
```

To run it in the background:
```bash
docker compose up -d
```

To populate the database with initial data, run:
```bash
CAN_SEED_DATABASE=1 npm run db:seed
```

This creates three test users:
- **basic@example.com** (role: basic) - Password: `Password123$`
- **moderator@example.com** (roles: basic, moderator) - Password: `Password123$`
- **admin@example.com** (roles: basic, moderator, admin) - Password: `Password123$`
npm run db:seed
```

To drop the database, run:
```bash
npm run db:drop
```

### TypeScript
To build the project:
```bash
npm run build
```

### Start the server
In dev mode:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

In production mode:
```bash
npm run start
```

### API Documentation

The application exposes interactive API documentation using Swagger UI.

Once the server is running, visit: http://localhost:3000/api/docs

### Testing
To run the tests:
```bash
npm run test
```

### Standalone
`dev` and `start` leverage [fastify-cli](https://github.com/fastify/fastify-cli),
but you can run the demo as a standalone executable (see [server.ts](./src/server.ts)):
```bash
npm run standalone
```

### Linting
To check for linting errors:
```bash
npm run lint
```

To check and automatically fix linting errors:
```bash
npm run lint:fix
```

## Learn More
To learn more about Fastify, check out the [Fastify documentation](https://www.fastify.io/docs/latest/).
