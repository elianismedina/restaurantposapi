import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBranchDto,
  UpdateBranchDto,
  BranchResponseDto,
} from './dto/branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async createBranch(dto: CreateBranchDto): Promise<BranchResponseDto> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: dto.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return this.prisma.branch.create({
      data: dto,
    });
  }

  async getBranch(id: number): Promise<BranchResponseDto> {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async updateBranch(
    id: number,
    dto: UpdateBranchDto,
  ): Promise<BranchResponseDto> {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return this.prisma.branch.update({
      where: { id },
      data: dto,
    });
  }

  async deleteBranch(id: number): Promise<void> {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    await this.prisma.branch.delete({
      where: { id },
    });
  }

  async getBranchUsers(id: number) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch.users;
  }
}
