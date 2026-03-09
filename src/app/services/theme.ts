import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private darkMode = false;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    // Verificar preferencia guardada
    const saved = localStorage.getItem('dark-mode');
    if (saved) {
      this.darkMode = saved === 'true';
    } else {
      // O preferencia del sistema
      this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.updateTheme();
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('dark-mode', this.darkMode.toString());
    this.updateTheme();
  }

  isDarkMode() {
    return this.darkMode;
  }

  private updateTheme() {
    if (this.darkMode) {
      this.renderer.addClass(document.body, 'dark');
    } else {
      this.renderer.removeClass(document.body, 'dark');
    }
  }
}
