import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/core/interfaces/product.interface';
import { HomeService } from 'src/app/services/home.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  products: Product [] = [];
  constructor(private homeService:HomeService, private router:Router){

  }
  ngOnInit(): void {
    this.homeService.getProducts().subscribe(
      data => this.products = data.slice(0,6)
    )
  }
  gotoProduct(){
    this.router.navigate(['/product']);
  }
}
