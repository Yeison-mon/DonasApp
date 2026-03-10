import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
  standalone: false
})
export class WalletPage implements OnInit {
  totalIncome: number = 0;
  incomeByMethod: { [key: string]: number } = { 'Efectivo': 0, 'Transferencia': 0 };
  bestSellers: any[] = [];
  recentOrders: any[] = [];

  constructor(private dbService: DatabaseService) { }

  async ngOnInit() {
    await this.loadStats();
  }

  async loadStats() {
    // Ingresos totales
    const incomeResult = await this.dbService.query('SELECT SUM(total) as total FROM orders');
    this.totalIncome = incomeResult.values?.[0]?.total || 0;

    // Reiniciar métodos
    this.incomeByMethod = { 'Efectivo': 0, 'Transferencia': 0 };
    
    // Ingresos por método de pago
    const methodResult = await this.dbService.query('SELECT payment_method, SUM(total) as subtotal FROM orders GROUP BY payment_method');
    if (methodResult.values) {
      methodResult.values.forEach((row: any) => {
        this.incomeByMethod[row.payment_method] = row.subtotal;
      });
    }

    // Productos más vendidos
    const bestSellersResult = await this.dbService.query(`
      SELECT p.name, SUM(oi.qty) as total_qty 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      GROUP BY oi.product_id 
      ORDER BY total_qty DESC 
      LIMIT 5
    `);
    this.bestSellers = bestSellersResult.values || [];

    // Órdenes recientes
    const ordersResult = await this.dbService.query('SELECT * FROM orders ORDER BY id DESC');
    this.recentOrders = (ordersResult.values || []).slice(0, 10);
  }
}
