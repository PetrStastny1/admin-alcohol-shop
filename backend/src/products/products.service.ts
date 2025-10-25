import {
  Injectable,
  OnModuleInit,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      where: { isActive: true },
      relations: ['category', 'orderItems'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'orderItems'],
    });
    if (!product) throw new NotFoundException(`Produkt s ID ${id} nenalezen`);
    return product;
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    return this.productRepository.find({
      where: { isActive: true, category: { id: categoryId } },
      relations: ['category', 'orderItems'],
      order: { id: 'ASC' },
    });
  }

  async findByNameAndCategory(
    name: string,
    categoryId?: number,
  ): Promise<Product | null> {
    return this.productRepository.findOne({
      where: categoryId ? { name, category: { id: categoryId } } : { name },
      relations: ['category'],
    });
  }

  async create(
    productData: Partial<Product> & { categoryId?: number },
  ): Promise<Product> {
    let category = undefined;
    if (productData.categoryId) {
      category = await this.categoriesService.findOne(productData.categoryId);
      if (!category) {
        throw new NotFoundException(
          `Kategorie s ID ${productData.categoryId} nenalezena`,
        );
      }
    }

    const existing = await this.findByNameAndCategory(
      productData.name!,
      category?.id,
    );

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.price = productData.price ?? existing.price;
        existing.description = productData.description ?? existing.description;
        existing.stock = productData.stock ?? existing.stock;
        existing.category = category ?? existing.category;
        await this.productRepository.save(existing);
        return this.findOne(existing.id);
      }
      throw new BadRequestException(
        `Produkt "${productData.name}" v této kategorii již existuje`,
      );
    }

    const newProduct = this.productRepository.create({
      name: productData.name,
      price: productData.price,
      description: productData.description,
      stock: productData.stock ?? 0,
      isActive: productData.isActive ?? true,
      category,
    });

    const saved = await this.productRepository.save(newProduct);
    return this.findOne(saved.id);
  }

  async update(
    id: number,
    updateData: Partial<Product> & { categoryId?: number },
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (updateData.name !== undefined) product.name = updateData.name;
    if (updateData.price !== undefined) product.price = updateData.price;
    if (updateData.description !== undefined)
      product.description = updateData.description;
    if (updateData.isActive !== undefined)
      product.isActive = updateData.isActive;
    if (updateData.stock !== undefined) product.stock = updateData.stock;

    if (updateData.categoryId !== undefined) {
      const category = await this.categoriesService.findOne(
        updateData.categoryId,
      );
      if (!category) {
        throw new NotFoundException(
          `Kategorie s ID ${updateData.categoryId} nenalezena`,
        );
      }
      product.category = category;
    }

    await this.productRepository.save(product);
    return this.findOne(id);
  }

  async delete(id: number): Promise<boolean> {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Produkt s ID ${id} nenalezen`);
    }
    if (!product.isActive) {
      return false;
    }
    product.isActive = false;
    await this.productRepository.save(product);
    return true;
  }

  async onModuleInit() {
    const categories = await this.categoriesService.findAll();
    if (!categories.length) return;

    const seedMap: Record<
      string,
      { name: string; price: number; description: string; stock: number }[]
    > = {
      Whisky: [
        { name: 'Jameson Irish Whiskey', price: 450, description: 'Jemná irská whiskey s tóny vanilky.', stock: 15 },
        { name: 'Glenfiddich 12y', price: 1200, description: 'Skotská single malt whisky, ovocná a jemná.', stock: 8 },
        { name: 'Jack Daniel’s Old No. 7', price: 700, description: 'Tennessee whiskey s kouřovou chutí.', stock: 20 },
        { name: 'Chivas Regal 12y', price: 900, description: 'Směsová whisky s medovými tóny.', stock: 12 },
        { name: 'Tullamore Dew', price: 500, description: 'Lehká irská whiskey s jemným závěrem.', stock: 18 },
      ],
      Vodka: [
        { name: 'Absolut Vodka', price: 350, description: 'Švédská vodka s čistou chutí.', stock: 25 },
        { name: 'Finlandia', price: 400, description: 'Vodka z ječmene a ledovcové vody.', stock: 22 },
        { name: 'Stolichnaya', price: 380, description: 'Tradiční ruská vodka, jemná a vyvážená.', stock: 30 },
        { name: 'Belvedere', price: 1200, description: 'Luxusní polská vodka s krémovým závěrem.', stock: 10 },
        { name: 'Grey Goose', price: 1300, description: 'Francouzská prémiová vodka.', stock: 7 },
      ],
      Rum: [
        { name: 'Captain Morgan Spiced Gold', price: 420, description: 'Rum s kořením a vanilkou.', stock: 28 },
        { name: 'Havana Club 7 Años', price: 600, description: 'Kubánský rum s tóny kakaa a ovoce.', stock: 14 },
        { name: 'Diplomatico Reserva Exclusiva', price: 900, description: 'Sladší venezuelský rum.', stock: 12 },
        { name: 'Kraken Black Spiced', price: 750, description: 'Tmavý rum s karamelovými tóny.', stock: 16 },
        { name: 'Zacapa 23', price: 1300, description: 'Prémiový guatemalský rum.', stock: 6 },
      ],
      Likéry: [
        { name: 'Baileys Irish Cream', price: 400, description: 'Smetanový likér s čokoládovými tóny.', stock: 20 },
        { name: 'Jägermeister', price: 380, description: 'Bylinný likér s 56 ingrediencemi.', stock: 25 },
        { name: 'Amaretto Disaronno', price: 500, description: 'Mandlový likér z Itálie.', stock: 18 },
        { name: 'Kahlúa', price: 420, description: 'Kávový likér z Mexika.', stock: 15 },
        { name: 'Cointreau', price: 600, description: 'Pomerančový likér, základ koktejlů.', stock: 12 },
      ],
      Brandy: [
        { name: 'Metaxa 7 Stars', price: 550, description: 'Řecká brandy s jemnou chutí.', stock: 14 },
        { name: 'Hennessy VS', price: 1200, description: 'Francouzský koňak s tóny dubu.', stock: 10 },
        { name: 'Remy Martin VSOP', price: 1600, description: 'Luxusní koňak s ovocnými tóny.', stock: 8 },
        { name: 'Ararat 5 Stars', price: 800, description: 'Arménská brandy s karamelovým závěrem.', stock: 16 },
        { name: 'Carlos I', price: 1000, description: 'Španělská brandy s jemnou strukturou.', stock: 9 },
      ],
      Víno: [
        { name: 'Chardonnay', price: 250, description: 'Suché bílé víno s ovocnými tóny.', stock: 40 },
        { name: 'Merlot', price: 300, description: 'Červené víno s jemnými taniny.', stock: 35 },
        { name: 'Cabernet Sauvignon', price: 350, description: 'Plné červené víno s tóny černého rybízu.', stock: 32 },
        { name: 'Sauvignon Blanc', price: 270, description: 'Svěží bílé víno s citrusovým aroma.', stock: 38 },
        { name: 'Rosé Provence', price: 280, description: 'Lehké růžové víno z Francie.', stock: 36 },
      ],
      Pivo: [
        { name: 'Pilsner Urquell', price: 30, description: 'Tradiční český ležák.', stock: 100 },
        { name: 'Staropramen', price: 28, description: 'Oblíbený pražský ležák.', stock: 90 },
        { name: 'Heineken', price: 32, description: 'Světlý ležák z Holandska.', stock: 85 },
        { name: 'Corona Extra', price: 35, description: 'Lehké mexické pivo s limetkou.', stock: 80 },
        { name: 'Guinness Draught', price: 45, description: 'Tmavý irský stout.', stock: 70 },
      ],
      Gin: [
        { name: 'Beefeater London Dry', price: 450, description: 'Tradiční londýnský suchý gin.', stock: 20 },
        { name: 'Bombay Sapphire', price: 500, description: 'Aromatický gin s botanickými tóny.', stock: 18 },
        { name: 'Tanqueray', price: 480, description: 'Klasický gin s jalovcovým aroma.', stock: 22 },
        { name: 'Hendrick’s Gin', price: 700, description: 'Prémiový gin s okurkou a růží.', stock: 12 },
        { name: 'Monkey 47', price: 1200, description: 'Komplexní německý gin s 47 ingrediencemi.', stock: 8 },
      ],
      Tequila: [
        { name: 'Olmeca Blanco', price: 400, description: 'Čirá tequila s čerstvou chutí.', stock: 18 },
        { name: 'Jose Cuervo Especial', price: 450, description: 'Zlatá tequila, populární do koktejlů.', stock: 20 },
        { name: 'Don Julio Blanco', price: 900, description: 'Prémiová čirá tequila.', stock: 10 },
        { name: 'Patrón Reposado', price: 1200, description: 'Vyvážená tequila s dubovým nádechem.', stock: 8 },
        { name: 'Herradura Añejo', price: 1300, description: 'Zralá tequila s jemnou chutí.', stock: 7 },
      ],
      Šampaňské: [
        { name: 'Moët & Chandon Brut', price: 1500, description: 'Luxusní francouzské šampaňské.', stock: 12 },
        { name: 'Veuve Clicquot Yellow Label', price: 1700, description: 'Ikonické šampaňské s plnou chutí.', stock: 10 },
        { name: 'Dom Pérignon Vintage', price: 4500, description: 'Exkluzivní ročníkové šampaňské.', stock: 5 },
        { name: 'Piper-Heidsieck Cuvée Brut', price: 1400, description: 'Svěží a ovocné šampaňské.', stock: 9 },
        { name: 'Taittinger Brut Réserve', price: 1600, description: 'Elegantní a jemné šampaňské.', stock: 7 },
      ],
    };

    for (const category of categories) {
      const products = seedMap[category.name] ?? [];
      for (const item of products) {
        const exists = await this.findByNameAndCategory(item.name, category.id);
        if (!exists) {
          await this.create({
            name: item.name,
            price: item.price,
            description: item.description,
            stock: item.stock,
            categoryId: category.id,
          });
        }
      }
    }
  }
}
