import { Component, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwiperCustomElementService } from 'src/app/services/swiper-custom-element.service';
import {MatButtonModule} from '@angular/material/button';
import { Router } from '@angular/router';


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
      title: 'El Acondicionador Perfecto para tu Cabello',
      subtitle: 'combinación ideal',
      description: 'Encuentra el acondicionador ideal para un cabello saludable y brillante con nuestra guía de fórmulas e ingredientes específicos para tu tipo de cabello.',
      image: 'https://nov-costica.myshopify.com/cdn/shop/files/s-6-3.jpg?v=1728016535&width=1500',
      button: 'Comprar ahora'
    },
    {
      title: 'Elige el Tratamiento Ideal para un Cabello Radiante',
      subtitle: 'combinación ideal',
      description: 'Escoge el tratamiento adecuado para un cabello radiante y bien cuidado siguiendo nuestra guía con las mejores fórmulas e ingredientes según tus necesidades.',
      image: 'https://nov-costica.myshopify.com/cdn/shop/files/s-6-2.jpg?v=1728016535&width=1500',
      button: 'Comprar ahora'
    },{
      title: 'Cómo Hidratar tu Cabello para un Brillo Saludable',
      subtitle: 'combinación ideal',
      description: 'Descubre cómo elegir el mejor producto hidratante para mantener tu cabello sano y luminoso con nuestra guía adaptada a cada tipo de cabello.',
      image: 'https://nov-costica.myshopify.com/cdn/shop/files/s-6-1.jpg?v=1728016536&width=2000',
      button: 'Comprar ahora'
    }
  ]
  constructor(private swiperCustomElementService: SwiperCustomElementService,private router: Router) {}

  goToDetail() {
    this.router.navigate(['/product']);
  }

  ngAfterViewInit() {
    const swiperInstance = this.swiperEl.nativeElement.swiper;
  }

}
