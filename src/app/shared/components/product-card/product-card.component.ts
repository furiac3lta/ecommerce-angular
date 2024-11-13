import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/core/interfaces/product.interface';


@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() product: Product = {
    id: 0,
    name: 'Producto 1',
    code: 'P01',
    description: 'Descripcion del producto 1',
    urlImage: 'https://nov-costica.myshopify.com/cdn/shop/files/24_360x.jpg?v=1726807496',
    publicId: 'publicId',
    price: 100,
    dateCreated: new Date(),
    dateUpdated: new Date(),
    userId: 1,
    categoryId: 1
  };
  constructor(private router: Router) {}

  goToDetail() {
    this.router.navigate([`/cart/detailproduct`, this.product.id]);
  }
}
