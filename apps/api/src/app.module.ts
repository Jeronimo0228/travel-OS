import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RequestLoggerMiddleware } from './common/request-logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LeadsModule } from './leads/leads.module';
import { AuditModule } from './audit/audit.module';
import { TasksModule } from './tasks/tasks.module';
import { AgencyModule } from './agency/agency.module';
import { AiModule } from './ai/ai.module';
import { CatalogModule } from './catalog/catalog.module';
import { QuotesModule } from './quotes/quotes.module';
import { PortalModule } from './portal/portal.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuditModule,
    AiModule,
    AuthModule,
    CatalogModule,
    UsersModule,
    LeadsModule,
    QuotesModule,
    PortalModule,
    MetricsModule,
    TasksModule,
    AgencyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
