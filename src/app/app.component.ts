import { Component } from '@angular/core';
import { DatabaseService } from './services/database';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private dbService: DatabaseService
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    // La inicialización ahora ocurre en el constructor del servicio
    // o mediante este llamado explícito si se desea esperar.
    await this.dbService.initializeDatabase();
  }
}
