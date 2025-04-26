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
import { RestaurantsService } from './restaurants.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantResponseDto,
} from './dto/restaurant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @Roles('admin')
  async createRestaurant(
    @Body() dto: CreateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.createRestaurant(dto);
  }

  @Get(':id')
  async getRestaurant(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.getRestaurant(id);
  }

  @Put(':id')
  @Roles('admin')
  async updateRestaurant(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.updateRestaurant(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  async deleteRestaurant(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.restaurantsService.deleteRestaurant(id);
  }

  @Get(':id/branches')
  async getRestaurantBranches(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantsService.getRestaurantBranches(id);
  }
}
