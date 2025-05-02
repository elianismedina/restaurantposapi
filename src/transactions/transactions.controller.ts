import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: {
    userId: number;
    branchId: number;
    [key: string]: any;
  };
}

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  prisma: any;
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req: RequestWithUser,
  ) {
    const { userId, branchId } = req.user;

    if (!branchId) {
      throw new BadRequestException('Branch ID is required');
    }

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
          user: {
            connect: { id: userId },
          },
          branch: {
            connect: { id: branchId },
          },
          customer: customerId
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
            transactionId: transaction.id,
            amountTendered,
            changeGiven: amountTendered - total,
            cashRegister: {
              connect: { id: cashRegister.id }, // Use the cash register ID
            },
          },
        });
      }

      return transaction;
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.transactionsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('report')
  @ApiOperation({ summary: 'Get sales report for a date range' })
  @ApiQuery({
    name: 'startDate',
    type: String,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'Sales report' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionsService.getSalesReport(
      new Date(startDate),
      new Date(endDate),
    );
  }
}
