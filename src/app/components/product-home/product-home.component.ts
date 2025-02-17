import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/core/interfaces/product.interface';
import { HomeService } from 'src/app/services/home.service';
import { Category } from 'src/app/common/category';

@Component({
  selector: 'app-product-home',
  templateUrl: './product-home.component.html',
  styleUrls: ['./product-home.component.css']
})
export class ProductHomeComponent implements OnInit {
  products: Product[] = [];
  productsFiltered: Product[] = [];
  constructor(private homeService:HomeService){

  }
  ngOnInit(): void {
    this.homeService.getProducts().subscribe({
      next: products => {
        this.products = products;
        this.productsFiltered = products;
      },
      error: err => console.log(err)
    }
    )
  }

  filterByCategory(category: Category | null) { 
    if (!category) {
      this.showAllProducts();
      return;
    }
    const newArrayProducts = this.products.filter(product => product.categoryId === category.id); 
    this.productsFiltered = newArrayProducts;
  }
  showAllProducts() {
    // Resetea la lista filtrada a todos los productos
    this.productsFiltered = this.products;
  }
}
