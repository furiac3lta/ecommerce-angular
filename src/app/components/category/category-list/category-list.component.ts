import { Component, OnInit } from '@angular/core';
import { Category } from 'src/app/common/category';
import { CategoryService } from 'src/app/services/category.service';
import { AlertService } from 'src/app/services/alert.service';
import { MICROCOPY } from 'src/app/constants/microcopy';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {

  categories: Category[] = [];
  isLoading = false;
  constructor(
    private categoryService: CategoryService,
    private alertService: AlertService
  ) { }
  ngOnInit(): void {
    this.listCategories();
  }
  listCategories(){
    this.isLoading = true;
    this.categoryService.getCategoryList().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
  deleteCategoryById(id:number){
    this.alertService.confirmAction({
      title: 'Confirmar acción',
      text: MICROCOPY.admin.confirmActionText,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }).then((confirmed) => {
      if (!confirmed) return;
      this.categoryService.deleteCategoryById(id).subscribe({
        next: () => {
          this.listCategories();
          this.alertService.successAlert('Categoría eliminada correctamente.');
        },
        error: () => {
          this.alertService.errorAlert(MICROCOPY.general.genericError);
        }
      });
    });
  }
}
