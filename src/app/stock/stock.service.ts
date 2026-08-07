import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { firestore } from '../firebase';

export interface StockHolding {
  id?: string;
  name: string;
  symbol: string;
  quantity: number;
  buyPrice: number;
}

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly stocksCollection = collection(firestore, 'stocks');

  watchStocks(): Observable<StockHolding[]> {
    return new Observable((subscriber) => {
      const unsubscribe = onSnapshot(
        query(this.stocksCollection, orderBy('createdAt', 'asc')),
        (snapshot) => subscriber.next(snapshot.docs.map((stock) => ({
          id: stock.id,
          ...stock.data()
        } as StockHolding))),
        (error) => subscriber.error(error)
      );

      return unsubscribe;
    });
  }

  addStock(stock: Omit<StockHolding, 'id'>): Promise<void> {
    return addDoc(this.stocksCollection, {
      ...stock,
      createdAt: serverTimestamp()
    }).then(() => undefined);
  }

  updateStock(stock: StockHolding): Promise<void> {
    if (!stock.id) return Promise.reject(new Error('Stock id is missing.'));

    const { id, ...data } = stock;
    return updateDoc(doc(firestore, 'stocks', id), data);
  }

  deleteStock(id: string): Promise<void> {
    return deleteDoc(doc(firestore, 'stocks', id));
  }
}
