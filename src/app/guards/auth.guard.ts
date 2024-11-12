import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStorageService } from '../services/session-storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  // Inyectamos el servicio de almacenamiento de sesión
  const session = inject(SessionStorageService);
  // Inyectamos el servicio de navegación del router
  const router = inject(Router);

  // Verificamos si el token existe en el almacenamiento de sesión
  if (session.getItem('token') != null) {
    return true; // Si existe, permitimos el acceso a la ruta
  }
  
  // Si no existe, redirigimos al usuario a la página de inicio de sesión
  return router.createUrlTree(['/user/login']);
};
