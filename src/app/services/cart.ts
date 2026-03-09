import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ExtraItem {
  name: string;
  price: number;
}

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
  extras: ExtraItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItems.asObservable();
  private ivaRate = 0.16; // 16% por defecto

  constructor() { }

  setIva(rate: number) {
    this.ivaRate = rate / 100;
  }

  getIvaRate() {
    return this.ivaRate * 100;
  }

  addToCart(product: any, extras: ExtraItem[] = []) {
    const currentItems = this.cartItems.getValue();
    
    // Calculamos el precio total del item incluyendo extras
    const extrasPrice = extras.reduce((acc, e) => acc + e.price, 0);
    const itemUnitPrice = product.price + extrasPrice;

    // Para simplificar, si tiene extras diferentes, creamos items separados
    // o simplemente buscamos coincidencia exacta de producto + extras
    const existingItemIndex = currentItems.findIndex(item => 
      item.product_id === product.id && 
      JSON.stringify(item.extras) === JSON.stringify(extras)
    );

    if (existingItemIndex > -1) {
      currentItems[existingItemIndex].qty += 1;
      currentItems[existingItemIndex].subtotal = currentItems[existingItemIndex].qty * itemUnitPrice;
    } else {
      currentItems.push({
        product_id: product.id,
        name: product.name,
        price: itemUnitPrice,
        qty: 1,
        subtotal: itemUnitPrice,
        extras: [...extras]
      });
    }

    this.cartItems.next([...currentItems]);
  }

  removeFromCart(index: number) {
    const currentItems = this.cartItems.getValue();
    currentItems.splice(index, 1);
    this.cartItems.next([...currentItems]);
  }

  updateQuantity(index: number, qty: number) {
    const currentItems = this.cartItems.getValue();
    if (qty <= 0) {
      this.removeFromCart(index);
    } else {
      currentItems[index].qty = qty;
      currentItems[index].subtotal = qty * currentItems[index].price;
      this.cartItems.next([...currentItems]);
    }
  }

  clearCart() {
    this.cartItems.next([]);
  }

  getTotal() {
    return this.cartItems.getValue().reduce((acc, item) => acc + item.subtotal, 0);
  }

  getTax() {
    // Calculamos el IVA sobre el total (si el precio no lo incluye)
    // O desglosamos si ya está incluido. Aquí asumiremos que se suma.
    return this.getTotal() * this.ivaRate;
  }

  getGrandTotal() {
    return this.getTotal() + this.getTax();
  }
}
