import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private _storage: Storage | null = null;
  private isInitialized = false;

  constructor(private storage: Storage) {
    this.initializeDatabase();
  }

  async initializeDatabase() {
    if (this.isInitialized) return;
    const storage = await this.storage.create();
    this._storage = storage;

    // Inicializar datos si están vacíos
    if (!(await this.get('categories')) || (await this.get('categories')).length === 0) {
      await this.set('categories', [
        { id: 1, name: 'Donas Clásicas 🍩', color_code: '#ffb7c5' },
        { id: 2, name: 'Donas Especiales ✨', color_code: '#e1bee7' },
        { id: 3, name: 'Bebidas 🥤', color_code: '#b3e5fc' }
      ]);
    }

    if (!(await this.get('toppings')) || (await this.get('toppings')).length === 0) {
      await this.set('toppings', [
        { id: 1, name: 'Chispas 🌈', price: 5 },
        { id: 2, name: 'Nuez 🥜', price: 10 },
        { id: 3, name: 'Bolsa Regalo 🎀', price: 15 }
      ]);
    }

    if (!(await this.get('products'))) {
      await this.set('products', []);
    }

    if (!(await this.get('orders'))) {
      await this.set('orders', []);
    }

    if (!(await this.get('iva'))) {
      await this.set('iva', '16');
    }

    this.isInitialized = true;
    console.log('¡DonasApp Storage Listo! 🍩✨');
  }

  async query(statement: string, params: any[] = []) {
    if (statement.includes('FROM categories')) {
      return { values: await this.get('categories') };
    }
    if (statement.includes('FROM products')) {
      const prods = await this.get('products') || [];
      const cats = await this.get('categories') || [];
      const joined = prods.map((p: any) => ({
        ...p,
        cat_name: cats.find((c: any) => c.id === p.cat_id)?.name || 'Sin Categoría'
      }));
      return { values: joined };
    }
    if (statement.includes('FROM toppings')) {
      return { values: await this.get('toppings') };
    }
    if (statement.includes('FROM config') || statement.includes("key = 'iva'")) {
      const iva = await this.get('iva');
      return { values: [{ value: iva || '16' }] };
    }
    
    // Mejorar simulación para Wallet
    if (statement.includes('FROM orders')) {
      const orders = await this.get('orders') || [];
      
      if (statement.includes('SUM(total)')) {
        const total = orders.reduce((acc: number, o: any) => acc + (o.total || 0), 0);
        return { values: [{ total }] };
      }
      
      if (statement.includes('GROUP BY payment_method')) {
        const groups: any = {};
        orders.forEach((o: any) => {
          groups[o.payment_method] = (groups[o.payment_method] || 0) + o.total;
        });
        return { values: Object.keys(groups).map(k => ({ payment_method: k, subtotal: groups[k] })) };
      }
      
      return { values: orders };
    }
    
    if (statement.includes('FROM order_items')) {
       const orders = await this.get('orders') || [];
       const allItems = orders.flatMap((o: any) => o.items || []);
       
       if (statement.includes('GROUP BY oi.product_id')) {
         const prods = await this.get('products') || [];
         const sales: any = {};
         allItems.forEach((item: any) => {
           sales[item.product_id] = (sales[item.product_id] || 0) + item.qty;
         });
         
         const result = Object.keys(sales).map(pid => {
           const p = prods.find((x: any) => x.id === parseInt(pid));
           return { name: p?.name || 'Producto Desconocido', total_qty: sales[pid] };
         }).sort((a, b) => b.total_qty - a.total_qty);
         
         return { values: result.slice(0, 5) };
       }
       
       return { values: allItems };
    }
    return { values: [] };
  }

  async run(statement: string, params: any[] = []) {
    if (statement.includes('INSERT INTO categories')) {
      const cats = await this.get('categories') || [];
      const newCat = { id: Date.now(), name: params[0], color_code: params[1] };
      cats.push(newCat);
      await this.set('categories', cats);
      return { changes: { lastId: newCat.id } };
    }
    if (statement.includes('INSERT INTO toppings')) {
      const tops = await this.get('toppings') || [];
      const newTop = { id: Date.now(), name: params[0], price: params[1] };
      tops.push(newTop);
      await this.set('toppings', tops);
      return { changes: { lastId: newTop.id } };
    }
    if (statement.includes('INSERT INTO products')) {
      const prods = await this.get('products') || [];
      const newProd = { 
        id: Date.now(), name: params[0], price: params[1], 
        stock: params[2], cat_id: params[3], image_url: params[4], is_active: 1 
      };
      prods.push(newProd);
      await this.set('products', prods);
      return { changes: { lastId: newProd.id } };
    }
    if (statement.includes('UPDATE products SET stock')) {
       const prods = await this.get('products') || [];
       const idx = prods.findIndex((p: any) => p.id === params[1]);
       if (idx > -1) {
         prods[idx].stock = params[0];
         await this.set('products', prods);
       }
    }
    if (statement.includes('UPDATE products SET is_active')) {
       const prods = await this.get('products') || [];
       const idx = prods.findIndex((p: any) => p.id === params[1]);
       if (idx > -1) {
         prods[idx].is_active = params[0];
         await this.set('products', prods);
       }
    }
    if (statement.includes('DELETE FROM products')) {
       const prods = await this.get('products') || [];
       const filtered = prods.filter((p: any) => p.id !== params[0]);
       await this.set('products', filtered);
    }
    if (statement.includes('INSERT INTO orders')) {
      const orders = await this.get('orders') || [];
      const newOrder = { 
        id: Date.now(), date: params[0], total: params[1], 
        tax: params[2], payment_method: params[3], status: params[4],
        items: []
      };
      orders.push(newOrder);
      await this.set('orders', orders);
      return { changes: { lastId: newOrder.id } };
    }
    if (statement.includes('INSERT INTO order_items')) {
       const orders = await this.get('orders') || [];
       const orderIdx = orders.findIndex((o: any) => o.id === params[0]);
       if (orderIdx > -1) {
         orders[orderIdx].items.push({
           product_id: params[1], qty: params[2], price: params[3], 
           subtotal: params[4], extras_text: params[5]
         });
         await this.set('orders', orders);
       }
    }
    if (statement.includes('UPDATE config SET value')) {
       await this.set('iva', params[0]);
    }
    if (statement.includes('DELETE FROM toppings')) {
      const tops = await this.get('toppings') || [];
      const filtered = tops.filter((t: any) => t.id !== params[0]);
      await this.set('toppings', filtered);
    }
    return { changes: { lastId: 0 } };
  }

  async set(key: string, value: any) {
    return await this._storage?.set(key, value);
  }

  async get(key: string) {
    return await this._storage?.get(key);
  }
}
