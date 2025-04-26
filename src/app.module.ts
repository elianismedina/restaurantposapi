import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AuthModule } from './auth/auth.module';
import { CashModule } from './cash/cash.module';
import { CustomersModule } from './customers/customers.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProductsModule,
    TransactionsModule,
    AuthModule,
    CashModule,
    CustomersModule,
    RestaurantsModule,
    CategoriesModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
