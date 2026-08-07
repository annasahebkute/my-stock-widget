import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockComponent } from '../stock/stock.component';
import { StockHolding, StockService } from '../stock/stock.service';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, StockComponent],
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.scss']
})
export class StockListComponent implements OnInit, OnDestroy {
  stocks: StockHolding[] = [];
  error = '';
  private marketValues = new Map<string, number>();
  private stocksSubscription?: { unsubscribe: () => void };

  constructor(private stockService: StockService) { }

  ngOnInit(): void {
    this.stocksSubscription = this.stockService.watchStocks().subscribe({
      next: (stocks) => {
        this.stocks = stocks;
        const symbols = new Set(stocks.map((stock) => stock.symbol));
        for (const symbol of this.marketValues.keys()) {
          if (!symbols.has(symbol)) this.marketValues.delete(symbol);
        }
        this.error = '';
      },
      error: () => this.error = 'Unable to load your stocks from Firebase.'
    });
  }

  ngOnDestroy(): void {
    this.stocksSubscription?.unsubscribe();
  }

  get totalInvestment(): number {
    return this.stocks.reduce((total, stock) => total + stock.quantity * stock.buyPrice, 0);
  }

  get totalCurrentValue(): number {
    return Array.from(this.marketValues.values()).reduce((total, value) => total + value, 0);
  }

  updateMarketValue(symbol: string, value: number): void {
    this.marketValues.set(symbol, value);
  }
}