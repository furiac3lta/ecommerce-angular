import { Component, OnInit } from '@angular/core';
import { StockAdminService } from 'src/app/services/stock-admin.service';
import { StockVariant } from 'src/app/common/stock-variant';
import { StockMovement, StockMovementReason, StockMovementRequest, StockMovementType } from 'src/app/common/stock-movement';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { AlertService } from 'src/app/services/alert.service';
import { MICROCOPY } from 'src/app/constants/microcopy';

@Component({
  selector: 'app-stock-admin',
  templateUrl: './stock-admin.component.html',
  styleUrls: ['./stock-admin.component.css'],
})
export class StockAdminComponent implements OnInit {
  variants: StockVariant[] = [];
  filteredVariants: StockVariant[] = [];
  searchTerm = '';
  selectedVariant: StockVariant | null = null;
  movements: StockMovement[] = [];
  movementsLoading = false;
  isLoading = false;

  showInModal = false;
  showOutModal = false;
  showMovementsModal = false;

  inQty: number | null = null;
  inReason: StockMovementReason = 'RESTOCK';
  inNote = '';

  outQty: number | null = null;
  outReason: StockMovementReason = 'MANUAL_ADJUST';
  outNote = '';

  movementFrom = '';
  movementTo = '';

  inReasons: { value: StockMovementReason; label: string }[] = [
    { value: 'RESTOCK', label: 'Compra proveedor' },
    { value: 'RETURN', label: 'Devolución' },
    { value: 'CORRECTION', label: 'Corrección' },
    { value: 'OTHER', label: 'Otro' },
  ];

  outReasons: { value: StockMovementReason; label: string }[] = [
    { value: 'MANUAL_ADJUST', label: 'Ajuste manual' },
    { value: 'CORRECTION', label: 'Corrección' },
    { value: 'OTHER', label: 'Otro' },
  ];

  constructor(
    private stockAdminService: StockAdminService,
    private sessionStorage: SessionStorageService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadVariants();
  }

  loadVariants(): void {
    this.isLoading = true;
    this.stockAdminService.getVariants().subscribe({
      next: (variants) => {
        this.variants = variants || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.alertService.errorAlert(MICROCOPY.general.genericError);
        this.isLoading = false;
      },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredVariants = [...this.variants];
      return;
    }
    this.filteredVariants = this.variants.filter((variant) => {
      const haystack = [
        variant.productName,
        variant.sku,
        variant.size,
        variant.color,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }

  openInModal(variant: StockVariant): void {
    this.selectedVariant = variant;
    this.inQty = null;
    this.inReason = 'RESTOCK';
    this.inNote = '';
    this.showInModal = true;
  }

  openOutModal(variant: StockVariant): void {
    this.selectedVariant = variant;
    this.outQty = null;
    this.outReason = 'MANUAL_ADJUST';
    this.outNote = '';
    this.showOutModal = true;
  }

  openMovements(variant: StockVariant): void {
    this.selectedVariant = variant;
    this.showMovementsModal = true;
    this.fetchMovements();
  }

  closeModals(): void {
    this.showInModal = false;
    this.showOutModal = false;
    this.showMovementsModal = false;
  }

  submitIn(): void {
    if (!this.selectedVariant) {
      return;
    }
    if (!this.inQty || this.inQty <= 0) {
      this.alertService.errorAlert('Ingresá una cantidad válida.');
      return;
    }
    if (!this.inNote.trim()) {
      this.alertService.errorAlert('La nota es obligatoria.');
      return;
    }
    const request: StockMovementRequest = {
      variantId: this.selectedVariant.id,
      qty: this.inQty,
      type: 'IN',
      reason: this.inReason,
      note: this.inNote.trim(),
      createdBy: this.getCreatedBy(),
    };
    this.alertService.confirmAction({
      title: 'Confirmar acción',
      text: MICROCOPY.admin.stockInInfo,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar'
    }).then((confirmed) => {
      if (!confirmed) return;
      this.stockAdminService.createMovement(request).subscribe({
        next: () => {
          this.alertService.successAlert(MICROCOPY.admin.stockSuccess);
          this.showInModal = false;
          this.loadVariants();
        },
        error: (error) => {
          this.alertService.errorAlert(error?.error?.message || MICROCOPY.general.genericError);
        },
      });
    });
  }

  submitOut(): void {
    if (!this.selectedVariant) {
      return;
    }
    if (!this.outQty || this.outQty <= 0) {
      this.alertService.errorAlert('Ingresá una cantidad válida.');
      return;
    }
    if (!this.outNote.trim()) {
      this.alertService.errorAlert('La nota es obligatoria.');
      return;
    }
    const request: StockMovementRequest = {
      variantId: this.selectedVariant.id,
      qty: this.outQty,
      type: 'OUT',
      reason: this.outReason,
      note: this.outNote.trim(),
      createdBy: this.getCreatedBy(),
    };
    this.alertService.confirmAction({
      title: 'Confirmar acción',
      text: MICROCOPY.admin.stockOutInfo,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar'
    }).then((confirmed) => {
      if (!confirmed) return;
      this.stockAdminService.createMovement(request).subscribe({
        next: () => {
          this.alertService.successAlert(MICROCOPY.admin.stockSuccess);
          this.showOutModal = false;
          this.loadVariants();
        },
        error: (error) => {
          this.alertService.errorAlert(error?.error?.message || MICROCOPY.general.genericError);
        },
      });
    });
  }

  fetchMovements(): void {
    if (!this.selectedVariant) {
      return;
    }
    this.movementsLoading = true;
    const fromIso = this.movementFrom ? new Date(this.movementFrom).toISOString() : undefined;
    const toIso = this.movementTo ? new Date(this.movementTo).toISOString() : undefined;
    this.stockAdminService.getMovements(this.selectedVariant.id, fromIso, toIso).subscribe({
      next: (movements) => {
        this.movements = movements || [];
        this.movementsLoading = false;
      },
      error: () => {
        this.movementsLoading = false;
        this.alertService.errorAlert(MICROCOPY.general.genericError);
      },
    });
  }

  getStatusLabel(variant: StockVariant): string {
    const current = variant.stockCurrent ?? 0;
    const minimum = variant.stockMinimum ?? 0;
    return current <= minimum ? 'Bajo stock' : 'OK';
  }

  getStatusClass(variant: StockVariant): string {
    const current = variant.stockCurrent ?? 0;
    const minimum = variant.stockMinimum ?? 0;
    return current <= minimum ? 'status-danger' : 'status-ok';
  }

  private getCreatedBy(): string {
    const token = this.sessionStorage.getItem('token');
    if (token && token.id) {
      return `admin:${token.id}`;
    }
    return 'admin';
  }
}
