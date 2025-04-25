import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/transaction.dto';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const mockTransactionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    getSalesReport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createTransactionDto: CreateTransactionDto = {
      productIds: [1, 2],
      quantities: [2, 1],
      paymentMethod: 'cash',
      amountTendered: 300,
      customerId: 1,
    };

    const mockRequest = {
      user: {
        userId: 1,
      },
    };

    it('should create a transaction', async () => {
      const expectedTransaction = {
        id: 1,
        userId: 1,
        total: 250,
        paymentMethod: 'cash',
        items: [
          { productId: 1, quantity: 2, price: 100 },
          { productId: 2, quantity: 1, price: 50 },
        ],
      };

      mockTransactionsService.create.mockResolvedValue(expectedTransaction);

      const result = await controller.create(createTransactionDto, mockRequest);

      expect(result).toEqual(expectedTransaction);
      expect(mockTransactionsService.create).toHaveBeenCalledWith(
        createTransactionDto,
        1,
      );
    });
  });

  describe('findAll', () => {
    it('should return all transactions', async () => {
      const expectedTransactions = [
        {
          id: 1,
          total: 250,
          items: [{ product: { id: 1, name: 'Product 1' } }],
          user: { id: 1, name: 'User 1' },
          customer: { id: 1, name: 'Customer 1' },
        },
      ];

      mockTransactionsService.findAll.mockResolvedValue(expectedTransactions);

      const result = await controller.findAll();

      expect(result).toEqual(expectedTransactions);
      expect(mockTransactionsService.findAll).toHaveBeenCalled();
    });
  });

  describe('getSalesReport', () => {
    it('should return sales report for date range', async () => {
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      const expectedReport = [
        {
          id: 1,
          total: 250,
          createdAt: new Date('2023-01-15'),
          items: [{ product: { id: 1, name: 'Product 1' } }],
          user: { id: 1, name: 'User 1' },
          customer: { id: 1, name: 'Customer 1' },
        },
      ];

      mockTransactionsService.getSalesReport.mockResolvedValue(expectedReport);

      const result = await controller.getSalesReport(startDate, endDate);

      expect(result).toEqual(expectedReport);
      expect(mockTransactionsService.getSalesReport).toHaveBeenCalledWith(
        new Date(startDate),
        new Date(endDate),
      );
    });
  });
});
