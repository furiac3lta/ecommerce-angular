import { Component, OnInit } from '@angular/core';
import { StockAdminService } from 'src/app/services/stock-admin.service';
import { StockVariant } from 'src/app/common/stock-variant';
import { StockMovement, StockMovementReason, StockMovementRequest, StockMovementType } from 'src/app/common/stock-movement';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { ToastrService } from 'ngx-toastr';

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
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadVariants();
  }

  loadVariants(): void {
    this.stockAdminService.getVariants().subscribe({
      next: (variants) => {
        this.variants = variants || [];
        this.applyFilter();
      },
      error: () => {
        this.toastr.error('No se pudieron cargar las variantes', 'Stock');
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
      this.toastr.error('Ingresá una cantidad válida', 'Stock');
      return;
    }
    if (!this.inNote.trim()) {
      this.toastr.error('La nota es obligatoria', 'Stock');
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
    this.stockAdminService.createMovement(request).subscribe({
      next: () => {
        this.toastr.success('Ingreso registrado', 'Stock');
        this.showInModal = false;
        this.loadVariants();
      },
      error: (error) => {
        this.toastr.error(error?.error?.message || 'No se pudo registrar el ingreso', 'Stock');
      },
    });
  }

  submitOut(): void {
    if (!this.selectedVariant) {
      return;
    }
    if (!this.outQty || this.outQty <= 0) {
      this.toastr.error('Ingresá una cantidad válida', 'Stock');
      return;
    }
    if (!this.outNote.trim()) {
      this.toastr.error('La nota es obligatoria', 'Stock');
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
    this.stockAdminService.createMovement(request).subscribe({
      next: () => {
        this.toastr.success('Egreso registrado', 'Stock');
        this.showOutModal = false;
        this.loadVariants();
      },
      error: (error) => {
        this.toastr.error(error?.error?.message || 'No se pudo registrar el egreso', 'Stock');
      },
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
        this.toastr.error('No se pudo cargar el historial', 'Stock');
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
