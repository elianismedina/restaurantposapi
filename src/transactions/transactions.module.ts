import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CashService } from '../cash/cash.service';
import { CustomersService } from '../customers/customers.service';

@Module({
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    PrismaService,
    CashService,
    CustomersService,
  ],
})
export class TransactionsModule {}
