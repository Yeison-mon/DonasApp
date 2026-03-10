# 🍩 DonasApp - Punto de Venta Kawaii

¡Bienvenido a **DonasApp**! Una aplicación robusta de Punto de Venta (POS) e Inventario diseñada específicamente para tiendas de donas, con una interfaz inspirada en un estilo "KFC/Donut Delight" (colores rosados, cremas y cafés) y una experiencia de usuario fluida.

## ✨ Características Principales

### 1. 🛒 Punto de Venta (POS)
- **Grid de Productos:** Visualización clara de donas y bebidas con filtros por categoría.
- **Buscador Inteligente:** Encuentra productos rápidamente por nombre.
- **Carrito en Tiempo Real:** Gestión de pedidos con RxJS, permitiendo agregar extras (chispas, nuez, etc.) y calcular IVA y totales automáticamente.
- **Múltiples Métodos de Pago:** Soporte para Efectivo y Transferencia.

### 2. 📦 Gestión de Inventario
- **Control de Stock:** Edición rápida de existencias directamente desde la tabla.
- **Carga de Productos:** Formulario para agregar nuevos productos con fotos.
- **Cámara Integrada:** Uso de `@capacitor/camera` para capturar fotos de los productos en tiempo real.
- **Gestión de Categorías y Extras:** Personaliza las categorías de donas y los complementos disponibles.

### 3. 💰 Dashboard de Cartera (Wallet)
- **Reporte de Ingresos:** Visualización del total acumulado por método de pago.
- **Análisis de Ventas:** Identifica los productos más vendidos para optimizar tu stock.

### 4. 🎨 Diseño "Donut Delight"
- Interfaz moderna con CSS personalizado y variables temáticas.
- Soporte completo para **Modo Oscuro** con una paleta de colores suave y legible.
- Componentes visuales redondeados y sombreados suaves para una estética "Kawaii".

---

## 🛠️ Stack Tecnológico

- **Framework:** [Ionic Framework v8](https://ionicframework.com/) + [Angular v20](https://angular.io/)
- **Base de Datos:** [Ionic Storage](https://ionicframework.com/docs/angular/storage) (Mockeado con interfaz SQL para escalabilidad).
- **Nativo:** [Capacitor v8](https://capacitorjs.com/) (Cámara y Filesystem).
- **Estado:** RxJS con `BehaviorSubject` para el carrito y servicios reactivos.

---

## 🚀 Instrucciones de Instalación y Ejecución

Sigue estos pasos para poner en marcha la aplicación en tu entorno local:

### Requisitos Previos
- **Node.js:** Versión 18 o superior.
- **npm:** Incluido con Node.js.
- **Ionic CLI:** `npm install -g @ionic/cli`

### Pasos
1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd DonasApp
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en el navegador:**
   ```bash
   ionic serve
   ```
   La aplicación se abrirá automáticamente en `http://localhost:8100`.

4. **Ejecutar en dispositivos móviles (Opcional):**
   ```bash
   # Para Android
   ionic cap add android
   ionic cap run android
   
   # Para iOS
   ionic cap add ios
   ionic cap run ios
   ```

---

## 📂 Estructura del Proyecto

- `src/app/services/`: Lógica central (Base de Datos, Carrito, Fotos).
- `src/app/pages/`:
  - `pos/`: Interfaz de ventas y ticket.
  - `inventory/`: Gestión de productos y stock.
  - `wallet/`: Reportes financieros y estadísticas.
- `src/theme/`: Definición de colores y estilos globales (Donut Delight).

---

## 📝 Notas de Implementación

- Se implementó un `DatabaseService` que simula consultas SQL sobre `Ionic Storage`, permitiendo una transición sencilla a SQLite nativo si se requiere en el futuro.
- El `CartService` maneja de forma reactiva el estado del pedido, asegurando que el panel de 'Ticket' siempre esté sincronizado.
- El diseño utiliza variables CSS para facilitar cambios temáticos globales.

---
*Desarrollado con ❤️ para los amantes de las donas.*
