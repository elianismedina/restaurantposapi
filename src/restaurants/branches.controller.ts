import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import {
  CreateBranchDto,
  UpdateBranchDto,
  BranchResponseDto,
} from './dto/branch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Roles('admin', 'manager')
  async createBranch(@Body() dto: CreateBranchDto): Promise<BranchResponseDto> {
    return this.branchesService.createBranch(dto);
  }

  @Get(':id')
  async getBranch(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BranchResponseDto> {
    return this.branchesService.getBranch(id);
  }

  @Put(':id')
  @Roles('admin', 'manager')
  async updateBranch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBranchDto,
  ): Promise<BranchResponseDto> {
    return this.branchesService.updateBranch(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  async deleteBranch(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.branchesService.deleteBranch(id);
  }

  @Get(':id/users')
  async getBranchUsers(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.getBranchUsers(id);
  }
}
