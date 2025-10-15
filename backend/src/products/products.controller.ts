import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './products.entity';
import { ProductInput } from './dto/product.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ✅ GET /products → seznam všech produktů
  @Get()
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  // ✅ GET /products/:id → detail produktu
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  // ✅ POST /products → vytvoření nového produktu
  @Post()
  @UseGuards(JwtAuthGuard) // 🔑 REST → JWT guard
  create(@Body() productData: ProductInput): Promise<Product> {
    return this.productsService.create(productData);
  }

  // ✅ PUT /products/:id → update produktu
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<ProductInput>,
  ): Promise<Product> {
    return this.productsService.update(id, updateData);
  }

  // ✅ DELETE /products/:id → soft delete (vrací přímo produkt)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.delete(id);
  }
}

