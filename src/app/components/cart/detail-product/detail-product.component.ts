import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ItemCart } from 'src/app/common/item-cart';
import { CartService } from 'src/app/services/cart.service';
import { HomeService } from 'src/app/services/home.service';
import { ProductVariant } from 'src/app/common/product-variant';
import { ProductVariantService } from 'src/app/services/product-variant.service';

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
  quantity: number =1;
  variants: ProductVariant[] = [];
  selectedVariantId: number | null = null;

ngOnInit(): void{
  this.getProductById(); 
}
constructor(
  private homeService:HomeService,
  private activatedRoute:ActivatedRoute,
  private cartService:CartService,
  private toastr:ToastrService,
  private productVariantService: ProductVariantService
){

}

getProductById(){
  this.activatedRoute.params.subscribe(
    p =>{
      let id = p[ 'id' ];
      if(id){
        this.homeService.getProductById(id).subscribe(
          data =>{
            this.id= data.id;
            this.name = data.name;
            this.description = data.description;
            this.price = data.price;
            this.urlImage = data.urlImage;
            this.loadVariants(this.id);

          }
        )
      }
    }
  )
}

loadVariants(productId: number) {
  this.productVariantService.getByProduct(productId).subscribe({
    next: (variants) => {
      this.variants = variants.filter(v => v.active !== false);
      if (this.variants.length > 0 && !this.selectedVariantId) {
        this.selectedVariantId = this.variants[0].id ?? null;
      }
    },
    error: () => {
      this.variants = [];
    }
  });
}

get selectedVariant(): ProductVariant | undefined {
  return this.variants.find(v => v.id === this.selectedVariantId);
}
addCart(id:number){
  if (!this.selectedVariantId) {
    this.toastr.error('Selecciona talle y color', 'Falta selección');
    return;
  }
  const variant = this.selectedVariant;
  if (variant?.availableStock !== undefined && this.quantity > (variant.availableStock || 0)) {
    this.toastr.error('No hay stock disponible para esa cantidad', 'Stock insuficiente');
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

  this.toastr.success('Producto añadido al carrito de compras', 'Carrito Compras')
}
}
