import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from 'src/app/common/category';
import { CategoryService } from 'src/app/services/category.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-category-add',
  templateUrl: './category-add.component.html',
  styleUrls: ['./category-add.component.css']
})
export class CategoryAddComponent implements OnInit{
  id:number =0;
  name:string ='';
  price:number = 0;

  constructor(
    private categoryService:CategoryService,
    private alertService: AlertService,
    private router:Router,
    private activatedRoute:ActivatedRoute,
  ){}

  ngOnInit(): void {
    this.getCategoryById();
  }
  addCategory(){
    let category = new Category(this.id, this.name, this.price);
    this.categoryService.createCategory(category).subscribe({
      next: () => {
        this.alertService.successAlert('Categoría registrada correctamente.');
        this.router.navigate(['admin/category']);
      },
      error: () => {
        this.alertService.errorAlert('No se pudo guardar la categoría.');
      }
    });
  }
  getCategoryById(){
    this.activatedRoute.params.subscribe(
      category =>{
        let id = category['id'];
        if(id){
          console.log('valor de la variable id: '+id);
          this.categoryService.getCategoryById(id).subscribe(
            data =>{
              this.id = data.id;
              this.name = data.name;
              this.price = data.price ?? 0;
            }
          )
        }
      }
    )
  }
}
