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
    const cashRegister = await this.prisma.cashRegister.findFirst({
      where: { userId }, // Use findFirst for non-unique fields
    });

    if (!cashRegister) {
      throw new BadRequestException('No cash register found for this user');
    }

    // Create transaction and update stock
    return this.prisma.$transaction(async (prisma) => {
      const transaction = await prisma.transaction.create({
        data: {
          User: {
            connect: { id: userId }, // Relation to User
          },
          Branch: {
            connect: { id: branchId }, // Relation to Branch
          },
          Customer: customerId
            ? {
                connect: { id: customerId }, // Relation to Customer
              }
            : undefined,
          total,
          paymentMethod,
          items: {
            create: transactionItems, // Ensure this matches the items relation in your schema
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

      // Create cash transaction if payment method is cash
      if (paymentMethod === 'cash') {
        console.log('Creating cash transaction...');
        await prisma.cashTransaction.create({
          data: {
            transaction: {
              connect: { id: transaction.id }, // Use connect to reference the transaction
            },
            amountTendered,
            changeGiven: amountTendered - total,
            cashRegister: {
              connect: { id: cashRegister.id }, // Ensure cashRegister.id is valid
            },
          },
        });
      }

      return transaction;
    });
  }

  findAll() {
    return this.prisma.transaction.findMany({
      include: {
        items: true, // Include the items relation
        User: true, // Include the User relation
        Branch: true, // Include the Branch relation
      },
    });
  }

  async findOne(id: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        items: true, // Include the items relation
        User: true, // Include the User relation
        Branch: true, // Include the Branch relation
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
        items: true, // Include the items relation
        User: true, // Use "User" with a capital "U"
      },
    });
  }
}
