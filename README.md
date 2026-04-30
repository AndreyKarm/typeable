# Typeable

An AI-powered typing practice platform built with Svelte 5, Drizzle ORM, and Better Auth.

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
- pnpm
- Docker (to run the database)

## 2. Installation

Clone the repository and install dependencies:

``` bash
git clone https://github.com/AndreyKarm/typeable.git
cd typeable
pnpm install
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

Start the development server:

``` bash
pnpm dev
```

## Available Scripts

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

## Deployment

This project uses @sveltejs/adapter-node. To deploy, build the project with pnpm build and ensure your production environment has the necessary environment variables set.
