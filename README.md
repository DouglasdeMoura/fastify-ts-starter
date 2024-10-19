# Fastify TypeScript starter

This is a Fastify starter project for your new projects. Out-of-the-box, it includes:

- TypeScript (with [tsx](https://www.npmjs.com/package/tsx) for development);
- OpenAPI support with [Scalar](https://github.com/scalar/scalar/blob/main/packages/fastify-api-reference/README.md) theme;
- File based routing and auto-loading plugins provided by [fastify-autoload](https://github.com/fastify/fastify-autoload);
- GitHub Actions for auto-merging Dependabot PRs, running tests, building the project and validate the Dockerfile;
- VS Code settings for debugging and formatting;
- [Vitest](https://vitest.dev/) for testing;
- [Biome](https://biomejs.dev) for code formatting and linting;
- [Commitlint](https://commitlint.js.org/) for commit message linting;
- [Lefthook](https://github.com/evilmartians/lefthook) for git hooks;
- [Wireit](https://github.com/google/wireit) to make npm/pnpm/yarn scripts smarter and more efficient;
- [Docker](https://www.docker.com/) for containerization;
- [Docker Compose](https://docs.docker.com/compose/) for running the app in a container;
- [Release It!](https://www.npmjs.com/package/release-it) to automate versioning and package publishing-related tasks (by default, the versioning is done following [CalVer](https://calver.org/) format).

## Getting Started

Use this template to start your Fastify project.

```bash
npx degit DouglasdeMoura/fastify-ts-starter my-fastify-app
cd my-fastify-app
npm install
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm start`

For production mode

### `npm run test`

Run the test cases.

## Git Hooks

This project uses [LeftHook](https://github.com/evilmartians/lefthook/) to manage git hooks.

After cloning the project, run the following command to install the git hooks:

```bash
npx lefthook install
```

## Learn More

To learn Fastify, check out the [Fastify documentation](https://www.fastify.io/docs/latest/).
