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
      relations: ['category', 'orders'],
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'orders'],
    });
    if (!product) throw new NotFoundException(`Produkt s ID ${id} nenalezen`);
    return product;
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    return this.productRepository.find({
      where: { isActive: true, category: { id: categoryId } },
      relations: ['category', 'orders'],
    });
  }

  async findByNameAndCategory(
    name: string,
    categoryId?: number,
  ): Promise<Product | null> {
    if (categoryId) {
      return this.productRepository.findOne({
        where: { name, category: { id: categoryId } },
        relations: ['category'],
      });
    }
    return this.productRepository.findOne({
      where: { name },
      relations: ['category'],
    });
  }

  async create(productData: Partial<Product> & { categoryId?: number }): Promise<Product> {
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
      throw new BadRequestException(
        `Produkt "${productData.name}" v této kategorii již existuje`,
      );
    }

    const newProduct = this.productRepository.create({
      name: productData.name,
      price: productData.price,
      description: productData.description,
      isActive: productData.isActive ?? true,
      category,
    });

    return this.productRepository.save(newProduct);
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

    if (updateData.categoryId !== undefined) {
      const category = await this.categoriesService.findOne(updateData.categoryId);
      if (!category) {
        throw new NotFoundException(
          `Kategorie s ID ${updateData.categoryId} nenalezena`,
        );
      }
      product.category = category;
    }

    return this.productRepository.save(product);
  }

  async delete(id: number): Promise<Product> {
    const product = await this.findOne(id);
    if (!product.isActive) return product;
    product.isActive = false;
    return this.productRepository.save(product);
  }

  async onModuleInit() {
    const categories = await this.categoriesService.findAll();
    if (!categories.length) {
      console.log('⚠️ Products seed skipped: no categories found');
      return;
    }

    const seedMap: Record<string, { name: string; price: number; description: string }[]> = {
      Whisky: [
        { name: 'Jameson Irish Whiskey', price: 450, description: 'Jemná irská whiskey s tóny vanilky.' },
        { name: 'Glenfiddich 12y', price: 1200, description: 'Skotská single malt whisky, ovocná a jemná.' },
        { name: 'Jack Daniel’s Old No. 7', price: 700, description: 'Tennessee whiskey s kouřovou chutí.' },
        { name: 'Chivas Regal 12y', price: 900, description: 'Směsová whisky s medovými tóny.' },
        { name: 'Tullamore Dew', price: 500, description: 'Lehká irská whiskey s jemným závěrem.' },
      ],
      Vodka: [
        { name: 'Absolut Vodka', price: 350, description: 'Švédská vodka s čistou chutí.' },
        { name: 'Finlandia', price: 400, description: 'Vodka z ječmene a ledovcové vody.' },
        { name: 'Stolichnaya', price: 380, description: 'Tradiční ruská vodka, jemná a vyvážená.' },
        { name: 'Belvedere', price: 1200, description: 'Luxusní polská vodka s krémovým závěrem.' },
        { name: 'Grey Goose', price: 1300, description: 'Francouzská prémiová vodka.' },
      ],
      Rum: [
        { name: 'Captain Morgan Spiced Gold', price: 420, description: 'Rum s kořením a vanilkou.' },
        { name: 'Havana Club 7 Años', price: 600, description: 'Kubánský rum s tóny kakaa a ovoce.' },
        { name: 'Diplomatico Reserva Exclusiva', price: 900, description: 'Sladší venezuelský rum.' },
        { name: 'Kraken Black Spiced', price: 750, description: 'Tmavý rum s karamelovými tóny.' },
        { name: 'Zacapa 23', price: 1300, description: 'Prémiový guatemalský rum.' },
      ],
      Likéry: [
        { name: 'Baileys Irish Cream', price: 400, description: 'Smetanový likér s čokoládovými tóny.' },
        { name: 'Jägermeister', price: 380, description: 'Bylinný likér s 56 ingrediencemi.' },
        { name: 'Amaretto Disaronno', price: 500, description: 'Mandlový likér z Itálie.' },
        { name: 'Kahlúa', price: 420, description: 'Kávový likér z Mexika.' },
        { name: 'Cointreau', price: 600, description: 'Pomerančový likér, základ koktejlů.' },
      ],
      Brandy: [
        { name: 'Metaxa 7 Stars', price: 550, description: 'Řecká brandy s jemnou chutí.' },
        { name: 'Hennessy VS', price: 1200, description: 'Francouzský koňak s tóny dubu.' },
        { name: 'Remy Martin VSOP', price: 1600, description: 'Luxusní koňak s ovocnými tóny.' },
        { name: 'Ararat 5 Stars', price: 800, description: 'Arménská brandy s karamelovým závěrem.' },
        { name: 'Carlos I', price: 1000, description: 'Španělská brandy s jemnou strukturou.' },
      ],
      Víno: [
        { name: 'Chardonnay', price: 250, description: 'Suché bílé víno s ovocnými tóny.' },
        { name: 'Merlot', price: 300, description: 'Červené víno s jemnými taniny.' },
        { name: 'Cabernet Sauvignon', price: 350, description: 'Plné červené víno s tóny černého rybízu.' },
        { name: 'Sauvignon Blanc', price: 270, description: 'Svěží bílé víno s citrusovým aroma.' },
        { name: 'Rosé Provence', price: 280, description: 'Lehké růžové víno z Francie.' },
      ],
      Pivo: [
        { name: 'Pilsner Urquell', price: 30, description: 'Tradiční český ležák.' },
        { name: 'Staropramen', price: 28, description: 'Oblíbený pražský ležák.' },
        { name: 'Heineken', price: 32, description: 'Světlý ležák z Holandska.' },
        { name: 'Corona Extra', price: 35, description: 'Lehké mexické pivo s limetkou.' },
        { name: 'Guinness Draught', price: 45, description: 'Tmavý irský stout.' },
      ],
      Gin: [
        { name: 'Beefeater London Dry', price: 450, description: 'Tradiční londýnský suchý gin.' },
        { name: 'Bombay Sapphire', price: 500, description: 'Aromatický gin s botanickými tóny.' },
        { name: 'Tanqueray', price: 480, description: 'Klasický gin s jalovcovým aroma.' },
        { name: 'Hendrick’s Gin', price: 700, description: 'Prémiový gin s okurkou a růží.' },
        { name: 'Monkey 47', price: 1200, description: 'Komplexní německý gin s 47 ingrediencemi.' },
      ],
      Tequila: [
        { name: 'Olmeca Blanco', price: 400, description: 'Čirá tequila s čerstvou chutí.' },
        { name: 'Jose Cuervo Especial', price: 450, description: 'Zlatá tequila, populární do koktejlů.' },
        { name: 'Don Julio Blanco', price: 900, description: 'Prémiová čirá tequila.' },
        { name: 'Patrón Reposado', price: 1200, description: 'Vyvážená tequila s dubovým nádechem.' },
        { name: 'Herradura Añejo', price: 1300, description: 'Zralá tequila s jemnou chutí.' },
      ],
      Šampaňské: [
        { name: 'Moët & Chandon Brut', price: 1500, description: 'Luxusní francouzské šampaňské.' },
        { name: 'Veuve Clicquot Yellow Label', price: 1700, description: 'Ikonické šampaňské s plnou chutí.' },
        { name: 'Dom Pérignon Vintage', price: 4500, description: 'Exkluzivní ročníkové šampaňské.' },
        { name: 'Piper-Heidsieck Cuvée Brut', price: 1400, description: 'Svěží a ovocné šampaňské.' },
        { name: 'Taittinger Brut Réserve', price: 1600, description: 'Elegantní a jemné šampaňské.' },
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
            categoryId: category.id,
          });
        }
      }
    }

    console.log('✅ Products seeded (5 produktů pro každou kategorii)');
  }
}
