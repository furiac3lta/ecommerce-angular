import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from 'src/app/common/category';
import { Product } from 'src/app/core/interfaces/product.interface';
import { CategoryService } from 'src/app/services/category.service';
import { HeroCarouselAdminService } from 'src/app/services/hero-carousel-admin.service';
import { HomeService } from 'src/app/services/home.service';
import { HeroCarouselSlide } from './hero-carousel/hero-carousel.component';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  products: Product [] = [];
  categories: Category[] = [];
  heroSlides: HeroCarouselSlide[] = [];
  editorialSlides: HeroCarouselSlide[] = [];

  constructor(
    private homeService:HomeService,
    private categoryService: CategoryService,
    private heroCarouselAdminService: HeroCarouselAdminService,
    private router:Router
  ){

  }
  ngOnInit(): void {
    this.heroCarouselAdminService.getSlides(this.heroCarouselAdminService.homeHeroKey).subscribe((slides) => {
      this.heroSlides = slides;
    });
    this.heroCarouselAdminService.getSlides(this.heroCarouselAdminService.homeEditorialKey).subscribe((slides) => {
      this.editorialSlides = slides;
    });
    this.homeService.getProducts().subscribe(
      data => this.products = data.slice(0,8)
    );
    this.categoryService.getCategoryList().subscribe(
      data => this.categories = data
    );
  }

  gotoProduct(): void {
    this.router.navigate(['/product']);
  }

  goToProductDetail(productId: number): void {
    this.router.navigate(['/cart/detailproduct', productId]);
  }
}
