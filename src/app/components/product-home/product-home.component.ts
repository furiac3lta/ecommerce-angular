import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/core/interfaces/product.interface';
import { HomeService } from 'src/app/services/home.service';

@Component({
  selector: 'app-product-home',
  templateUrl: './product-home.component.html',
  styleUrls: ['./product-home.component.css']
})
export class ProductHomeComponent implements OnInit {
  products: Product [] = [];
  constructor(private homeService:HomeService){

  }
  ngOnInit(): void {
    this.homeService.getProducts().subscribe(
      data => this.products = data
    )
  }

}
