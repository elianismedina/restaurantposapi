import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async createCategory(
    @Body() body: { name: string; description?: string; parentId?: number },
  ) {
    return this.categoriesService.createCategory(body);
  }

  @Get()
  async getCategories() {
    return this.categoriesService.getCategories();
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    return this.categoriesService.getCategoryById(Number(id));
  }
}
