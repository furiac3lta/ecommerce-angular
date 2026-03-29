import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from 'src/app/common/category';

interface CategoryTile extends Category {
  image: string;
  caption: string;
}

@Component({
  selector: 'app-category-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-grid.component.html',
  styleUrls: ['./category-grid.component.css']
})
export class CategoryGridComponent {
  @Input() categories: Category[] = [];

  constructor(private router: Router) {}

  get tiles(): CategoryTile[] {
    return this.categories.map((category, index) => ({
      ...category,
      image: this.resolveCover(category.name, index),
      caption: this.resolveCaption(category.name)
    }));
  }

  openCategory(categoryId: number): void {
    this.router.navigate(['/product'], {
      queryParams: { category: categoryId }
    });
  }

  trackByCategory(_: number, category: CategoryTile): number {
    return category.id;
  }

  private resolveCover(name: string, index: number): string {
    const normalized = (name || '').toLowerCase();
    if (normalized.includes('kimono')) {
      return 'assets/bjj/kimono1.jpg';
    }
    if (normalized.includes('rashguard')) {
      return 'assets/bjj/rashguard1.png';
    }
    if (normalized.includes('top')) {
      return 'assets/bjj/rashguard2.png';
    }
    if (normalized.includes('bermuda') || normalized.includes('pantalon')) {
      return 'assets/bjj/kimono4.jpg';
    }
    if (normalized.includes('calza')) {
      return 'assets/bjj/kimono5.png';
    }
    if (normalized.includes('accesorio') || normalized.includes('faixa')) {
      return 'assets/bjj/kimono6.png';
    }

    const fallbackImages = [
      'assets/bjj/kimono2.jpg',
      'assets/bjj/kimono3.jpg',
      'assets/bjj/rashguard1.png',
      'assets/bjj/rashguard2.png'
    ];

    return fallbackImages[index % fallbackImages.length];
  }

  private resolveCaption(name: string): string {
    const normalized = (name || '').toLowerCase();
    if (normalized.includes('kimono')) {
      return 'Cortes limpios, peso competitivo y presencia fuerte.';
    }
    if (normalized.includes('rashguard')) {
      return 'Compresión firme, diseño agresivo y movilidad total.';
    }
    if (normalized.includes('calza')) {
      return 'Soporte preciso para grappling, drills y funcional.';
    }
    if (normalized.includes('bermuda') || normalized.includes('pantalon')) {
      return 'Ligereza, libertad y lectura rápida del catálogo.';
    }
    if (normalized.includes('top')) {
      return 'Bloques sólidos para armar conjuntos listos para competir.';
    }
    return 'Entrá directo a la línea y explorá el drop completo.';
  }
}
