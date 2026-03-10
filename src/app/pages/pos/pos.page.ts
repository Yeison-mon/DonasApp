import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database';
import { CartService, CartItem, ExtraItem } from '../../services/cart';
import { ThemeService } from '../../services/theme';
import { AlertController, ModalController } from '@ionic/angular';
import { ModalConfigComponent } from './modal-config.component';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.page.html',
  styleUrls: ['./pos.page.scss'],
  standalone: false
})
export class PosPage implements OnInit {
  categories: any[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];
  toppings: ExtraItem[] = [];
  selectedCategoryId: number | null = null;
  searchTerm: string = '';
  cartItems: CartItem[] = [];
  total: number = 0;
  tax: number = 0;
  grandTotal: number = 0;

  // Nuevos estados para toppings y cantidad
  selectedProduct: any = null;
  selectedQty: number = 1;
  selectedToppings: ExtraItem[] = [];

  constructor(
    private dbService: DatabaseService,
    public cartService: CartService,
    public themeService: ThemeService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) { }

  async ngOnInit() {
    await this.loadData();
    
    // Escuchar cambios en el carrito
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.refreshTotals();
    });

    // Cargar IVA guardado
    const ivaConfig = await this.dbService.query("SELECT value FROM config WHERE key = 'iva'");
    if (ivaConfig.values?.length) {
      const ivaValue = parseFloat(ivaConfig.values[0].value);
      this.cartService.setIva(ivaValue);
      this.refreshTotals();
    }
  }

  refreshTotals() {
    this.total = this.cartService.getTotal();
    this.tax = this.cartService.getTax();
    this.grandTotal = this.cartService.getGrandTotal();
  }

  async loadData() {
    const catResult = await this.dbService.query('SELECT * FROM categories');
    this.categories = catResult.values || [];

    const prodResult = await this.dbService.query('SELECT * FROM products WHERE is_active = 1');
    this.products = prodResult.values || [];

    const toppingResult = await this.dbService.query('SELECT * FROM toppings');
    this.toppings = toppingResult.values || [];
    
    this.applyFilters();
  }

  filterByCategory(catId: number | null) {
    this.selectedCategoryId = catId;
    this.applyFilters();
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(p => {
      const matchesCat = this.selectedCategoryId ? p.cat_id === this.selectedCategoryId : true;
      const matchesSearch = p.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }

  selectProduct(product: any) {
    this.selectedProduct = product;
    this.selectedQty = 1;
    this.selectedToppings = [];
  }

  cancelSelection() {
    this.selectedProduct = null;
  }

  confirmAddToCart() {
    if (!this.selectedProduct) return;
    this.cartService.addToCart(this.selectedProduct, this.selectedToppings, this.selectedQty);
    this.selectedProduct = null;
  }

  toggleTopping(topping: ExtraItem) {
    const index = this.selectedToppings.findIndex(t => t.name === topping.name);
    if (index > -1) {
      this.selectedToppings.splice(index, 1);
    } else {
      this.selectedToppings.push(topping);
    }
  }

  isToppingSelected(topping: ExtraItem): boolean {
    return this.selectedToppings.some(t => t.name === topping.name);
  }

  incrementQty() {
    this.selectedQty++;
  }

  decrementQty() {
    if (this.selectedQty > 1) {
      this.selectedQty--;
    }
  }

  getSelectedSubtotal(): number {
    if (!this.selectedProduct) return 0;
    const extrasPrice = this.selectedToppings.reduce((acc, t) => acc + t.price, 0);
    return (this.selectedProduct.price + extrasPrice) * this.selectedQty;
  }

  async checkout() {
    if (this.cartItems.length === 0) return;

    const alert = await this.alertCtrl.create({
      header: 'Método de Pago 💳',
      message: `Total a cobrar: ${this.grandTotal.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`,
      inputs: [
        { type: 'radio', label: 'Efectivo 💵', value: 'Efectivo', checked: true },
        { type: 'radio', label: 'Transferencia 📱', value: 'Transferencia' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar Venta ✨',
          handler: async (method) => {
            await this.processOrder(method);
          }
        }
      ]
    });
    await alert.present();
  }

  async processOrder(method: string) {
    const date = new Date().toISOString();
    const result = await this.dbService.run(
      'INSERT INTO orders (date, total, tax, payment_method, status) VALUES (?, ?, ?, ?, ?)',
      [date, this.grandTotal, this.tax, method, 'Completado']
    );

    const orderId = result.changes?.lastId;
    if (orderId) {
      for (const item of this.cartItems) {
        const extrasText = item.extras.map(e => e.name).join(', ');
        await this.dbService.run(
          'INSERT INTO order_items (order_id, product_id, qty, price, subtotal, extras_text) VALUES (?, ?, ?, ?, ?, ?)',
          [orderId, item.product_id, item.qty, item.price, item.subtotal, extrasText]
        );

        // Actualizar Stock
        const prod = this.products.find(p => p.id === item.product_id);
        if (prod) {
          const newStock = prod.stock - item.qty;
          await this.dbService.run('UPDATE products SET stock = ? WHERE id = ?', [newStock, prod.id]);
        }
      }
    }

    this.cartService.clearCart();
    
    const successAlert = await this.alertCtrl.create({
      header: '¡Venta Exitosa! 🍩',
      message: 'El registro se ha guardado en la cartera.',
      buttons: ['OK']
    });
    await successAlert.present();
    await this.loadData();
  }

  async showConfig() {
    const modal = await this.modalCtrl.create({
      component: ModalConfigComponent,
      breakpoints: [0, 0.7, 1],
      initialBreakpoint: 0.7,
      handle: true
    });
    return await modal.present();
  }
}
