import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ItemCart } from 'src/app/common/item-cart';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

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
  quantity: number =0;

ngOnInit(): void{
  this.getProductById(); 
}
constructor(private productService:ProductService, private activatedRoute:ActivatedRoute, private cartService:CartService, private toastr:ToastrService){

}

getProductById(){
  this.activatedRoute.params.subscribe(
    p =>{
      let id = p[ 'id' ];
      if(id){
        this.productService.getProductById(id).subscribe(
          data =>{
            this.id= data.id;
            this.name = data.name;
            this.description = data.description;
            this.price = data.price;
            this.urlImage = data.urlImage;

          }
        )
      }
    }
  )
}
addCart(id:number){
  console.log('id product ' + id);
  console.log('name product ' + this.name);
  console.log('price product ' + this.price);
  console.log('quantity product ' + this.quantity);
  console.log('urlImage' + this.urlImage);

  let item = new ItemCart(id, this.name, this.quantity, this.price);
  this.cartService.addItemCart(item);
  console.log("total carrito");
  console.log(this.cartService.totalCart());

  this.toastr.success('Producto añadido al carrito de compras', 'Carrito Compras')
}
}
