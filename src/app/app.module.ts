import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StockComponent } from './stock/stock.component';
import { StockListComponent } from './stock-list/stock-list.component';
import { ManageStocksComponent } from './manage-stocks/manage-stocks.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    StockComponent,
    StockListComponent,
    ManageStocksComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
