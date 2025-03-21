import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';
import Swal from 'sweetalert2';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products : Product[] = [];
  // Define la lista de columnas que la tabla debe mostrar
  displayedColumns: string[] = ['id', 'name', 'description', 'price', 'code', 'edit', 'delete'];
  

  constructor(private productService:ProductService,  private sessionStorage:SessionStorageService, private router: Router){}

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
    this.productService.getProducts().subscribe(
      data => {
        this.products = data
       
      }
      );
    }
    
    deleteProductById(id:number){
      Swal.fire({
        title: "Esta seguro que desea eliminar este producto?",
        text: "",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {
          this.productService.deleteProductById(id).subscribe(
            () => this.listProducts()
          );
          Swal.fire({
            title: "Producto",
            text: "Producto eliminado correctamente.",
            icon: "success"
          });
        }
      });
     
    }
}
