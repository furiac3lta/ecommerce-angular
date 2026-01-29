import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
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
  urlImage: string = '';
  userId: string = '1';
  categoryId: string ='6';
  selectFile! : File;
  user: number = 0;
  categories : Category [] = [];
  variants: ProductVariant[] = [];
  skuManualFlags: boolean[] = [];

  constructor(
    private productService: ProductService,
    private router:Router, 
    private activatedRoute:ActivatedRoute,
    private toastr: ToastrService,
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
    const formData = new FormData();
    formData.append('id',this.id.toString());
    formData.append('code',this.code);
    formData.append('name',this.name);
    formData.append('description',this.description);
    formData.append('price',this.price.toString());
    formData.append('image', this.selectFile);
    formData.append('urlImage', this.urlImage);
    formData.append('userId',this.userId);
    formData.append('categoryId',this.categoryId); 
    console.log(formData);

    this.productService.createProduct(formData).subscribe(
      data => {
        if(this.id==0){
          this.toastr.success('Producto registrado correctamante', 'Productos');
        }else{
          this.toastr.success('Producto actualizado correctamante', 'Productos');
        }
        this.saveVariants(data.id);
      }
    );
    
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
              this.urlImage = data.urlImage;
              this.userId = data.userId;
              this.categoryId = data.categoryId;
              this.loadVariants(data.id);
            }
          )
        }
      }
    )
  }
  onFileSelected(event: any){
    this.selectFile = event.target.files[0];
  }

  getCategories(){
    return this.categoryService.getCategoryList().subscribe(
      data => {
        this.categories = data;
        this.refreshAllSkus();
      }
    )
  }

  isKimonoSelected(): boolean {
    const category = this.categories.find(cat => cat.id?.toString() === this.categoryId);
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
      active: true
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
          this.toastr.error('No se pudo guardar una variante', 'Variantes');
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
      this.toastr.error(`Completa el SKU de la variante ${emptyIndex + 1}`, 'Variantes');
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
      this.toastr.error(`SKU duplicado: ${unique}`, 'Variantes');
      return false;
    }
    return true;
  }
}
