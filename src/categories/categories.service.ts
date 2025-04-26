import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async createCategory(data: {
    name: string;
    description?: string;
    parentId?: number;
  }) {
    return this.prisma.category.create({
      data,
    });
  }

  async getCategories() {
    return this.prisma.category.findMany({
      include: { subcategories: true, products: true },
    });
  }

  async getCategoryById(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { subcategories: true, products: true },
    });
  }
}
