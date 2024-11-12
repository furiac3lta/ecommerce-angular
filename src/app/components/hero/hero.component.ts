import { Component, AfterViewInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwiperCustomElementService } from 'src/app/services/swiper-custom-element.service';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HeroComponent {
  @ViewChild('swiper',{static: false}) swiperEl!: ElementRef;
  slides = [
    {
      title: 'Top 5 Benefits of Using a Daily Moisturizer',
      subtitle: 'perfect match',
      description: 'Choose the right moisturizer for healthy, glowing skin with our guide to tailored formulas and ingredients for your skin',
      image: 'https://nov-costica.myshopify.com/cdn/shop/files/s-6-3.jpg?v=1728016535&width=1500',
      button: 'Comprar ahora'
    },
    {
      title: 'Top 5 Benefits of Using a Daily Moisturizer',
      subtitle: 'perfect match',
      description: 'Choose the right moisturizer for healthy, glowing skin with our guide to tailored formulas and ingredients for your skin',
      image: 'https://nov-costica.myshopify.com/cdn/shop/files/s-6-2.jpg?v=1728016535&width=1500',
      button: 'Comprar ahora'
    },{
      title: 'Top 5 Benefits of Using a Daily Moisturizer',
      subtitle: 'perfect match',
      description: 'Choose the right moisturizer for healthy, glowing skin with our guide to tailored formulas and ingredients for your skin',
      image: 'https://nov-costica.myshopify.com/cdn/shop/files/s-6-1.jpg?v=1728016536&width=2000',
      button: 'Comprar ahora'
    }
  ]
  constructor(private swiperCustomElementService: SwiperCustomElementService) {}

  ngAfterViewInit() {
    const swiperInstance = this.swiperEl.nativeElement.swiper;
  }

}
