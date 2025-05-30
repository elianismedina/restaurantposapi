// src/cash/cash.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { CashService } from './cash.service';
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
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('cash')
@Controller('cash')
export class CashController {
  constructor(private readonly cashService: CashService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('transaction')
  @ApiOperation({ summary: 'Record a cash transaction' })
  @ApiResponse({
    status: 201,
    description: 'Cash transaction recorded',
    type: CashTransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createCashTransaction(@Body() dto: CreateCashTransactionDto, @Request() req) {
    return this.cashService.createCashTransaction(dto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('closing')
  @ApiOperation({ summary: 'Perform daily closing' })
  @ApiResponse({
    status: 201,
    description: 'Daily closing recorded',
    type: DailyClosingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createDailyClosing(@Body() dto: CreateDailyClosingDto, @Request() req) {
    return this.cashService.createDailyClosing(dto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('closings')
  @ApiOperation({ summary: 'Get all daily closings for the user' })
  @ApiResponse({
    status: 200,
    description: 'List of daily closings',
    type: [DailyClosingResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDailyClosings(@Request() req) {
    return this.cashService.getDailyClosings(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('register')
  @ApiOperation({ summary: 'Create a new cash register' })
  @ApiResponse({
    status: 201,
    description: 'Cash register created successfully',
    type: CashRegisterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createCashRegister(
    @Body() dto: CreateCashRegisterDto,
    @Request() req,
  ): Promise<CashRegisterResponseDto> {
    return this.cashService.createCashRegister(req.user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('register')
  @ApiOperation({ summary: "Get user's cash register" })
  @ApiResponse({
    status: 200,
    description: 'Cash register retrieved successfully',
    type: CashRegisterResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cash register not found' })
  getCashRegister(@Request() req): Promise<CashRegisterResponseDto> {
    return this.cashService.getCashRegister(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch('register/balance')
  @ApiOperation({ summary: 'Update cash register balance' })
  @ApiResponse({
    status: 200,
    description: 'Balance updated successfully',
    type: CashRegisterResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cash register not found' })
  updateBalance(
    @Body('balance') balance: number,
    @Request() req,
  ): Promise<CashRegisterResponseDto> {
    return this.cashService.updateCashRegisterBalance(req.user.userId, balance);
  }
}
