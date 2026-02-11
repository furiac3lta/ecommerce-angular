import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { Category } from 'src/app/common/category';
import { CategoryService } from 'src/app/services/category.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { ProductVariant } from 'src/app/common/product-variant';
import { ProductVariantService } from 'src/app/services/product-variant.service';

@Component({
  selector: 'app-product-add',
  templateUrl: './product-add.component.html',
  styleUrls: ['./product-add.component.css']
})
export class ProductAddComponent implements OnInit{
  
  id: number = 0;
  code: string ='001';
  name: string ='';
  description: string='';
  price: number =0;
  priceOverride: boolean = false;
  sellOnline: boolean = true;
  deliveryType: 'IMMEDIATE' | 'DELAYED' = 'IMMEDIATE';
  estimatedDeliveryDays: number | null = null;
  estimatedDeliveryDate: string = '';
  deliveryNote: string = '';
  urlImage: string = '';
  userId: string = '1';
  categoryId: string ='6';
  selectFiles: File[] = [];
  selectedImagesLabel: string = 'Ninguna imagen seleccionada';
  user: number = 0;
  categories : Category [] = [];
  variants: ProductVariant[] = [];
  skuManualFlags: boolean[] = [];

  constructor(
    private productService: ProductService,
    private router:Router, 
    private activatedRoute:ActivatedRoute,
    private alertService: AlertService,
    private categoryService:CategoryService,
    private sessionStorage:SessionStorageService,
    private productVariantService: ProductVariantService
    ){}

  ngOnInit(): void {
    const token = this.sessionStorage.getItem('token');
    this.getCategories();
    this.getProductById();
    this.user = this.sessionStorage.getItem('token').id;
    this.userId = this.user.toString();
    if (this.variants.length === 0) {
      this.addVariant();
    }
    
  }
  addProduct(){
    if (!this.validateSkus()) {
      return;
    }
    this.syncPriceWithCategory();
    const formData = new FormData();
    formData.append('id',this.id.toString());
    formData.append('code',this.code);
    formData.append('name',this.name);
    formData.append('description',this.description);
    formData.append('price',this.price.toString());
    formData.append('priceOverride', this.priceOverride.toString());
    formData.append('sellOnline', this.sellOnline.toString());
    formData.append('deliveryType', this.deliveryType);
    if (this.estimatedDeliveryDays !== null && this.estimatedDeliveryDays !== undefined) {
      formData.append('estimatedDeliveryDays', this.estimatedDeliveryDays.toString());
    }
    if (this.estimatedDeliveryDate) {
      formData.append('estimatedDeliveryDate', this.estimatedDeliveryDate);
    }
    if (this.deliveryNote) {
      formData.append('deliveryNote', this.deliveryNote);
    }
    if (this.selectFiles.length) {
      this.selectFiles.forEach((file) => formData.append('images', file));
      formData.append('image', this.selectFiles[0]);
    }
    formData.append('urlImage', this.urlImage);
    formData.append('userId',this.userId);
    formData.append('categoryId',this.categoryId); 
    console.log(formData);

    this.productService.createProduct(formData).subscribe({
      next: (data) => {
        if(this.id==0){
          this.alertService.successAlert('Producto registrado correctamente.');
        }else{
          this.alertService.successAlert('Producto actualizado correctamente.');
        }
        this.saveVariants(data.id);
      },
      error: () => {
        this.alertService.errorAlert('No se pudo guardar el producto.');
      }
    });
    
  }
  getProductById(){
    this.activatedRoute.params.subscribe(
      prod =>{
        let id = prod['id'];
        if(id){
          console.log('el valor de la variable id es: ' +id);
          this.productService.getProductById(id).subscribe(
            data => {
              this.id = data.id;
              this.code = data.code;
              this.name = data.name;
              this.description = data.description;
              this.price = data.price;
              this.priceOverride = data.priceOverride ?? false;
              this.sellOnline = data.sellOnline ?? true;
              this.deliveryType = data.deliveryType ?? 'IMMEDIATE';
              this.estimatedDeliveryDays = data.estimatedDeliveryDays ?? null;
              this.estimatedDeliveryDate = data.estimatedDeliveryDate ?? '';
              this.deliveryNote = data.deliveryNote ?? '';
              this.urlImage = data.urlImage;
              if (data.images?.length) {
                this.selectedImagesLabel = `${data.images.length} imagen${data.images.length === 1 ? '' : 'es'} cargada${data.images.length === 1 ? '' : 's'}`;
              }
              this.userId = data.userId;
              this.categoryId = data.categoryId;
              this.syncPriceWithCategory();
              this.loadVariants(data.id);
            }
          )
        }
      }
    )
  }
  onFileSelected(event: any){
    const files = Array.from(event.target.files ?? []) as File[];
    this.selectFiles = files;
    if (!files.length) {
      this.selectedImagesLabel = 'Ninguna imagen seleccionada';
      return;
    }
    this.selectedImagesLabel = files.length === 1
      ? files[0].name
      : `${files.length} imágenes seleccionadas`;
  }

  getCategories(){
    return this.categoryService.getCategoryList().subscribe(
      data => {
        this.categories = data;
        this.refreshAllSkus();
        this.syncPriceWithCategory();
      }
    )
  }

  handleCategoryChange() {
    this.refreshAllSkus();
    this.syncPriceWithCategory();
  }

