import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import * as moment from 'moment';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { BehaviorSubject, Subscription, catchError, of } from 'rxjs';
import { CurrencyService } from 'src/services/currency-service';

interface Currency {
  code: string;
  mid: number;
}

interface CurrencyTable {
  label: string;
  value: string;
}

@Component({
  selector: 'app-currency-table',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    TableModule,
    PaginatorModule,
    CalendarModule,
    ReactiveFormsModule,
    InputNumberModule,
    ButtonModule,
  ],
  templateUrl: './currency-table.component.html',
  styleUrls: ['./currency-table.component.css'],
})
export class CurrencyTableComponent implements OnInit {
  currencies: Currency[] = [];
  convertedAmount = new BehaviorSubject(0);
  currencyForm!: FormGroup;
  currencyConverterForm!: FormGroup;
  selectedTable: string = 'A';
  tables: CurrencyTable[] = [
    { label: 'Tabela A kursów średnich', value: 'A' },
    { label: 'Tabela B kursów średnich', value: 'B' },
    { label: 'Tabela C kursów kupna i sprzedaży', value: 'C' },
  ];
  errorMessage: string = '';
  date!: string;
  private subscription: Subscription = new Subscription();

  constructor(
    private currencyService: CurrencyService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadCurrencyTable(this.selectedTable);

    this.initCurrencyForm();

    this.initConverterCurrencyForm();

    this.subscription.add(
      this.currencyForm.valueChanges.subscribe((value) => {
        const formatDate = moment(value.date).format('YYYY-MM-DD');
        this.loadCurrencyTable(value.selectedTable, formatDate);
        this.resetConverterForm();
      })
    );
  }

  initCurrencyForm() {
    this.currencyForm = this.fb.group({
      selectedTable: ['A'],
      date: [moment().toDate()],
    });
  }
  initConverterCurrencyForm() {
    this.currencyConverterForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0)]],
      fromCurrency: [null, Validators.required],
      toCurrency: [null, Validators.required],
    });
  }

  get label(): string {
    const fromCurrency = this.currencyConverterForm.value.fromCurrency;
    const toCurrency = this.currencyConverterForm.value.toCurrency;

    if (fromCurrency && toCurrency && fromCurrency.code && toCurrency.code) {
      return `Konwertuj ${fromCurrency.code}/${toCurrency.code}`;
    } else {
      return 'Konwertuj';
    }
  }

  resetConverterForm() {
    this.convertedAmount.next(0);
    this.currencyConverterForm.reset();
  }

  loadCurrencyTable(table: string, date?: string): void {
    this.currencyService
      .getExchangeRates(table, date)
      .pipe(
        catchError((error) => {
          this.errorMessage =
            'Wystąpił problem z załadowaniem danych. Spóbuj później.';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.errorMessage,
          });
          return of([]);
        })
      )
      .subscribe((data) => {
        if (data && data.length > 0) {
          this.currencies = data[0].rates;
          this.errorMessage = '';
        }
      });
  }

  convertCurrency(): void {
    if (this.currencyConverterForm.valid) {
      const formValues = this.currencyConverterForm.value;
      const fromRate = this.currencies.find(
        (rate) => rate.code === formValues.fromCurrency.code
      )?.mid;
      const toRate = this.currencies.find(
        (rate) => rate.code === formValues.toCurrency.code
      )?.mid;
      if (fromRate && toRate) {
        this.convertedAmount.next((formValues.amount / fromRate) * toRate);
      }
    }
  }
}
