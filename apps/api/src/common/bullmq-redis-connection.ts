import { ConfigService } from '@nestjs/config';

export function createBullMqRedisConnection(config: ConfigService) {
  const redisUrl = new URL(config.getOrThrow<string>('REDIS_URL'));
  if (redisUrl.protocol !== 'redis:' && redisUrl.protocol !== 'rediss:') {
    throw new Error('REDIS_URL must use the redis:// or rediss:// protocol');
  }

  const port = Number(redisUrl.port || 6379);
  const databaseIndex =
    redisUrl.pathname.length > 1
      ? Number(redisUrl.pathname.slice(1))
      : undefined;
  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65_535 ||
    (databaseIndex !== undefined &&
      (!Number.isInteger(databaseIndex) || databaseIndex < 0))
  ) {
    throw new Error('REDIS_URL contains an invalid port or database index');
  }

  return {
    host: redisUrl.hostname,
    port,
    ...(redisUrl.username
      ? { username: decodeURIComponent(redisUrl.username) }
      : {}),
    ...(redisUrl.password
      ? { password: decodeURIComponent(redisUrl.password) }
      : {}),
    ...(databaseIndex !== undefined ? { db: databaseIndex } : {}),
    ...(redisUrl.protocol === 'rediss:' ? { tls: {} } : {}),
  };
}
