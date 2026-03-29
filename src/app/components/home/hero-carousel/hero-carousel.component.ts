import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface HeroCarouselSlide {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  align?: 'left' | 'center';
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-carousel.component.html',
  styleUrls: ['./hero-carousel.component.css']
})
export class HeroCarouselComponent implements OnInit, OnDestroy, OnChanges {
  @Input() slides: HeroCarouselSlide[] = [];
  @Input() autoplayMs = 6000;

  readonly currentIndex = signal(0);
  private autoplayHandle: ReturnType<typeof setInterval> | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnChanges(): void {
    this.currentIndex.set(0);
    this.restartAutoplay();
  }

  ngOnDestroy(): void {
    this.clearAutoplay();
  }

  prev(): void {
    if (!this.slides.length) {
      return;
    }
    this.currentIndex.update((index) => (index - 1 + this.slides.length) % this.slides.length);
    this.restartAutoplay();
  }

  next(): void {
    if (!this.slides.length) {
      return;
    }
    this.currentIndex.update((index) => (index + 1) % this.slides.length);
    this.restartAutoplay();
  }

  goTo(index: number): void {
    this.currentIndex.set(index);
    this.restartAutoplay();
  }

  goToCollection(link: string): void {
    this.router.navigateByUrl(link);
  }

  pause(): void {
    this.clearAutoplay();
  }

  resume(): void {
    this.startAutoplay();
  }

  trackByImage(_: number, slide: HeroCarouselSlide): string {
    return slide.image;
  }

  private startAutoplay(): void {
    if (this.autoplayHandle || this.slides.length <= 1) {
      return;
    }
    this.autoplayHandle = setInterval(() => {
      this.next();
    }, this.autoplayMs);
  }

  private restartAutoplay(): void {
    this.clearAutoplay();
    this.startAutoplay();
  }

  private clearAutoplay(): void {
    if (this.autoplayHandle) {
      clearInterval(this.autoplayHandle);
      this.autoplayHandle = null;
    }
  }
}
