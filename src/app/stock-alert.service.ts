import { Injectable } from '@angular/core';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from './firebase';

@Injectable({ providedIn: 'root' })
export class StockAlertService {
  async recordBoundaryAlert(
    name: string,
    symbol: string,
    price: number,
    alertType: '52-week-high' | '52-week-low'
  ): Promise<void> {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const minutes = Number(values['hour']) * 60 + Number(values['minute']);
    if (minutes < 9 * 60 || minutes > 15 * 60) return;

    const day = `${values['year']}-${values['month']}-${values['day']}`;
    const alertId = `${day}_${symbol}`;

    await setDoc(doc(firestore, 'stockAlerts', alertId), {
      name,
      symbol,
      price,
      alertType,
      detectedAt: serverTimestamp()
    }, { merge: false });
  }
}
