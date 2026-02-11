import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

type AlertOptions = {
  title?: string;
  text: string;
  icon?: SweetAlertIcon;
  confirmText?: string;
  cancelText?: string;
};

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private lastActiveElement: HTMLElement | null = null;

  private baseOptions() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    return {
      background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#111111',
      customClass: {
        popup: 'lb-swal-popup',
        title: 'lb-swal-title',
        htmlContainer: 'lb-swal-text',
        confirmButton: 'lb-swal-confirm',
        cancelButton: 'lb-swal-cancel',
        actions: 'lb-swal-actions',
      },
      buttonsStyling: false,
      showClass: {
        popup: 'lb-swal-in',
      },
      hideClass: {
        popup: 'lb-swal-out',
      },
      returnFocus: false,
    };
  }

  private rememberFocus(): void {
    const active = document.activeElement;
    this.lastActiveElement = active instanceof HTMLElement ? active : null;
  }

  private restoreFocus(): void {
    if (this.lastActiveElement) {
      this.lastActiveElement.focus();
    }
    this.lastActiveElement = null;
  }

  confirmAction(options: AlertOptions): Promise<boolean> {
    this.rememberFocus();
    return Swal.fire({
      ...this.baseOptions(),
      title: options.title || 'Confirmar acción',
      text: options.text,
      icon: options.icon || 'warning',
      showCancelButton: true,
      confirmButtonText: options.confirmText || 'Confirmar',
      cancelButtonText: options.cancelText || 'Cancelar',
      didClose: () => this.restoreFocus(),
    }).then((result) => result.isConfirmed);
  }

  successAlert(text: string, title = 'Listo'): Promise<void> {
    this.rememberFocus();
    return Swal.fire({
      ...this.baseOptions(),
      title,
      text,
      icon: 'success',
      timer: 2200,
      showConfirmButton: false,
      didClose: () => this.restoreFocus(),
    }).then(() => undefined);
  }

  errorAlert(text: string, title = 'Error'): Promise<void> {
    this.rememberFocus();
    return Swal.fire({
      ...this.baseOptions(),
      title,
      text,
      icon: 'error',
      confirmButtonText: 'Entendido',
      didClose: () => this.restoreFocus(),
    }).then(() => undefined);
  }

  infoAlert(text: string, title = 'Información'): Promise<void> {
    this.rememberFocus();
    return Swal.fire({
      ...this.baseOptions(),
      title,
      text,
      icon: 'info',
      confirmButtonText: 'Continuar',
      didClose: () => this.restoreFocus(),
    }).then(() => undefined);
  }
}
