import { Module } from '@nestjs/common';
import { CashService } from './cash.service';
import { CashController } from './cash.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CashController],
  providers: [CashService, PrismaService],
  exports: [CashService], // Export for TransactionsModule
})
export class CashModule {}
