import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockHolding, StockService } from '../stock/stock.service';
import { SmsService } from '../sms.service';

@Component({
  selector: 'app-manage-stocks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-stocks.component.html',
  styleUrls: ['./manage-stocks.component.scss']
})
export class ManageStocksComponent implements OnInit, OnDestroy {
  stocks: StockHolding[] = [];
  form: Omit<StockHolding, 'id'> = this.emptyForm();
  editingId: string | undefined;
  message = '';
  error = '';
  saving = false;
  smsPhone = '';
  smsMessage = 'MyStockWidget SMS test';
  smsSending = false;
  smsStatus = '';
  private stocksSubscription?: { unsubscribe: () => void };

  constructor(private stockService: StockService, private smsService: SmsService) { }

  ngOnInit(): void {
    this.stocksSubscription = this.stockService.watchStocks().subscribe({
      next: (stocks) => {
        this.stocks = stocks;
        this.error = '';
      },
      error: () => this.error = 'Unable to load stocks from Firebase.'
    });
  }

  ngOnDestroy(): void {
    this.stocksSubscription?.unsubscribe();
  }

  async saveStock(): Promise<void> {
    this.message = '';
    this.error = '';
    if (!this.form.name.trim() || !this.form.symbol.trim() || this.form.quantity < 0 || this.form.buyPrice < 0) {
      this.error = 'Enter a stock name, symbol, and valid non-negative values.';
      return;
    }

    this.saving = true;
    try {
      const stock = {
        name: this.form.name.trim(),
        symbol: this.form.symbol.trim().toUpperCase(),
        quantity: Number(this.form.quantity),
        buyPrice: Number(this.form.buyPrice)
      };
      if (this.editingId) {
        await this.stockService.updateStock({ ...stock, id: this.editingId });
        this.message = 'Stock updated.';
      } else {
        await this.stockService.addStock(stock);
        this.message = 'Stock added.';
      }
      this.cancelEdit();
    } catch {
      this.error = 'Unable to save the stock to Firebase.';
    } finally {
      this.saving = false;
    }
  }

  editStock(stock: StockHolding): void {
    this.editingId = stock.id;
    this.form = {
      name: stock.name,
      symbol: stock.symbol,
      quantity: stock.quantity,
      buyPrice: stock.buyPrice
    };
    this.message = '';
    this.error = '';
  }

  async deleteStock(stock: StockHolding): Promise<void> {
    if (!stock.id || !confirm(`Delete ${stock.name}?`)) return;

    this.message = '';
    this.error = '';
    try {
      await this.stockService.deleteStock(stock.id);
      this.message = 'Stock deleted.';
      if (this.editingId === stock.id) this.cancelEdit();
    } catch {
      this.error = 'Unable to delete the stock from Firebase.';
    }
  }

  sendTestSms(): void {
    this.smsStatus = '';
    if (!this.smsPhone.trim() || !this.smsMessage.trim()) {
      this.smsStatus = 'Enter a phone number and message.';
      return;
    }

    this.smsSending = true;
    this.smsService.sendSms(this.smsPhone.trim(), this.smsMessage.trim()).subscribe({
      next: () => {
        this.smsStatus = 'SMS sent successfully.';
        this.smsSending = false;
      },
      error: () => {
        this.smsStatus = 'SMS failed. Check the number, Twilio settings, and Function logs.';
        this.smsSending = false;
      }
    });
  }

  cancelEdit(): void {
    this.editingId = undefined;
    this.form = this.emptyForm();
  }

  private emptyForm(): Omit<StockHolding, 'id'> {
    return { name: '', symbol: '', quantity: 0, buyPrice: 0 };
  }
}
