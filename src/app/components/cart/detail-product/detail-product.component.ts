import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemCart } from 'src/app/common/item-cart';
import { CartService } from 'src/app/services/cart.service';
import { HomeService } from 'src/app/services/home.service';
import { ProductVariant } from 'src/app/common/product-variant';
import { ProductVariantService } from 'src/app/services/product-variant.service';
import { AlertService } from 'src/app/services/alert.service';
import { MICROCOPY } from 'src/app/constants/microcopy';

@Component({
  selector: 'app-detail-product',
  templateUrl: './detail-product.component.html',
  styleUrls: ['./detail-product.component.css']
})
export class DetailProductComponent implements OnInit{

  id:number = 0;
  name:string = '';
  description: string = '';
  price: number = 0;
  urlImage: string = '';
  images: string[] = [];
  currentImageIndex = 0;
  quantity: number =1;
  variants: ProductVariant[] = [];
  selectedVariantId: number | null = null;
  isLoading = true;
  productDeliveryType: 'IMMEDIATE' | 'DELAYED' = 'IMMEDIATE';
  productEstimatedDeliveryDays: number | null = null;
  productEstimatedDeliveryDate: string = '';
  productDeliveryNote: string = '';

ngOnInit(): void{
  this.getProductById(); 
}
constructor(
  private homeService:HomeService,
  private activatedRoute:ActivatedRoute,
  private router: Router,
  private cartService:CartService,
  private alertService: AlertService,
  private productVariantService: ProductVariantService
){

}

getProductById(){
  this.isLoading = true;
  this.activatedRoute.params.subscribe(
    p =>{
      let id = p[ 'id' ];
      if(id){
        this.homeService.getProductById(id).subscribe(
          data =>{
            if (data && (data as any).sellOnline === false) {
              this.alertService.errorAlert('Este producto no está disponible en la tienda online.');
              this.router.navigate(['/']);
              this.isLoading = false;
              return;
            }
            this.id= data.id;
            this.name = data.name;
            this.description = data.description;
            this.price = data.price != null ? Number(data.price) : 0;
            this.urlImage = data.urlImage;
            const imgs = Array.isArray((data as any).images) ? (data as any).images.filter(Boolean) : [];
            if (this.urlImage && !imgs.includes(this.urlImage)) {
              imgs.unshift(this.urlImage);
            }
            this.images = imgs.length ? imgs : (this.urlImage ? [this.urlImage] : []);
            this.currentImageIndex = 0;
            this.productDeliveryType = data.deliveryType ?? 'IMMEDIATE';
            this.productEstimatedDeliveryDays = data.estimatedDeliveryDays ?? null;
            this.productEstimatedDeliveryDate = data.estimatedDeliveryDate ?? '';
            this.productDeliveryNote = data.deliveryNote ?? '';
            this.loadVariants(this.id);
          },
          () => {
            this.isLoading = false;
          }
        )
      } else {
        this.isLoading = false;
      }
    }
  )
}

loadVariants(productId: number) {
    this.productVariantService.getByProduct(productId).subscribe({
      next: (variants) => {
        this.variants = variants.filter(v => v.active !== false && v.sellOnline !== false);
        if (this.variants.length > 0 && !this.selectedVariantId) {
          this.selectedVariantId = this.variants[0].id ?? null;
        }
      this.isLoading = false;
    },
    error: () => {
      this.variants = [];
      this.isLoading = false;
    }
  });
}

get selectedVariant(): ProductVariant | undefined {
  return this.variants.find(v => v.id === this.selectedVariantId);
}

get deliveryMessage(): string | null {
  const variant = this.selectedVariant;
  const deliveryType = variant?.deliveryType || this.productDeliveryType;
  if (deliveryType !== 'DELAYED') {
    return null;
  }
  const date = variant?.estimatedDeliveryDate || this.productEstimatedDeliveryDate;
  const days = variant?.estimatedDeliveryDays ?? this.productEstimatedDeliveryDays;
  const note = variant?.deliveryNote || this.productDeliveryNote;
  if (date) {
    return `Entrega estimada para ${new Date(date).toLocaleDateString()}.`;
  }
  if (days !== null && days !== undefined && days > 0) {
    return `Entrega estimada en ${days} días.`;
  }
  if (note) {
    return note;
  }
  return 'Este producto tiene demora de entrega.';
}
addCart(id:number){
  if (!this.selectedVariantId) {
    this.alertService.errorAlert(MICROCOPY.cart.selectVariant);
    return;
  }
  const variant = this.selectedVariant;
  if (variant?.availableStock !== undefined && this.quantity > (variant.availableStock || 0)) {
    this.alertService.errorAlert(MICROCOPY.cart.insufficientStock);
    return;
  }
  console.log('id product ' + id);
  console.log('name product ' + this.name);
  console.log('price product ' + this.price);
  console.log('quantity product ' + this.quantity);
  console.log('urlImage' + this.urlImage);

  let item = new ItemCart(
    this.selectedVariantId,
    id,
    this.name,
    this.quantity || 1,
    this.price,
    variant?.size,
    variant?.color,
    this.urlImage
  );
  this.cartService.addItemCart(item);
  console.log("total carrito");
  console.log(this.cartService.totalCart());

  this.alertService.successAlert(MICROCOPY.cart.addSuccess, 'Carrito');
}

get currentImage(): string {
  return this.images[this.currentImageIndex] || this.urlImage || '';
}

selectImage(index: number): void {
  if (index < 0 || index >= this.images.length) {
    return;
  }
  this.currentImageIndex = index;
}
}
