import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsModule } from './transactions.module';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CashService } from '../cash/cash.service';
import { CustomersService } from '../customers/customers.service';

describe('TransactionsModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TransactionsModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide TransactionsService', () => {
    const service = module.get<TransactionsService>(TransactionsService);
    expect(service).toBeDefined();
  });

  it('should provide TransactionsController', () => {
    const controller = module.get<TransactionsController>(
      TransactionsController,
    );
    expect(controller).toBeDefined();
  });

  it('should provide PrismaService', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
  });

  it('should provide CashService', () => {
    const cashService = module.get<CashService>(CashService);
    expect(cashService).toBeDefined();
  });

  it('should provide CustomersService', () => {
    const customersService = module.get<CustomersService>(CustomersService);
    expect(customersService).toBeDefined();
  });
});
