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
      preferences: customer.preferences as Record<string, any>, // Explicitly cast preferences
    };
  }

  async create(
    createCustomerDto: CreateCustomerDto,
    branchId: number,
  ): Promise<CustomerResponseDto> {
    if (!branchId) {
      throw new Error('branchId is required to create a customer');
    }

    const customer = await this.prisma.customer.create({
      data: {
        name: createCustomerDto.name,
        email: createCustomerDto.email,
        phone: createCustomerDto.phone,
        address: createCustomerDto.address,
        preferences: createCustomerDto.preferences,
        branch: {
          connect: {
            id: branchId,
          },
        },
      },
    });

    return this.transformCustomer(customer); // Transform the customer before returning
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
            items: { include: { Product: true } }, // Use "Product" with a capital "P"
            User: true, // Include the User relation
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
