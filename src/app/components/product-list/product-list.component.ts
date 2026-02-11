import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';
import { AlertService } from 'src/app/services/alert.service';
import { MICROCOPY } from 'src/app/constants/microcopy';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products : Product[] = [];
  isLoading = false;
  // Define la lista de columnas que la tabla debe mostrar
  displayedColumns: string[] = ['id', 'name', 'description', 'price', 'priceType', 'code', 'edit', 'delete'];
  

  constructor(
    private productService: ProductService,
    private sessionStorage: SessionStorageService,
    private router: Router,
    private alertService: AlertService
  ){}

  ngOnInit(): void {
    const token = this.sessionStorage.getItem('token');
    if (!token) {
      // Si no hay token, redirigir al login
      this.router.navigate([' /user/login']);
      return;
    }
    this.listProducts();
  }

  listProducts(){
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
    }
    
    deleteProductById(id:number){
      this.alertService.confirmAction({
        title: 'Confirmar acción',
        text: MICROCOPY.admin.confirmActionText,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }).then((confirmed) => {
        if (!confirmed) return;
        this.productService.deleteProductById(id).subscribe({
          next: () => {
            this.listProducts();
            this.alertService.successAlert('Producto eliminado correctamente.');
          },
          error: () => {
            this.alertService.errorAlert(MICROCOPY.general.genericError);
          }
        });
      });
    }
}
