import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database';
import { PhotoService } from '../../services/photo';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  standalone: false
})
export class InventoryPage implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  toppings: any[] = [];
  activeSegment: string = 'products';
  
  newProduct = {
    name: '', price: 0, stock: 0, cat_id: 1, image_url: ''
  };

  newCategory = {
    name: '', color_code: '#ffb7c5'
  };

  newTopping = {
    name: '', price: 0
  };

  constructor(
    private dbService: DatabaseService,
    private photoService: PhotoService,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    await this.loadInventory();
  }

  segmentChanged(event: any) {
    this.activeSegment = event.detail.value;
  }

  async loadInventory() {
    const prodResult = await this.dbService.query('SELECT p.*, c.name as cat_name FROM products p JOIN categories c ON p.cat_id = c.id');
    this.products = prodResult.values || [];

    const catResult = await this.dbService.query('SELECT * FROM categories');
    this.categories = catResult.values || [];

    const toppingResult = await this.dbService.query('SELECT * FROM toppings');
    this.toppings = toppingResult.values || [];
  }

  async addCategory() {
    if (!this.newCategory.name) return;
    await this.dbService.run('INSERT INTO categories (name, color_code) VALUES (?, ?)', [this.newCategory.name, this.newCategory.color_code]);
    this.newCategory.name = '';
    await this.loadInventory();
  }

  async addTopping() {
    if (!this.newTopping.name || this.newTopping.price < 0) return;
    await this.dbService.run('INSERT INTO toppings (name, price) VALUES (?, ?)', [this.newTopping.name, this.newTopping.price]);
    this.newTopping = { name: '', price: 0 };
    await this.loadInventory();
  }

  async addProduct() {
    if (!this.newProduct.name || this.newProduct.price <= 0) return;
    await this.dbService.run('INSERT INTO products (name, price, stock, cat_id, image_url) VALUES (?, ?, ?, ?, ?)', 
      [this.newProduct.name, this.newProduct.price, this.newProduct.stock, this.newProduct.cat_id, this.newProduct.image_url]);
    this.newProduct = { name: '', price: 0, stock: 0, cat_id: 1, image_url: '' };
    await this.loadInventory();
  }

  async takeProductPhoto() {
    try {
      const photo = await this.photoService.takePhoto();
      this.newProduct.image_url = photo;
    } catch (e) {
      console.log('Cámara cancelada o falló');
    }
  }

  async updateStock(id: number, currentStock: number, delta: number) {
    const newStock = currentStock + delta;
    if (newStock < 0) return;
    await this.dbService.run('UPDATE products SET stock = ? WHERE id = ?', [newStock, id]);
    await this.loadInventory();
  }

  async toggleProductStatus(id: number, currentStatus: number) {
    const newStatus = currentStatus === 1 ? 0 : 1;
    await this.dbService.run('UPDATE products SET is_active = ? WHERE id = ?', [newStatus, id]);
    await this.loadInventory();
  }

  async deleteProduct(id: number) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar producto?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar', 
          role: 'destructive',
          handler: async () => {
            await this.dbService.run('DELETE FROM products WHERE id = ?', [id]);
            await this.loadInventory();
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteTopping(id: number) {
    await this.dbService.run('DELETE FROM toppings WHERE id = ?', [id]);
    await this.loadInventory();
  }
}
