import { Component, OnInit } from '@angular/core';
import { SaleChannel } from 'src/app/common/sale-channel';
import { HeroCarouselSlide } from 'src/app/components/home/hero-carousel/hero-carousel.component';
import { MICROCOPY } from 'src/app/constants/microcopy';
import { AdminToolsService, ExcelImportResult } from 'src/app/services/admin-tools.service';
import { AlertService } from 'src/app/services/alert.service';
import { HeroCarouselAdminService } from 'src/app/services/hero-carousel-admin.service';

@Component({
  selector: 'app-admin-tools',
  templateUrl: './admin-tools.component.html',
  styleUrls: ['./admin-tools.component.css']
})
export class AdminToolsComponent implements OnInit {
  importResult: ExcelImportResult | null = null;
  importFile: File | null = null;
  importFileName = 'Ningun archivo seleccionado';
  reportFrom = '';
  reportTo = '';
  kardexVariantId: number | null = null;
  stockVariantId: number | null = null;
  stockType = '';
  stockReason = '';
  salesChannelFilter: SaleChannel | '' = '';
  heroSlidesForm: HeroCarouselSlide[] = [];
  heroSlideUploadNames: string[] = [];
  heroSlideUploading: boolean[] = [];
  heroSlideUploadMessages: string[] = [];
  saleChannels: { value: SaleChannel; label: string }[] = [
    { value: SaleChannel.ONLINE, label: 'Online' },
    { value: SaleChannel.WHOLESALE, label: 'Mayorista' },
    { value: SaleChannel.OFFLINE, label: 'Offline' },
  ];

  constructor(
    private adminToolsService: AdminToolsService,
    private alertService: AlertService,
    private heroCarouselAdminService: HeroCarouselAdminService
  ) {}

