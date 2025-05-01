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
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req: RequestWithUser,
  ) {
    const { userId, branchId } = req.user;

    if (!branchId) {
      throw new BadRequestException('Branch ID is required');
    }

    return this.transactionsService.create(
      createTransactionDto,
      userId,
      branchId,
    );
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
