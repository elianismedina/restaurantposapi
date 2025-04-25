import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CashService } from '../cash/cash.service';
import { CustomersService } from '../customers/customers.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockCashService = {
    createCashTransaction: jest.fn(),
  };

  const mockCustomersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CashService,
          useValue: mockCashService,
        },
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const userId = 1;
    const createTransactionDto = {
      productIds: [1, 2],
      quantities: [2, 1],
      paymentMethod: 'cash',
      amountTendered: 300,
      customerId: 1,
    };

    const mockProducts = [
      { id: 1, name: 'Product 1', price: 100, stock: 10 },
      { id: 2, name: 'Product 2', price: 50, stock: 5 },
    ];

    const mockTransaction = {
      id: 1,
      userId,
      total: 250,
      paymentMethod: 'cash',
      items: [
        { productId: 1, quantity: 2, price: 100 },
        { productId: 2, quantity: 1, price: 50 },
      ],
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockCustomersService.findOne.mockResolvedValue({ id: 1 });
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);
    });

    it('should create a transaction successfully', async () => {
      const result = await service.create(createTransactionDto, userId);

      expect(result).toEqual(mockTransaction);
      expect(mockCustomersService.findOne).toHaveBeenCalledWith(1);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
      });
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          userId,
          total: 250,
          paymentMethod: 'cash',
          items: {
            create: [
              { productId: 1, quantity: 2, price: 100 },
              { productId: 2, quantity: 1, price: 50 },
            ],
          },
        },
        include: { items: true },
      });
      expect(mockPrismaService.product.update).toHaveBeenCalledTimes(2);
      expect(mockCashService.createCashTransaction).toHaveBeenCalledWith(
        {
          transactionId: 1,
          amountTendered: 300,
        },
        userId,
      );
    });

    it('should throw BadRequestException when product IDs and quantities do not match', async () => {
      const invalidDto = {
        ...createTransactionDto,
        quantities: [2],
      };

      await expect(service.create(invalidDto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when customer is not found', async () => {
      mockCustomersService.findOne.mockRejectedValue(
        new NotFoundException('Customer not found'),
      );

      await expect(
        service.create(createTransactionDto, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when some products are not found', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProducts[0]]);

      await expect(
        service.create(createTransactionDto, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      const lowStockProducts = [
        { id: 1, name: 'Product 1', price: 100, stock: 1 },
        { id: 2, name: 'Product 2', price: 50, stock: 5 },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(lowStockProducts);

      await expect(
        service.create(createTransactionDto, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when cash payment is insufficient', async () => {
      const insufficientCashDto = {
        ...createTransactionDto,
        amountTendered: 100,
      };

      await expect(service.create(insufficientCashDto, userId)).rejects.toThrow(
        BadRequestException,
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

      mockPrismaService.transaction.findMany.mockResolvedValue(
        expectedTransactions,
      );

      const result = await service.findAll();

      expect(result).toEqual(expectedTransactions);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        include: {
          items: { include: { product: true } },
          user: true,
          customer: true,
        },
      });
    });
  });

  describe('getSalesReport', () => {
    it('should return sales report for date range', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
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

      mockPrismaService.transaction.findMany.mockResolvedValue(expectedReport);

      const result = await service.getSalesReport(startDate, endDate);

      expect(result).toEqual(expectedReport);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          items: { include: { product: true } },
          user: true,
          customer: true,
        },
      });
    });
  });
});
