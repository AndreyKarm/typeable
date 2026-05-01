# Typeable

An AI-powered typing practice platform built with Svelte 5, Drizzle ORM, and Better Auth. Includes a dedicated real-time service powered by Bun.

## Project Structure

- /: The main Typeable SvelteKit application.
- /websockets/: A standalone real-time service powered by Bun.

## Tech Stack

- Framework: SvelteKit (Svelte 5)
- Language: TypeScript
- Database: PostgreSQL (managed via Drizzle ORM)
- Authentication: Better Auth
- AI Integration: Google Gemini SDK
- AI Integration (Development): LM Studio

## Getting Started

## 1. Prerequisites

- Node.js (v22+)
- Bun (for the websockets service)
- pnpm
- Docker (to run the database)

## 2. Installation

Clone the repository and install dependencies:

``` bash
git clone https://github.com/AndreyKarm/typeable.git
cd typeable
pnpm install

cd websockets
bun install
```

## 3. Environment Variables

Copy the example environment file and update the values as needed:

``` bash
cp .env.example .env
```

## 4. Database Setup

Start the PostgreSQL database container and run migrations:

``` bash
# Start the database container
pnpm db:start

# Run migrations to set up tables
pnpm db:migrate
```

## 5. Development

Terminal 1 (SvelteKit Frontend):

``` bash
pnpm dev
```

Terminal 2 (Websocket Service):

``` bash
# In the /websockets directory
bun run dev
```

## Available Scripts

## Main Application (Root)

| Script           | Description                             |
| ---------------- | --------------------------------------- |
| pnpm dev         |  Starts the development server          |
| pnpm build       |  Builds the project for production      |
| pnpm db:start    |  Starts the Docker database container   |
| pnpm db:generate |  Generates Drizzle migrations           |
| pnpm db:migrate  |  Runs migrations against the DB         |
| pnpm db:studio   |  Opens Drizzle Studio to inspect the DB |
| pnpm auth:schema |  Generates the Better Auth schema       |
| pnpm lint        |  Runs Prettier and ESLint               |
| pnpm format      |  Formats code with Prettier             |

## Websocket Service (/websockets)

| Script           | Description                                        |
| ---------------- | -------------------------------------------------- |
| bun run dev      | Starts the Bun websocket server with hot reloading |

## Deployment

- The main app is configured for Node.js deployment using @sveltejs/adapter-node.
- The websocket service requires a production-ready Bun environment (or containerized Bun runtime) to execute src/index.ts.
