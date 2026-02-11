import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';
import { HeaderService } from './header.service';

export interface ExcelImportResult {
  created: number;
  updated: number;
  errors: { line: number; message: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class AdminToolsService {
  private importUrl = `${environment.apiBaseUrl}/api/v1/admin/import`;
  private reportsUrl = `${environment.apiBaseUrl}/api/v1/admin/reports`;
  private deliveriesUrl = `${environment.apiBaseUrl}/api/v1/admin/deliveries`;

  constructor(private httpClient: HttpClient, private headerService: HeaderService) {}

  uploadExcel(file: File): Observable<ExcelImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient.post<ExcelImportResult>(`${this.importUrl}/excel`, formData, {
      headers: this.headerService.headers
    });
  }

  downloadTemplate(): Observable<Blob> {
    return this.httpClient.get(`${this.importUrl}/template`, {
      headers: this.headerService.headers,
      responseType: 'blob'
    });
  }

  downloadSalesReport(fromIso: string, toIso: string, saleChannel?: string): Observable<Blob> {
    const params = new URLSearchParams();
    params.set('from', fromIso);
    params.set('to', toIso);
    if (saleChannel) params.set('saleChannel', saleChannel);
    return this.httpClient.get(`${this.reportsUrl}/sales.pdf?${params.toString()}`, {
      headers: this.headerService.headers,
      responseType: 'blob'
    });
  }

  downloadStockReport(fromIso?: string, toIso?: string, variantId?: number, type?: string, reason?: string): Observable<Blob> {
    const params = new URLSearchParams();
    if (fromIso) params.set('from', fromIso);
    if (toIso) params.set('to', toIso);
    if (variantId) params.set('variantId', String(variantId));
    if (type) params.set('type', type);
    if (reason) params.set('reason', reason);
    const query = params.toString();
    const url = query ? `${this.reportsUrl}/stock.pdf?${query}` : `${this.reportsUrl}/stock.pdf`;
    return this.httpClient.get(url, {
      headers: this.headerService.headers,
      responseType: 'blob'
    });
  }

  downloadKardexReport(variantId: number, fromIso: string, toIso: string): Observable<Blob> {
    return this.httpClient.get(`${this.reportsUrl}/kardex.pdf?variantId=${variantId}&from=${fromIso}&to=${toIso}`, {
      headers: this.headerService.headers,
      responseType: 'blob'
    });
  }

  downloadOrdersShipmentsReport(fromIso: string, toIso: string): Observable<Blob> {
    return this.httpClient.get(`${this.reportsUrl}/orders-shipments.pdf?from=${fromIso}&to=${toIso}`, {
      headers: this.headerService.headers,
      responseType: 'blob'
    });
  }

  downloadDeliveriesReport(fromIso: string, toIso: string, deliveryType?: string, shipmentStatus?: string, saleChannel?: string): Observable<Blob> {
    const params = new URLSearchParams();
    params.set('from', fromIso);
    params.set('to', toIso);
    if (deliveryType) params.set('deliveryType', deliveryType);
    if (shipmentStatus) params.set('shipmentStatus', shipmentStatus);
    if (saleChannel) params.set('saleChannel', saleChannel);
    return this.httpClient.get(`${this.reportsUrl}/deliveries.pdf?${params.toString()}`, {
      headers: this.headerService.headers,
      responseType: 'blob'
    });
  }

  downloadKanbanReport(): Observable<Blob> {
    return this.httpClient.get(`${this.reportsUrl}/kanban.pdf`, {
      headers: this.headerService.headers,
      responseType: 'blob'
    });
  }

  downloadDeliveredOrdersReport(fromIso: string, toIso: string, saleChannel?: string): Observable<Blob> {
    const params = new URLSearchParams();
    params.set('from', fromIso);
    params.set('to', toIso);
    if (saleChannel) params.set('saleChannel', saleChannel);
    return this.httpClient.get(`${this.reportsUrl}/delivered-orders.pdf?${params.toString()}`, {
      headers: this.headerService.headers,
      responseType: 'blob'
    });
  }

  downloadManualUsuario(): Observable<Blob> {
    return this.httpClient.get(`${this.reportsUrl}/manual-usuario.pdf`, {
      headers: this.headerService.headers,
      responseType: 'blob'
    });
  }

  downloadManualAdmin(): Observable<Blob> {
    return this.httpClient.get(`${this.reportsUrl}/manual-admin.pdf`, {
      headers: this.headerService.headers,
      responseType: 'blob'
    });
  }

  getDeliveryAlerts(): Observable<{ todayCount: number; overdueCount: number }> {
    return this.httpClient.get<{ todayCount: number; overdueCount: number }>(`${this.deliveriesUrl}/alerts`, {
      headers: this.headerService.headers
    });
  }

  getDeliveryKpis(fromIso: string, toIso: string, saleChannel?: string): Observable<{
    avgEstimatedDays: number;
    avgActualDays: number;
    avgDiffDays: number;
    onTimePct: number;
    overduePct: number;
    totalCompleted: number;
    totalWithEstimate: number;
    totalDelivered: number;
  }> {
    const params = new URLSearchParams();
    params.set('from', fromIso);
    params.set('to', toIso);
    if (saleChannel) params.set('saleChannel', saleChannel);
    return this.httpClient.get<any>(`${this.deliveriesUrl}/kpis?${params.toString()}`, {
      headers: this.headerService.headers
    });
  }
}
