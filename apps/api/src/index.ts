import { buildServer } from './server.js';

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';

const start = async () => {
  const app = await buildServer();
  try {
    await app.listen({ port, host });
    app.log.info({ port, host }, 'novabash api listening');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
