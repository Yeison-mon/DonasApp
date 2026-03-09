import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database';
import { CartService, CartItem, ExtraItem } from '../../services/cart';
import { ThemeService } from '../../services/theme';
import { AlertController } from '@ionic/angular';

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

  constructor(
    private dbService: DatabaseService,
    public cartService: CartService,
    public themeService: ThemeService,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    await this.loadData();
    
    // Escuchar cambios en el carrito
    this.cartService.cartItems$.subscribe(() => {
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

  async addToCartWithExtras(product: any) {
    if (this.toppings.length === 0) {
      this.cartService.addToCart(product);
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Añadir Extras ✨',
      message: `Elige toppings para: ${product.name}`,
      inputs: this.toppings.map(e => ({
        type: 'checkbox',
        label: `${e.name} (+${e.price})`,
        value: e,
        name: e.name
      })),
      buttons: [
        { text: 'Sin extras', handler: () => this.cartService.addToCart(product) },
        { 
          text: 'Añadir', 
          handler: (extras: ExtraItem[]) => {
            this.cartService.addToCart(product, extras);
          }
        }
      ]
    });
    await alert.present();
  }

  async checkout() {
    if (this.cartItems.length === 0) return;
    
    const date = new Date().toISOString();
    const result = await this.dbService.run(
      'INSERT INTO orders (date, total, tax, payment_method, status) VALUES (?, ?, ?, ?, ?)',
      [date, this.grandTotal, this.tax, 'Efectivo', 'Completado']
    );

    const orderId = result.changes?.lastId;
    if (orderId) {
      for (const item of this.cartItems) {
        const extrasText = item.extras.map(e => e.name).join(', ');
        await this.dbService.run(
          'INSERT INTO order_items (order_id, product_id, qty, price, subtotal, extras_text) VALUES (?, ?, ?, ?, ?, ?)',
          [orderId, item.product_id, item.qty, item.price, item.subtotal, extrasText]
        );
      }
    }

    this.cartService.clearCart();
    const successAlert = await this.alertCtrl.create({
      header: '¡Venta Exitosa! 🍩',
      message: 'Gracias por tu compra.',
      buttons: ['OK']
    });
    await successAlert.present();
    await this.loadData();
  }

  async showConfig() {
    const alert = await this.alertCtrl.create({
      header: 'Configuración ⚙️',
      inputs: [
        {
          name: 'iva',
          type: 'number',
          placeholder: 'IVA %',
          value: this.cartService.getIvaRate()
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            const newIva = parseFloat(data.iva);
            await this.dbService.run("UPDATE config SET value = ? WHERE key = 'iva'", [newIva]);
            this.cartService.setIva(newIva);
            this.refreshTotals();
          }
        }
      ]
    });
    await alert.present();
  }
}
