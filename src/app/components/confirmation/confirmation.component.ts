import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderState } from 'src/app/common/order-state';
import { OrderService } from 'src/app/services/order.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { Order } from 'src/app/common/order';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {
  status: string = '';
  order: Order | null = null;
  router: any;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private sessionStorage: SessionStorageService
  ) {}

  ngOnInit(): void {
    // Leer el estado del pago de los parámetros de la URL
    this.status = this.route.snapshot.queryParamMap.get('status') || 'unknown';
    console.log("Estado del pago:", this.status);

    // Recuperar la orden del localStorage
    const orderData = localStorage.getItem('currentOrder');
    if (orderData) {
      this.order = JSON.parse(orderData);
    }

    // Verificar si order tiene un valor id válido
    if (this.order && this.order.id !== null) {
      // Si el pago fue exitoso, actualizar el estado de la orden
      const orderId = this.order.id;
      const newState = this.status === 'approved' ? OrderState.COMPLETED : OrderState.CANCELLED;

      this.orderService.updateOrderStatus(orderId, newState).subscribe(
        () => {
          console.log(`Estado de la orden actualizado a ${newState}`);
          console.log('LogoutComponent: ' + this.sessionStorage.getItem('token'));

          // Solo eliminar el token y limpiar el localStorage después de la actualización exitosa de la orden
          this.sessionStorage.removeItem('token');
          console.log('LogoutComponent eliminado: ' + this.sessionStorage.getItem('token'));
          localStorage.removeItem('currentOrder');
           // Redirigir al inicio después de un breve retardo
           setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000); // Espera un segundo antes de redirigir (opcional)
        },
        (error) => {
          console.error('Error al actualizar la orden:', error);
        }
      );
    }
  }
}
