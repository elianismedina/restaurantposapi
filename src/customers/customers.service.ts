import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerResponseDto,
} from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  private transformCustomer(customer: any): CustomerResponseDto {
    return {
      ...customer,
      preferences: customer.preferences as Record<string, any>,
    };
  }

  async create(
    createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    try {
      const customer = await this.prisma.customer.create({
        data: createCustomerDto,
      });
      return this.transformCustomer(customer);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<CustomerResponseDto[]> {
    const customers = await this.prisma.customer.findMany();
    return customers.map((customer) => this.transformCustomer(customer));
  }

  async findOne(id: number): Promise<CustomerResponseDto> {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    return this.transformCustomer(customer);
  }

  async findOrderHistory(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        transactions: {
          include: {
            items: { include: { product: true } },
            user: true,
          },
        },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer.transactions;
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    await this.findOne(id);
    try {
      const customer = await this.prisma.customer.update({
        where: { id },
        data: updateCustomerDto,
      });
      return this.transformCustomer(customer);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.customer.delete({ where: { id } });
  }
}
