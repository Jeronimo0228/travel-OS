import { Module } from '@nestjs/common';
import { PublicAccountController, TeamController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  controllers: [PublicAccountController, TeamController],
  providers: [AccountService],
})
export class AccountModule {}
