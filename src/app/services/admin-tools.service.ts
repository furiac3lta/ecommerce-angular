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

  downloadSalesReport(fromIso: string, toIso: string): Observable<Blob> {
    return this.httpClient.get(`${this.reportsUrl}/sales.pdf?from=${fromIso}&to=${toIso}`, {
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
}
