import { createApp } from './app.factory';

async function bootstrap() {
  const app = await createApp();
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);

  console.log(`TravelOS API listening on http://localhost:${port}/api`);
}
void bootstrap();
