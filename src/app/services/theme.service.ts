import { Injectable } from '@angular/core';

type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private storageKey = 'theme';
  private currentTheme: ThemeMode = 'light';

  constructor() {
    const stored = localStorage.getItem(this.storageKey) as ThemeMode | null;
    this.currentTheme = stored === 'dark' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
  }

  get theme(): ThemeMode {
    return this.currentTheme;
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(this.currentTheme);
  }

  private applyTheme(theme: ThemeMode): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);
  }
}
