import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  constructor(private http: HttpClient) {}

  getExchangeRates(tableType: string, date?: string): Observable<any> {
    let url = `https://api.nbp.pl/api/exchangerates/tables/${tableType}`;
    if (date) {
      url += `?date=${date}`;
    }
    return this.http.get(url);
  }
}
