import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
    userId: number,
    branchId: number,
  ) {
    const {
      productIds,
      quantities,
      paymentMethod,
      amountTendered,
      customerId,
    } = createTransactionDto;

    if (productIds.length !== quantities.length) {
      throw new BadRequestException('Product IDs and quantities must match');
    }

    // Fetch products and validate stock
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Some products not found');
    }

    let total = 0;
    const transactionItems = [];
    for (let i = 0; i < productIds.length; i++) {
      const product = products.find((p) => p.id === productIds[i]);
      const quantity = quantities[i];

      if (!product) {
        throw new BadRequestException(
          `Product with ID ${productIds[i]} not found`,
        );
      }

      if (product.stock < quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      total += product.price * quantity;
      transactionItems.push({
        productId: product.id,
        quantity,
        price: product.price,
      });
    }

    if (
      paymentMethod === 'cash' &&
      (!amountTendered || amountTendered < total)
    ) {
      throw new BadRequestException('Insufficient cash tendered');
    }

    // Fetch the CashRegister ID for the user
    const cashRegister = await this.prisma.cashRegister.findUnique({
      where: { userId },
    });

    if (!cashRegister) {
      throw new BadRequestException('No cash register found for this user');
    }

    // Create transaction and update stock
    return this.prisma.$transaction(async (prisma) => {
      const transaction = await prisma.transaction.create({
        data: {
          User: {
            connect: { id: userId },
          },
          Branch: {
            connect: { id: branchId },
          },
          Customer: customerId
            ? {
                connect: { id: customerId },
              }
            : undefined,
          total,
          paymentMethod,
          items: {
            create: transactionItems,
          },
        },
        include: { items: { include: { Product: true } } },
      });

      // Update stock
      for (let i = 0; i < productIds.length; i++) {
        await prisma.product.update({
          where: { id: productIds[i] },
          data: { stock: { decrement: quantities[i] } },
        });
      }

      // Create cash transaction if payment method is cash
      if (paymentMethod === 'cash') {
        await prisma.cashTransaction.create({
          data: {
            transaction: {
              // Changed from transactionId to transaction
              connect: { id: transaction.id },
            },
            amountTendered,
            changeGiven: amountTendered - total,
            cashRegister: {
              connect: { id: cashRegister.id },
            },
          },
        });
      }

      return transaction;
    });
  }

  async findAll() {
    return this.prisma.transaction.findMany({
      include: { items: { include: { Product: true } } },
    });
  }

  async getSalesReport(startDate: Date, endDate: Date) {
    return this.prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { items: { include: { Product: true } } },
    });
  }
}
