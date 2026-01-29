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
      title: 'Classic para entrenar diario',
      subtitle: 'Modelo más elegido',
      description: 'Chaqueta pearl weave 400–450 GSM + pantalón gabardina 12 oz. Listo para entrenar y competir.',
      image: 'assets/bjj/kimono1.jpg',
      button: 'Comprar ahora'
    },
    {
      title: 'Lion Armor edición especial',
      subtitle: 'Más resistente y ligero',
      description: 'Pearl weave 450 GSM, 100% algodón. Baja contracción (≈4%) y máxima durabilidad.',
      image: 'assets/bjj/kimono2.jpg',
      button: 'Ver modelos'
    },{
      title: 'Ripstop para climas cálidos',
      subtitle: 'Peso mínimo',
      description: 'Tela antidesgarro y liviana para entrenar en verano o competir con peso ajustado.',
      image: 'assets/bjj/kimono3.jpg',
      button: 'Explorar talles'
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
