import { Component, EventEmitter, Input, OnInit, OnDestroy, Output, SimpleChanges, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subscription, interval, startWith, switchMap, catchError, of } from 'rxjs';
import { StockAlertService } from '../stock-alert.service';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit, OnDestroy, OnChanges {
  /** NSE ticker WITHOUT the .NS suffix, e.g. "RELIANCE", "TCS", "INFY" */
  @Input() symbol = 'RELIANCE';

  /** Optional friendly display name, e.g. "HDFC Bank". Falls back to symbol if not set. */
  @Input() name = '';

  /** Poll interval for updates, in seconds. */
  @Input() refreshSeconds = 30;

  @Input() quantity = 0;
  @Input() buyPrice = 0;
  @Output() marketValueChange = new EventEmitter<number>();

  loading = signal(true);
  error = signal<string | null>(null);
  price = signal(0);
  change = signal(0);
  changePercent = signal(0);
  high52 = signal(0);
  low52 = signal(0);
  lastUpdated = signal('');
  usingCachedData = signal(false);

  private sub?: Subscription;

  constructor(private http: HttpClient, private stockAlertService: StockAlertService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['quantity'] && !changes['quantity'].firstChange) {
      this.emitMarketValue();
    }
  }

  ngOnInit(): void {
    this.loadCachedQuote();
    this.sub = interval(this.refreshSeconds * 1000)
      .pipe(
        startWith(0),
        switchMap(() => this.fetchQuote().pipe(
          catchError((error) => of({ error }))
        ))
      )
      .subscribe((result) => {
        if ('error' in result) {
          this.error.set(result.error?.status === 429 ? 'Live data is temporarily unavailable.' : 'Live data is unavailable.');
          if (this.lastUpdated()) {
            this.usingCachedData.set(true);
          }
          this.emitMarketValue();
          this.loading.set(false);
          return;
        }

        const data = result;
        this.saveCachedQuote(data);
        this.price.set(data.regularMarketPrice ?? 0);
        this.high52.set(data.fiftyTwoWeekHigh ?? 0);
        this.low52.set(data.fiftyTwoWeekLow ?? 0);
        const prevClose = data.chartPreviousClose ?? data.previousClose ?? this.price();
        const ch = this.price() - prevClose;
        this.change.set(ch);
        this.changePercent.set(prevClose ? (ch / prevClose) * 100 : 0);
        this.lastUpdated.set(new Date().toLocaleTimeString());
        this.loading.set(false);
        this.usingCachedData.set(false);
        this.error.set(null);
        this.emitMarketValue();
        this.notifyIfAt52WeekBoundary();
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private fetchQuote() {
    const url = `/api/yahoo/v8/finance/chart/${encodeURIComponent(this.symbol)}.NS`;
    return this.http.get<any>(url).pipe(
      switchMap((res) => {
        const meta = res?.chart?.result?.[0]?.meta;
        if (!meta) throw new Error('No data');
        return of(meta);
      })
    );
  }

  private emitMarketValue(): void {
    this.marketValueChange.emit(this.price() * this.quantity);
  }

  private notifyIfAt52WeekBoundary(): void {
    const alertType = this.price() >= this.high52()
      ? '52-week-high'
      : this.price() <= this.low52()
        ? '52-week-low'
        : null;

    if (!alertType || !this.price()) return;

    void this.stockAlertService.recordBoundaryAlert(
      this.name || this.symbol,
      this.symbol,
      this.price(),
      alertType
    ).catch(() => undefined);
  }

  isNear52WeekHigh(): boolean {
    return this.price() > 0 && this.high52() > 0 && this.price() >= this.high52() * 0.95;
  }

  isNear52WeekLow(): boolean {
    return this.price() > 0 && this.low52() > 0 && this.price() <= this.low52() * 1.05;
  }

  private get cacheKey(): string {
    return `stock-quote:${this.symbol}`;
  }

  private loadCachedQuote(): void {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return;

      const data = JSON.parse(cached);
      this.price.set(data.price);
      this.change.set(data.change);
      this.changePercent.set(data.changePercent);
      this.high52.set(data.high52);
      this.low52.set(data.low52);
      this.lastUpdated.set(data.lastUpdated);
      this.usingCachedData.set(true);
      this.loading.set(false);
    } catch {
      localStorage.removeItem(this.cacheKey);
    }
  }

  private saveCachedQuote(data: any): void {
    const price = data.regularMarketPrice ?? 0;
    const prevClose = data.chartPreviousClose ?? data.previousClose ?? price;
    const change = price - prevClose;

    try {
      localStorage.setItem(this.cacheKey, JSON.stringify({
        price,
        change,
        changePercent: prevClose ? (change / prevClose) * 100 : 0,
        high52: data.fiftyTwoWeekHigh ?? 0,
        low52: data.fiftyTwoWeekLow ?? 0,
        lastUpdated: new Date().toLocaleTimeString()
      }));
    } catch {
      // Storage may be unavailable; live data should still work.
    }
  }
}