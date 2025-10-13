import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './products.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /products
  @Get()
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  // POST /products
  @Post()
  create(@Body() productData: Partial<Product>): Promise<Product> {
    return this.productsService.create(productData);
  }

  // GET /products/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  // DELETE /products/:id
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ deleted: boolean }> {
    const deleted = await this.productsService.delete(id);
    return { deleted };
  }
}
