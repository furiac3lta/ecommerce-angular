import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/core/interfaces/product.interface';
import { CartService } from 'src/app/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { ItemCart } from 'src/app/common/item-cart';

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

  constructor(private router: Router, private cartService: CartService, private toastr: ToastrService) {}

  goToDetail() {
    this.router.navigate([`/cart/detailproduct`, this.product.id]);
  }

  addCart() {
    const item = new ItemCart(this.product.id, this.product.name, 1, this.product.price);
    this.cartService.addItemCart(item);
    this.toastr.success('Producto añadido al carrito de compras', 'Carrito Compras');
  }
}