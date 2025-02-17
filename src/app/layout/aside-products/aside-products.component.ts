import { Component, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import { CategoryService } from 'src/app/services/category.service';
import { Category } from 'src/app/common/category';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-aside-products',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatDividerModule, MatSidenavModule, MatButtonModule],
  templateUrl: './aside-products.component.html',
  styleUrls: ['./aside-products.component.css']
})
export class AsideProductsComponent implements OnDestroy {
  @Output() categorySelected = new EventEmitter<Category | null>();
  categories: Category[] = [];
  currentCategory: Category | null = null;
  categorySub: Subscription;
  isMobile = false;

  constructor(private categoryService: CategoryService) {
    
    // listen the window resize event
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });

    this.categorySub = categoryService.getCategoryList().subscribe({
      next: categories => {
        this.categories = categories;
      },
      error: err => console.log(err)
    });
  }

  ngOnDestroy(): void {
    this.categorySub.unsubscribe();
  }

  selectCategory(category: Category | null): void {
    this.currentCategory = category;
    this.categorySelected.emit(this.currentCategory);
  }
 
}