  ngOnInit(): void {
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - 30);
    this.reportFrom = from.toISOString().slice(0, 16);
    this.reportTo = now.toISOString().slice(0, 16);
    this.heroCarouselAdminService.getSlides().subscribe((slides) => {
      this.heroSlidesForm = slides.map((slide) => ({ ...slide }));
      this.syncHeroSlideUploadState();
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.importFile = file || null;
    this.importFileName = this.importFile ? this.importFile.name : 'Ningun archivo seleccionado';
  }

  uploadExcel(): void {
    if (!this.importFile) {
      this.alertService.errorAlert('Selecciona un archivo antes de importar.');
      return;
    }

    this.adminToolsService.uploadExcel(this.importFile).subscribe({
      next: (result) => {
        this.importResult = result;
        this.alertService.successAlert('Importacion finalizada.');
      },
      error: (error) => {
        this.alertService.errorAlert(error?.error?.message || MICROCOPY.general.genericError);
      }
    });
  }

  downloadTemplate(): void {
    this.adminToolsService.downloadTemplate().subscribe((blob) => {
      this.saveBlob(blob, 'template.xlsx');
    });
  }

  downloadSalesReport(): void {
    this.adminToolsService.downloadSalesReport(
      this.reportFrom,
      this.reportTo,
      this.salesChannelFilter || undefined
    ).subscribe((blob) => {
      this.saveBlob(blob, 'sales-report.pdf');
    });
  }

  downloadStockReport(): void {
    this.adminToolsService.downloadStockReport(
      this.reportFrom,
      this.reportTo,
      this.stockVariantId || undefined,
      this.stockType || undefined,
      this.stockReason || undefined
    ).subscribe((blob) => {
      this.saveBlob(blob, 'stock-report.pdf');
    });
  }

  downloadKardexReport(): void {
    if (!this.kardexVariantId) {
      this.alertService.errorAlert('Completa Variant ID para descargar el kardex.');
      return;
    }

    this.adminToolsService.downloadKardexReport(this.kardexVariantId, this.reportFrom, this.reportTo).subscribe((blob) => {
      this.saveBlob(blob, 'kardex.pdf');
    });
  }

  downloadOrdersShipmentsReport(): void {
    this.adminToolsService.downloadOrdersShipmentsReport(this.reportFrom, this.reportTo).subscribe((blob) => {
      this.saveBlob(blob, 'orders-shipments.pdf');
    });
  }

  downloadDeliveriesReport(): void {
    this.adminToolsService.downloadDeliveriesReport(this.reportFrom, this.reportTo).subscribe((blob) => {
      this.saveBlob(blob, 'deliveries-report.pdf');
    });
  }

  downloadManualUsuario(): void {
    this.adminToolsService.downloadManualUsuario().subscribe((blob) => {
      this.saveBlob(blob, 'Manual_Usuario_LionsBrand.pdf');
    });
  }

  downloadManualAdmin(): void {
    this.adminToolsService.downloadManualAdmin().subscribe((blob) => {
      this.saveBlob(blob, 'Manual_Admin_LionsBrand.pdf');
    });
  }

  addHeroSlide(): void {
    this.heroSlidesForm.push({
      eyebrow: 'Nuevo slide',
      title: 'Titulo del slide',
      subtitle: 'Descripcion breve del slide.',
      ctaText: 'Ver mas',
      ctaLink: '/product',
      image: 'assets/bjj/kimono1.jpg',
      align: 'left'
    });
    this.syncHeroSlideUploadState();
  }

  removeHeroSlide(index: number): void {
    this.heroSlidesForm.splice(index, 1);
    this.heroSlideUploadNames.splice(index, 1);
    this.heroSlideUploading.splice(index, 1);
    this.heroSlideUploadMessages.splice(index, 1);
  }

  saveHeroSlides(): void {
    const normalized: HeroCarouselSlide[] = this.heroSlidesForm
      .map((slide) => ({
        eyebrow: (slide.eyebrow || '').trim(),
        title: (slide.title || '').trim(),
        subtitle: (slide.subtitle || '').trim(),
        ctaText: (slide.ctaText || '').trim(),
        ctaLink: (slide.ctaLink || '').trim() || '/product',
        image: (slide.image || '').trim(),
        align: (slide.align === 'center' ? 'center' : 'left') as 'left' | 'center'
      }))
      .filter((slide) => slide.title && slide.ctaText && slide.image);

    if (!normalized.length) {
      this.alertService.errorAlert('Necesitas al menos un slide valido con titulo, CTA e imagen.');
      return;
    }

    this.heroCarouselAdminService.saveSlides(normalized).subscribe({
      next: (saved) => {
        this.heroSlidesForm = saved.map((slide) => ({ ...slide }));
        this.syncHeroSlideUploadState();
        this.alertService.successAlert('Carrusel actualizado.');
      },
      error: (error) => {
        this.alertService.errorAlert(error?.error?.message || MICROCOPY.general.genericError);
      }
    });
  }

  resetHeroSlides(): void {
    this.heroCarouselAdminService.resetSlides().subscribe({
      next: (slides) => {
        this.heroSlidesForm = slides.map((slide) => ({ ...slide }));
        this.syncHeroSlideUploadState();
        this.alertService.successAlert('Carrusel restablecido a la version original.');
      },
      error: (error) => {
        this.alertService.errorAlert(error?.error?.message || MICROCOPY.general.genericError);
      }
    });
  }

  onHeroSlideImageSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.heroSlideUploadNames[index] = file.name;
    this.heroSlideUploading[index] = true;
    this.heroSlideUploadMessages[index] = 'Subiendo imagen...';

    this.heroCarouselAdminService.uploadSlideImage(file).subscribe({
      next: (response) => {
        this.heroSlidesForm[index].image = response.url;
        this.heroSlideUploadNames[index] = response.fileName || file.name;
        this.heroSlideUploadMessages[index] = 'Imagen cargada correctamente.';
        this.heroSlideUploading[index] = false;
        input.value = '';
        this.alertService.successAlert('Imagen del carrusel cargada.');
      },
      error: (error) => {
        this.heroSlideUploading[index] = false;
        this.heroSlideUploadMessages[index] = 'No se pudo cargar la imagen.';
        input.value = '';
        this.alertService.errorAlert(error?.error?.message || MICROCOPY.general.genericError);
      }
    });
  }

  private syncHeroSlideUploadState(): void {
    this.heroSlideUploadNames = this.heroSlidesForm.map((slide) => this.extractFileName(slide.image));
    this.heroSlideUploading = this.heroSlidesForm.map(() => false);
    this.heroSlideUploadMessages = this.heroSlidesForm.map((slide) =>
      slide.image ? 'Imagen lista.' : 'Sin imagen cargada.'
    );
  }

  private extractFileName(path: string | undefined): string {
    if (!path) {
      return 'Ninguna imagen seleccionada';
    }

    const normalized = path.split('?')[0];
    const segments = normalized.split('/');
    return segments[segments.length - 1] || 'Imagen cargada';
  }

  private saveBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
