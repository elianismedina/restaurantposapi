import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/transaction.dto';
import { CashService } from '../cash/cash.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private cashService: CashService,
    private customersService: CustomersService,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    userId: number,
    branchId: number,
  ) {
    const { productIds, quantities, paymentMethod, customerId } =
      createTransactionDto;

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

    // Create transaction and update stock
    return this.prisma.$transaction(async (prisma) => {
      const transaction = await prisma.transaction.create({
        data: {
          user: {
            connect: { id: userId },
          },
          branch: {
            connect: { id: branchId },
          },
          customer: customerId
            ? {
                connect: { id: customerId }, // Associate transaction with the customer
              }
            : undefined,
          total,
          paymentMethod,
          items: {
            create: transactionItems,
          },
        },
        include: { items: true },
      });

      // Update stock
      for (let i = 0; i < productIds.length; i++) {
        await prisma.product.update({
          where: { id: productIds[i] },
          data: { stock: { decrement: quantities[i] } },
        });
      }

      return transaction;
    });
  }

  findAll() {
    return this.prisma.transaction.findMany({
      include: {
        items: true,
        user: true,
      },
    });
  }

  async findOne(id: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        items: true,
        user: true,
      },
    });
    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }
    return transaction;
  }

  getSalesReport(startDate: Date, endDate: Date) {
    return this.prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: true,
        user: true,
      },
    });
  }
}
