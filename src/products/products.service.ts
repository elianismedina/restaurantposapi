import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  create(createProductDto: CreateProductDto, branchId: number | string) {
    const branchIdNumber =
      typeof branchId === 'string' ? parseInt(branchId, 10) : branchId;

    if (isNaN(branchIdNumber)) {
      throw new Error('Invalid branchId: must be a number');
    }

    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        sku: createProductDto.sku,
        price: createProductDto.price,
        stock: createProductDto.stock,
        branch: {
          connect: {
            id: branchIdNumber, // Ensure branchId is a number
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.product.findMany();
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id); // Ensure product exists
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Ensure product exists
    return this.prisma.product.delete({ where: { id } });
  }

  async assignCategoryToProduct(productId: number, categoryId: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        categories: {
          connect: { id: categoryId },
        },
      },
    });
  }

  async findByCategory(categoryId: number) {
    return this.prisma.product.findMany({
      where: {
        categories: {
          some: {
            id: categoryId,
          },
        },
      },
      include: {
        categories: true, // Include category details if needed
      },
    });
  }
}
