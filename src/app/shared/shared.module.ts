import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { MatCardModule } from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import { ProductHomeComponent } from '../components/product-home/product-home.component';

@NgModule({
  declarations: [
    ProductCardComponent,
  
  ],
  exports: [
    ProductCardComponent,
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
  ]
})
export class SharedModule { }
