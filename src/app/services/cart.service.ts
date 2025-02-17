/* import { Injectable } from '@angular/core';
import { ItemCart } from '../common/item-cart';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // Agregar un behavior subject para que se actualice el carrito en tiempo real
  // Cuando declaras el behavior subject, le pasas el valor inicial y desde el componente NavbarComponent
  // te suscribes a el para que te notifique cuando cambie el valor

  private items: Map<number, ItemCart> = new Map<number, ItemCart>();

  itemList: ItemCart[] = [];

  constructor() {}

  addItemCart(itemCart: ItemCart) {
    this.items.set(itemCart.productId, itemCart);
  }
  deleteItemCart(productId: number) {
    this.items.delete(productId);
    this.items.forEach((valor, clave) => {
      console.log('esta es la clave y su valor: ' + clave, valor);
    });
  }
  totalCart() {
    let totalCart: number = 0;
    this.items.forEach((item, clave) => {
      totalCart += item.getTotalPriceItem();
    });
    return totalCart;
  }

  convertToListFromMap() {
    this.itemList.splice(0, this.itemList.length);
    this.items.forEach((item, clave) => {
      this.itemList.push(item);
    });
    return this.itemList;
  }
  updateItemQuantity(productId: number, quantity: number): void {
    if (this.items.has(productId)) {
      const item = this.items.get(productId);
      if (item) {
        item.quantity = quantity;
        this.items.set(productId, item);
      }
    }
  }
}
 */
import { Injectable } from '@angular/core';
import { ItemCart } from '../common/item-cart';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private items: Map<number, ItemCart> = new Map<number, ItemCart>();

  private cartSubject = new BehaviorSubject<ItemCart[]>([]);
  cart$: Observable<ItemCart[]> = this.cartSubject.asObservable();

  constructor() {}

  private updateCartState() {
    this.cartSubject.next(this.convertToListFromMap());
  }

  addItemCart(itemCart: ItemCart) {
    this.items.set(itemCart.productId, itemCart);
    this.updateCartState();
  }

  deleteItemCart(productId: number) {
    this.items.delete(productId);
    this.updateCartState();
  }

  totalCart() {
    let totalCart: number = 0;
    this.items.forEach((item) => {
      totalCart += item.getTotalPriceItem();
    });
    return totalCart;
  }

  convertToListFromMap(): ItemCart[] {
    return Array.from(this.items.values());
  }

  updateItemQuantity(productId: number, quantity: number): void {
    if (this.items.has(productId)) {
      const item = this.items.get(productId);
      if (item) {
        item.quantity = quantity;
        this.items.set(productId, item);
        this.updateCartState();
      }
    }
  }

  getCart(): Observable<ItemCart[]> {
    return this.cart$;
  }
}