  handlePriceOverrideChange() {
    if (!this.priceOverride) {
      this.syncPriceWithCategory();
      return;
    }
    if (!this.price) {
      this.syncPriceWithCategory();
    }
  }

  isKimonoSelected(): boolean {
    const category = this.getSelectedCategory();
    if (!category || !category.name) {
      return false;
    }
    return category.name.toLowerCase().includes('kimono');
  }

  addVariant() {
    this.variants.push({
      productId: this.id,
      size: '',
      color: '',
      gsm: 0,
      material: '',
      usage: '',
      sku: '',
      stockCurrent: 0,
      stockMinimum: 0,
      active: true,
      sellOnline: true,
      priceRetail: 0,
      priceWholesale: 0,
      deliveryType: 'IMMEDIATE',
      estimatedDeliveryDays: 0,
      estimatedDeliveryDate: '',
      deliveryNote: ''
    });
    this.skuManualFlags.push(false);
    this.updateSku(this.variants.length - 1);
  }

  removeVariant(index: number) {
    this.variants.splice(index, 1);
    this.skuManualFlags.splice(index, 1);
  }

  private loadVariants(productId: number) {
    this.productVariantService.getByProduct(productId).subscribe({
      next: (variants) => {
        this.variants = variants.length ? variants : [];
        this.skuManualFlags = this.variants.map((variant) => !!variant.sku);
        if (this.variants.length === 0) {
          this.addVariant();
        }
      },
      error: () => {
        this.variants = [];
        this.skuManualFlags = [];
        this.addVariant();
      }
    });
  }

  private saveVariants(productId: number) {
    if (!this.variants.length) {
      this.router.navigate(['admin/product']);
      return;
    }
    let pending = this.variants.length;
    this.variants.forEach((variant) => {
      const payload: ProductVariant = {
        ...variant,
        id: variant.id && variant.id > 0 ? variant.id : undefined,
        productId: productId
      };
      this.productVariantService.save(payload).subscribe({
        next: () => {
          pending -= 1;
          if (pending === 0) {
            this.router.navigate(['admin/product']);
          }
        },
        error: () => {
          this.alertService.errorAlert('No se pudo guardar una variante.');
          pending -= 1;
          if (pending === 0) {
            this.router.navigate(['admin/product']);
          }
        }
      });
    });
  }

  markSkuManual(index: number) {
    this.skuManualFlags[index] = true;
  }

  refreshAllSkus() {
    this.variants.forEach((_, index) => this.updateSku(index));
  }

  updateSku(index: number) {
    const variant = this.variants[index];
    if (!variant) {
      return;
    }
    if (this.skuManualFlags[index] && variant.sku) {
      return;
    }
    const baseSku = this.buildSkuBase(variant);
    if (!baseSku) {
      return;
    }
    variant.sku = this.makeUniqueSku(baseSku, index);
    this.skuManualFlags[index] = false;
  }

  private getSelectedCategory(): Category | undefined {
    return this.categories.find(cat => cat.id?.toString() === this.categoryId);
  }

  private syncPriceWithCategory() {
    if (this.priceOverride) {
      return;
    }
    const category = this.getSelectedCategory();
    if (!category) {
      return;
    }
    this.price = Number(category.price ?? 0);
  }

  private buildSkuBase(variant: ProductVariant): string {
    const size = this.normalizeSkuPart(variant.size || '', 4);
    const color = this.normalizeSkuPart(variant.color || '', 4);
    if (!size || !color) {
      return '';
    }
    const category = this.categories.find(cat => cat.id?.toString() === this.categoryId);
    const categoryPart = this.normalizeSkuPart(category?.name || '', 3) || 'GEN';
    const codePart = this.normalizeSkuPart(this.code || '', 4);
    const parts = ['LB', categoryPart, size, color].filter(Boolean);
    if (codePart) {
      parts.push(codePart);
    }
    return parts.join('-');
  }

  private makeUniqueSku(baseSku: string, index: number): string {
    const normalizedBase = baseSku.toUpperCase();
    let candidate = normalizedBase;
    let suffix = 2;
    const existing = new Set(
      this.variants
        .map((variant, idx) => (idx === index ? '' : (variant.sku || '').toUpperCase()))
        .filter(Boolean)
    );
    while (existing.has(candidate)) {
      candidate = `${normalizedBase}-${suffix}`;
      suffix += 1;
    }
    return candidate;
  }

  private normalizeSkuPart(value: string, maxLength: number): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, maxLength);
  }

  private validateSkus(): boolean {
    const skus = this.variants.map(variant => (variant.sku || '').trim());
    const emptyIndex = skus.findIndex(sku => !sku);
    if (emptyIndex !== -1) {
      this.alertService.errorAlert(`Completa el SKU de la variante ${emptyIndex + 1}.`);
      return false;
    }
    const normalized = skus.map(sku => sku.toUpperCase());
    const duplicates: string[] = [];
    const seen = new Set<string>();
    normalized.forEach((sku) => {
      if (seen.has(sku)) {
        duplicates.push(sku);
      }
      seen.add(sku);
    });
    if (duplicates.length) {
      const unique = Array.from(new Set(duplicates)).join(', ');
      this.alertService.errorAlert(`SKU duplicado: ${unique}.`);
      return false;
    }
    return true;
  }
}
