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
  isLoading = false;
  constructor(private homeService:HomeService){

  }
  ngOnInit(): void {
    this.isLoading = true;
    this.homeService.getProducts().subscribe({
      next: products => {
        const normalized = products.map(product => ({
          ...product,
          price: product.price != null ? Number(product.price) : product.price
        }));
        const visible = normalized.filter(product => product.sellOnline !== false);
        this.products = visible;
        this.productsFiltered = visible;
        this.isLoading = false;
      },
      error: err => {
        console.log(err);
        this.isLoading = false;
      }
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
