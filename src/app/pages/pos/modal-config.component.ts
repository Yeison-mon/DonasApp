import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DatabaseService } from '../../services/database';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-modal-config',
  standalone: false,
  template: `
    <div class="p-8 bg-white dark:bg-slate-900 h-full flex flex-col">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-black text-slate-800 dark:text-white">Configuración</h2>
        <button (click)="close()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <ion-icon name="close-outline" size="large"></ion-icon>
        </button>
      </div>

      <div class="space-y-8 flex-grow">
        <!-- IVA Section -->
        <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 text-pink-500 rounded-xl flex items-center justify-center mr-3">
              <ion-icon name="calculator-outline"></ion-icon>
            </div>
            <div>
              <h3 class="font-bold text-slate-800 dark:text-white">Impuestos (IVA)</h3>
              <p class="text-xs text-slate-400">Porcentaje aplicado a cada venta</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <input 
              type="number" 
              [(ngModel)]="iva" 
              class="flex-grow bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl p-4 text-xl font-black text-pink-500 outline-none focus:ring-2 ring-pink-500/20 transition-all"
            >
            <span class="text-2xl font-black text-slate-300">%</span>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-900/30">
          <h3 class="font-bold text-red-600 dark:text-red-400 mb-4 flex items-center">
            <ion-icon name="alert-circle-outline" class="mr-2"></ion-icon>
            Zona de Peligro
          </h3>
          <button (click)="resetApp()" class="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all transform active:scale-95 shadow-lg shadow-red-200 dark:shadow-none">
            Borrar Todas las Ventas
          </button>
          <p class="text-[10px] text-red-400 mt-3 text-center uppercase tracking-widest font-bold">Esta acción no se puede deshacer</p>
        </div>
      </div>

      <button 
        (click)="save()" 
        class="w-full py-6 bg-slate-800 dark:bg-pink-500 text-white rounded-[2rem] font-black text-xl shadow-2xl transition-all transform active:scale-95 flex items-center justify-center mt-auto"
      >
        <ion-icon name="save-outline" class="mr-3"></ion-icon>
        GUARDAR CAMBIOS
      </button>
    </div>
  `,
  styles: [`
    :host {
      --height: 100%;
    }
  `]
})
export class ModalConfigComponent implements OnInit {
  iva: number = 16;

  constructor(
    private modalCtrl: ModalController,
    private dbService: DatabaseService,
    private cartService: CartService
  ) {}

  async ngOnInit() {
    this.iva = this.cartService.getIvaRate();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async save() {
    await this.dbService.run("UPDATE config SET value = ? WHERE key = 'iva'", [this.iva]);
    this.cartService.setIva(this.iva);
    this.close();
  }

  async resetApp() {
    if (confirm('¿Estás seguro de que quieres borrar TODO el historial de ventas?')) {
      await this.dbService.set('orders', []);
      alert('Historial borrado correctamente.');
      this.close();
    }
  }
}
