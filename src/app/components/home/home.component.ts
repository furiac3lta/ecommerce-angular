import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from 'src/app/common/category';
import { Product } from 'src/app/core/interfaces/product.interface';
import { CategoryService } from 'src/app/services/category.service';
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
  readonly heroSlides: HeroCarouselSlide[] = [
    {
      eyebrow: 'Lions Brand BJJ',
      title: 'Equipate para dominar el tatami',
      subtitle: 'Drops visuales, siluetas limpias y una tienda pensada para entrar, mirar y comprar rápido.',
      ctaText: 'Comprar ahora',
      ctaLink: '/product',
      image: 'assets/bjj/kimono1.jpg',
      align: 'left'
    },
    {
      eyebrow: 'Rashguards + Fightwear',
      title: 'Diseños que pegan primero',
      subtitle: 'Compresión, color y lectura inmediata del catálogo en una home más editorial y directa.',
      ctaText: 'Ver colección',
      ctaLink: '/product',
      image: 'assets/bjj/rashguard1.png',
      align: 'center'
    },
    {
      eyebrow: 'Colección Lions',
      title: 'Menos ruido. Más presencia.',
      subtitle: 'Tipografía fuerte, imágenes completas y navegación simple para que el producto haga el trabajo.',
      ctaText: 'Explorar productos',
      ctaLink: '/product',
      image: 'assets/bjj/kimono3.jpg',
      align: 'left'
    }
  ];

  constructor(
    private homeService:HomeService,
    private categoryService: CategoryService,
    private router:Router
  ){

  }
  ngOnInit(): void {
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
