import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HeroCarouselSlide } from '../components/home/hero-carousel/hero-carousel.component';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HeaderService } from './header.service';

export interface UploadedImageResponse {
  fileName: string;
  url: string;
}

export type CarouselKey = 'home-hero' | 'home-editorial';

@Injectable({
  providedIn: 'root'
})
export class HeroCarouselAdminService {
  readonly homeHeroKey: CarouselKey = 'home-hero';
  readonly homeEditorialKey: CarouselKey = 'home-editorial';
  private readonly publicUrl = `${environment.apiBaseUrl}/api/v1/home/hero-slides`;
  private readonly adminUrl = `${environment.apiBaseUrl}/api/v1/admin/tools/hero-slides`;
  private readonly uploadImageUrl = `${this.adminUrl}/image`;

  readonly defaultSlides: HeroCarouselSlide[] = [
    {
      eyebrow: 'Lions Brand BJJ',
      title: 'Equipate para dominar el tatami',
      subtitle: 'Drops visuales, siluetas limpias y una tienda pensada para entrar, mirar y comprar rapido.',
      ctaText: 'Comprar ahora',
      ctaLink: '/product',
      image: 'assets/bjj/kimono1.jpg',
      align: 'left'
    },
    {
      eyebrow: 'Rashguards + Fightwear',
      title: 'Disenos que pegan primero',
      subtitle: 'Compresion, color y lectura inmediata del catalogo en una home mas editorial y directa.',
      ctaText: 'Ver coleccion',
      ctaLink: '/product',
      image: 'assets/bjj/rashguard1.png',
      align: 'center'
    },
    {
      eyebrow: 'Coleccion Lions',
      title: 'Menos ruido. Mas presencia.',
      subtitle: 'Tipografia fuerte, imagenes completas y navegacion simple para que el producto haga el trabajo.',
      ctaText: 'Explorar productos',
      ctaLink: '/product',
      image: 'assets/bjj/kimono3.jpg',
      align: 'left'
    }
  ];

  constructor(private httpClient: HttpClient, private headerService: HeaderService) {}

  getSlides(carouselKey: CarouselKey = this.homeHeroKey): Observable<HeroCarouselSlide[]> {
    const url = carouselKey === this.homeHeroKey ? this.publicUrl : `${this.publicUrl}/${carouselKey}`;
    return this.httpClient.get<HeroCarouselSlide[]>(url).pipe(
      map((slides) => this.normalizeSlides(slides, carouselKey)),
      catchError(() => of(this.getDefaultSlides(carouselKey)))
    );
  }

  saveSlides(slides: HeroCarouselSlide[], carouselKey: CarouselKey = this.homeHeroKey): Observable<HeroCarouselSlide[]> {
    const url = carouselKey === this.homeHeroKey ? this.adminUrl : `${this.adminUrl}/${carouselKey}`;
    return this.httpClient.post<HeroCarouselSlide[]>(url, slides, {
      headers: this.headerService.headers
    }).pipe(
      map((saved) => this.normalizeSlides(saved, carouselKey))
    );
  }

  resetSlides(carouselKey: CarouselKey = this.homeHeroKey): Observable<HeroCarouselSlide[]> {
    const url = carouselKey === this.homeHeroKey ? `${this.adminUrl}/reset` : `${this.adminUrl}/${carouselKey}/reset`;
    return this.httpClient.post<HeroCarouselSlide[]>(url, {}, {
      headers: this.headerService.headers
    }).pipe(
      map((saved) => this.normalizeSlides(saved, carouselKey))
    );
  }

  uploadSlideImage(file: File): Observable<UploadedImageResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient.post<UploadedImageResponse>(this.uploadImageUrl, formData, {
      headers: this.headerService.headers
    });
  }

  private normalizeSlides(slides: HeroCarouselSlide[] | null | undefined, carouselKey: CarouselKey): HeroCarouselSlide[] {
    if (!Array.isArray(slides) || !slides.length) {
      return this.getDefaultSlides(carouselKey);
    }

    return slides
      .map((slide) => ({
        eyebrow: slide.eyebrow || '',
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        ctaText: slide.ctaText || '',
        ctaLink: slide.ctaLink || '/product',
        image: slide.image || '',
        align: (slide.align === 'center' ? 'center' : 'left') as 'left' | 'center'
      }))
      .filter((slide) => slide.title && slide.ctaText && slide.image);
  }

  private getDefaultSlides(carouselKey: CarouselKey): HeroCarouselSlide[] {
    if (carouselKey === this.homeEditorialKey) {
      return [
        {
          eyebrow: 'Lions Brand BJJ',
          title: 'Diseno fuerte. Navegacion limpia. Compra directa.',
          subtitle: 'Un segundo carrusel para reforzar la marca, sostener el tono editorial y empujar al catalogo desde la home.',
          ctaText: 'Ver tienda',
          ctaLink: '/product',
          image: 'assets/bjj/kimono2.jpg',
          align: 'left'
        },
        {
          eyebrow: 'Fightwear editorial',
          title: 'Colecciones claras. Lectura rapida. Producto al frente.',
          subtitle: 'Cada slide puede rotar mensajes, imagenes y CTA sin tocar codigo desde el admin.',
          ctaText: 'Explorar',
          ctaLink: '/product',
          image: 'assets/bjj/rashguard1.png',
          align: 'left'
        }
      ];
    }

    return [...this.defaultSlides];
  }
}
