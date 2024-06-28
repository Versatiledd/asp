import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CurrencyService } from 'src/services/currency-service';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { CurrencyTableComponent } from './currency-table/currency-table.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [AppComponent],
  providers: [CurrencyService, provideHttpClient(withInterceptorsFromDi())],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ButtonModule,
    TableModule,
    CurrencyTableComponent,
    BrowserAnimationsModule,
  ],
})
export class AppModule {}
