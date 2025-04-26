import { Test, TestingModule } from '@nestjs/testing';
import { CashService } from './cash.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCashRegisterDto } from './dto/cash-register.dto';

describe('CashService', () => {
  let service: CashService;

  const mockPrismaService = {
    cashRegister: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CashService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CashService>(CashService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCashRegister', () => {
    const userId = 1;
    const createDto: CreateCashRegisterDto = {
      initialBalance: 100,
    };

    it('should create a new cash register', async () => {
      const expectedRegister = {
        id: 1,
        userId,
        balance: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.cashRegister.findFirst.mockResolvedValue(null);
      mockPrismaService.cashRegister.create.mockResolvedValue(expectedRegister);

      const result = await service.createCashRegister(userId, createDto);

      expect(result).toEqual(expectedRegister);
      expect(mockPrismaService.cashRegister.create).toHaveBeenCalledWith({
        data: {
          userId,
          balance: createDto.initialBalance,
        },
      });
    });

    it('should throw BadRequestException if user already has a cash register', async () => {
      const existingRegister = {
        id: 1,
        userId,
        balance: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.cashRegister.findFirst.mockResolvedValue(
        existingRegister,
      );

      await expect(
        service.createCashRegister(userId, createDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCashRegister', () => {
    const userId = 1;

    it('should return the cash register for the user', async () => {
      const expectedRegister = {
        id: 1,
        userId,
        balance: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.cashRegister.findFirst.mockResolvedValue(
        expectedRegister,
      );

      const result = await service.getCashRegister(userId);

      expect(result).toEqual(expectedRegister);
      expect(mockPrismaService.cashRegister.findFirst).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should throw NotFoundException when cash register is not found', async () => {
      mockPrismaService.cashRegister.findFirst.mockResolvedValue(null);

      await expect(service.getCashRegister(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCashRegisterBalance', () => {
    const userId = 1;
    const newBalance = 150;

    it('should update the cash register balance', async () => {
      const existingRegister = {
        id: 1,
        userId,
        balance: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedRegister = {
        ...existingRegister,
        balance: newBalance,
      };

      mockPrismaService.cashRegister.findFirst.mockResolvedValue(
        existingRegister,
      );
      mockPrismaService.cashRegister.update.mockResolvedValue(expectedRegister);

      const result = await service.updateCashRegisterBalance(
        userId,
        newBalance,
      );

      expect(result).toEqual(expectedRegister);
      expect(mockPrismaService.cashRegister.update).toHaveBeenCalledWith({
        where: { id: existingRegister.id },
        data: { balance: newBalance },
      });
    });

    it('should throw NotFoundException when cash register is not found', async () => {
      mockPrismaService.cashRegister.findFirst.mockResolvedValue(null);

      await expect(
        service.updateCashRegisterBalance(userId, newBalance),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
