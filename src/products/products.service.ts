import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, branchId: number) {
    const { categoryId, subcategoryId, ...productData } = createProductDto;

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException(
        `Category with ID ${categoryId} does not exist`,
      );
    }

    if (subcategoryId) {
      const subcategory = await this.prisma.category.findUnique({
        where: { id: subcategoryId },
      });
      if (!subcategory) {
        throw new BadRequestException(
          `Subcategory with ID ${subcategoryId} does not exist`,
        );
      }
    }

    const categoriesToConnect = [{ id: categoryId }]; // Always connect the category
    if (subcategoryId) {
      categoriesToConnect.push({ id: subcategoryId }); // Connect the subcategory only if provided
    }

    return this.prisma.product.create({
      data: {
        ...productData,
        branch: {
          connect: { id: branchId },
        },
        categories: {
          connect: categoriesToConnect,
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
        categories: true,
      },
    });
  }
}
