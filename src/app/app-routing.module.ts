import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockListComponent } from './stock-list/stock-list.component';
import { ManageStocksComponent } from './manage-stocks/manage-stocks.component';

const routes: Routes = [
  { path: '', component: StockListComponent },
  { path: 'manage-stocks', component: ManageStocksComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
