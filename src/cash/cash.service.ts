import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCashTransactionDto,
  CashTransactionResponseDto,
} from './dto/cash-transaction.dto';
import {
  CreateDailyClosingDto,
  DailyClosingResponseDto,
} from './dto/daily-closing.dto';
import {
  CreateCashRegisterDto,
  CashRegisterResponseDto,
} from './dto/cash-register.dto';

@Injectable()
export class CashService {
  constructor(private prisma: PrismaService) {}

  // New methods for cash register management
  async createCashRegister(
    userId: number,
    createCashRegisterDto: CreateCashRegisterDto,
  ): Promise<CashRegisterResponseDto> {
    const existingRegister = await this.prisma.cashRegister.findFirst({
      where: { userId },
    });

    if (existingRegister) {
      throw new BadRequestException('User already has a cash register');
    }

    return this.prisma.cashRegister.create({
      data: {
        userId,
        balance: createCashRegisterDto.initialBalance,
      },
    });
  }

  async getCashRegister(userId: number): Promise<CashRegisterResponseDto> {
    const cashRegister = await this.prisma.cashRegister.findFirst({
      where: { userId },
    });

    if (!cashRegister) {
      throw new NotFoundException('Cash register not found');
    }

    return cashRegister;
  }

  async updateCashRegisterBalance(
    userId: number,
    amount: number,
  ): Promise<CashRegisterResponseDto> {
    const cashRegister = await this.prisma.cashRegister.findFirst({
      where: { userId },
    });

    if (!cashRegister) {
      throw new NotFoundException('Cash register not found');
    }

    return this.prisma.cashRegister.update({
      where: { id: cashRegister.id },
      data: { balance: amount },
    });
  }

  async createCashTransaction(
    dto: CreateCashTransactionDto,
    userId: number,
  ): Promise<CashTransactionResponseDto> {
    const { transactionId, amountTendered } = dto;

    // Verify transaction
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!transaction || transaction.paymentMethod !== 'cash') {
      throw new BadRequestException('Invalid or non-cash transaction');
    }

    // Get or create cash register for the user
    let cashRegister = await this.prisma.cashRegister.findFirst({
      where: { userId },
    });
    if (!cashRegister) {
      cashRegister = await this.prisma.cashRegister.create({
        data: { userId, balance: 0 },
      });
    }

    // Calculate change
    const changeGiven = amountTendered - transaction.total;
    if (changeGiven < 0) {
      throw new BadRequestException('Amount tendered is less than total');
    }

    // Create cash transaction and update balance
    return this.prisma.$transaction(async (prisma) => {
      const cashTransaction = await prisma.cashTransaction.create({
        data: {
          cashRegisterId: cashRegister.id,
          transactionId,
          amountTendered,
          changeGiven,
        },
      });

      await prisma.cashRegister.update({
        where: { id: cashRegister.id },
        data: { balance: { increment: amountTendered - changeGiven } },
      });

      return cashTransaction;
    });
  }

  async createDailyClosing(
    dto: CreateDailyClosingDto,
    userId: number,
  ): Promise<DailyClosingResponseDto> {
    const { actualCash, notes } = dto;

    // Get cash register
    const cashRegister = await this.prisma.cashRegister.findFirst({
      where: { userId },
    });
    if (!cashRegister) {
      throw new NotFoundException('Cash register not found');
    }

    // Calculate expected cash (sum of cash transactions for the day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const cashTransactions = await this.prisma.cashTransaction.findMany({
      where: {
        cashRegisterId: cashRegister.id,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: { transaction: true },
    });

    const expectedCash = cashTransactions.reduce(
      (sum, tx) => sum + (tx.amountTendered - tx.changeGiven),
      0,
    );

    // Create daily closing
    return this.prisma.$transaction(async (prisma) => {
      const dailyClosing = await prisma.dailyClosing.create({
        data: {
          cashRegisterId: cashRegister.id,
          userId,
          closingDate: new Date(),
          expectedCash,
          actualCash,
          discrepancy: actualCash - expectedCash,
          notes,
        },
      });

      // Reset cash register balance (optional, based on business logic)
      await prisma.cashRegister.update({
        where: { id: cashRegister.id },
        data: { balance: 0 },
      });

      return dailyClosing;
    });
  }

  async getDailyClosings(userId: number): Promise<DailyClosingResponseDto[]> {
    const cashRegister = await this.prisma.cashRegister.findFirst({
      where: { userId },
    });
    if (!cashRegister) {
      throw new NotFoundException('Cash register not found');
    }

    return this.prisma.dailyClosing.findMany({
      where: { cashRegisterId: cashRegister.id },
    });
  }
}
