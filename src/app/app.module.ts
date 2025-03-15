import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor.service';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { ProductListComponent } from './components/product-list/product-list.component';
import { HeaderAdminComponent } from './components/header-admin/header-admin.component';
import { Routes, RouterModule } from '@angular/router';
import { ProductAddComponent } from './components/product-add/product-add.component';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CategoryListComponent } from './components/category/category-list/category-list.component';
import { CategoryAddComponent } from './components/category/category-add/category-add.component';
import { DetailProductComponent } from './components/cart/detail-product/detail-product.component';
import { HeaderUserComponent } from './components/header-user/header-user.component';
import { SumaryOrderComponent } from './components/orders/sumary-order/sumary-order.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { RegistrationComponent } from './components/authentication/registration/registration.component';
import { LoginComponent } from './components/authentication/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { authGuard } from './guards/auth.guard';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HeroComponent } from './components/hero/hero.component';
import { SharedModule } from './shared/shared.module';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { AboutComponent } from './components/about/about.component';
import { ContactFormComponent } from './components/contact-form/contact-form.component';
import { ProductHomeComponent } from './components/product-home/product-home.component';
import { AsideProductsComponent } from './layout/aside-products/aside-products.component';
import { OrderListComponent } from './components/orders/order-list/order-list.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component:ContactFormComponent},
  { path: 'user/register', component: RegistrationComponent },
  { path: 'user/login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'confirmacion-pago', component: ConfirmationComponent },
  { path: 'cart/detailproduct/:id', component: DetailProductComponent },
  { path:'product', component:ProductHomeComponent},
  { path: 'admin/product', component: ProductListComponent,  canActivate: [authGuard], },
  { path: 'admin/product/addproduct', component: ProductAddComponent ,  canActivate: [authGuard],},
  { path: 'admin/product/update/:id', component: ProductAddComponent ,  canActivate: [authGuard], },
  { path: 'admin/category', component: CategoryListComponent,  canActivate: [authGuard], },
  { path: 'admin/category/add', component: CategoryAddComponent ,  canActivate: [authGuard],},
  { path: 'admin/category/update/:id', component: CategoryAddComponent ,  canActivate: [authGuard],},
  { path: 'cart/summary',component: SumaryOrderComponent, canActivate: [authGuard],},
  { path: 'admin/orders', component: OrderListComponent, canActivate:[authGuard],},
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProductListComponent,
    HeaderAdminComponent,
    ProductAddComponent,
    CategoryListComponent,
    CategoryAddComponent,
    DetailProductComponent,
    HeaderUserComponent,
    SumaryOrderComponent,
    RegistrationComponent,
    LoginComponent,
    LogoutComponent,
    CheckoutComponent,
    ConfirmationComponent,
    AboutComponent,
    ContactFormComponent,
    ProductHomeComponent,
    OrderListComponent,  
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes),
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    SharedModule,
    NavbarComponent,
    FooterComponent,
    HeroComponent,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    AsideProductsComponent,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
