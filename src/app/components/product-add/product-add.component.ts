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
  active: boolean = true;
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
    const normalizedId = this.normalizeOptionalInteger(this.id);
    if (normalizedId !== null) {
      formData.append('id', normalizedId);
    }
    formData.append('code', this.normalizeCode(this.code));
    formData.append('name',this.name);
    formData.append('description',this.description);
    formData.append('price',this.price.toString());
    formData.append('priceOverride', this.priceOverride.toString());
    formData.append('active', this.active.toString());
    formData.append('sellOnline', this.sellOnline.toString());
    formData.append('deliveryType', this.deliveryType);
    const normalizedEstimatedDeliveryDays = this.normalizeOptionalInteger(this.estimatedDeliveryDays);
    if (normalizedEstimatedDeliveryDays !== null) {
      formData.append('estimatedDeliveryDays', normalizedEstimatedDeliveryDays);
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
    formData.append('urlImage', this.normalizeOptionalText(this.urlImage));
    formData.append('userId', this.normalizeRequiredInteger(this.userId, 'userId'));
    formData.append('categoryId', this.normalizeRequiredInteger(this.categoryId, 'categoryId')); 
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
      error: (error) => {
        this.alertService.errorAlert(error?.error?.message || 'No se pudo guardar el producto.');
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
              this.code = this.normalizeCode(data.code);
              this.name = data.name;
              this.description = data.description;
              this.price = data.price;
              this.priceOverride = data.priceOverride ?? false;
              this.active = data.active ?? true;
              this.sellOnline = data.sellOnline ?? true;
              this.deliveryType = data.deliveryType ?? 'IMMEDIATE';
              this.estimatedDeliveryDays = this.parseOptionalInteger(data.estimatedDeliveryDays);
              this.estimatedDeliveryDate = data.estimatedDeliveryDate ?? '';
              this.deliveryNote = data.deliveryNote ?? '';
              this.urlImage = this.normalizeOptionalText(data.urlImage);
              this.selectedImagesLabel = this.buildStoredImagesLabel(data.images, this.urlImage);
              this.userId = this.normalizeOptionalInteger(data.userId) ?? this.user.toString();
              this.categoryId = this.normalizeOptionalInteger(data.categoryId) ?? this.categoryId;
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

  private normalizeCode(code: unknown): string {
    if (code === null || code === undefined) {
      return '';
    }
    const normalized = String(code).trim();
    if (!normalized || normalized.toLowerCase() === 'null' || normalized.toLowerCase() === 'undefined') {
      return '';
    }
    return normalized;
  }

  private normalizeOptionalText(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    const normalized = String(value).trim();
    if (!normalized || normalized.toLowerCase() === 'null' || normalized.toLowerCase() === 'undefined') {
      return '';
    }
    return normalized;
  }

  private buildStoredImagesLabel(images: string[] | undefined, urlImage: string): string {
    if (images?.length) {
      return `${images.length} imagen${images.length === 1 ? '' : 'es'} cargada${images.length === 1 ? '' : 's'}`;
    }
    if (urlImage) {
      return 'Imagen cargada';
    }
    return 'Ninguna imagen seleccionada';
  }

  private normalizeOptionalInteger(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    const normalized = String(value).trim();
    if (!normalized || normalized.toLowerCase() === 'null' || normalized.toLowerCase() === 'undefined') {
      return null;
    }
    return normalized;
  }

  private normalizeRequiredInteger(value: unknown, fieldName: string): string {
    const normalized = this.normalizeOptionalInteger(value);
    if (normalized === null) {
      throw new Error(`Missing required integer field: ${fieldName}`);
    }
    return normalized;
  }

  private parseOptionalInteger(value: unknown): number | null {
    const normalized = this.normalizeOptionalInteger(value);
    if (normalized === null) {
      return null;
    }
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  getCategories(){
    return this.categoryService.getAdminCategoryList().subscribe(
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
        this.variants = variants.length ? variants.map((variant) => ({
          ...variant,
          sku: variant.sku ?? '',
          size: variant.size ?? '',
          color: variant.color ?? '',
          material: variant.material ?? '',
          usage: variant.usage ?? '',
          deliveryType: variant.deliveryType ?? 'IMMEDIATE',
          estimatedDeliveryDays: variant.estimatedDeliveryDays ?? 0,
          estimatedDeliveryDate: variant.estimatedDeliveryDate ?? '',
          deliveryNote: variant.deliveryNote ?? '',
          stockCurrent: variant.stockCurrent ?? 0,
          stockMinimum: variant.stockMinimum ?? 0,
          priceRetail: variant.priceRetail ?? 0,
          priceWholesale: variant.priceWholesale ?? 0,
          active: variant.active ?? true,
          sellOnline: variant.sellOnline ?? true
        })) : [];
        this.skuManualFlags = this.variants.map((variant) => !!variant.sku);
        if (this.variants.length === 0) {
          this.addVariant();
        }
      },
      error: () => {
        this.variants = [];
        this.skuManualFlags = [];
        this.addVariant();
        this.alertService.errorAlert('No se pudieron cargar las variantes del producto.');
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
