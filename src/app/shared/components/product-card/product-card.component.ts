import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/core/interfaces/product.interface';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() product: Product = {
    id: 0,
    name: 'Producto 1',
    code: 'P01',
    description: 'Descripcion del producto 1',
    urlImage: 'https://nov-costica.myshopify.com/cdn/shop/files/24_360x.jpg?v=1726807496',
    publicId: 'publicId',
    images: [],
    price: 100,
    dateCreated: new Date(),
    dateUpdated: new Date(),
    userId: 1,
    categoryId: 1
  };

  constructor(private router: Router) {}

  images: string[] = [];
  currentImageIndex = 0;
  private slideshowId: any;
  private isPaused = false;

  ngOnInit(): void {
    this.setupImages();
    this.startAutoSlide();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.setupImages();
      this.startAutoSlide();
    }
  }

  ngOnDestroy(): void {
    this.clearAutoSlide();
  }

  goToDetail() {
    this.router.navigate([`/cart/detailproduct`, this.product.id]);
  }

  addCart() {
    this.goToDetail();
  }

  getDeliveryLabel(): string | null {
    if (this.product.deliveryType !== 'DELAYED') {
      return null;
    }
    if (this.product.estimatedDeliveryDate) {
      return `Entrega estimada: ${this.product.estimatedDeliveryDate}`;
    }
    if (this.product.estimatedDeliveryDays) {
      return `Entrega en ${this.product.estimatedDeliveryDays} días`;
    }
    return 'Entrega diferida';
  }

  prevImage(event: Event): void {
    event.stopPropagation();
    this.clearAutoSlide();
    if (!this.images.length) {
      return;
    }
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.images.length) % this.images.length;
    this.startAutoSlide();
  }

  nextImage(event: Event): void {
    event.stopPropagation();
    this.clearAutoSlide();
    if (!this.images.length) {
      return;
    }
    this.currentImageIndex =
      (this.currentImageIndex + 1) % this.images.length;
    this.startAutoSlide();
  }

  goToImage(index: number, event: Event): void {
    event.stopPropagation();
    this.clearAutoSlide();
    this.currentImageIndex = index;
    this.startAutoSlide();
  }

  pauseAutoSlide(): void {
    this.isPaused = true;
    this.clearAutoSlide();
  }

  resumeAutoSlide(): void {
    this.isPaused = false;
    this.startAutoSlide();
  }

  private setupImages(): void {
    const list = Array.isArray(this.product.images) ? this.product.images.filter(Boolean) : [];
    if (this.product.urlImage) {
      if (!list.includes(this.product.urlImage)) {
        list.unshift(this.product.urlImage);
      }
    }
    this.images = list.length ? list : [this.product.urlImage];
    this.currentImageIndex = 0;
  }

  private startAutoSlide(): void {
    if (this.isPaused || this.images.length <= 1) {
      return;
    }
    this.clearAutoSlide();
    this.slideshowId = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }, 3500);
  }

  private clearAutoSlide(): void {
    if (this.slideshowId) {
      clearInterval(this.slideshowId);
      this.slideshowId = null;
    }
  }
}
