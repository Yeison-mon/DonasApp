Genera una arquitectura robusta para 'DonasApp' en Ionic/Angular siguiendo estos requisitos técnicos:

1. DATABASE LAYER: Crea un 'DatabaseService' que inicialice SQLite con esquemas para:
   - categories (id, name, color_code)
   - products (id, cat_id, name, price, stock, image_url, is_active)
   - orders (id, date, total, payment_method, status)
   - order_items (id, order_id, product_id, qty, subtotal)

2. CORE LOGIC:
   - Un 'CartService' con RxJS (BehaviorSubject) para manejar el estado del carrito en tiempo real.
   - Un 'PhotoService' que use @capacitor/camera para capturar imágenes y @capacitor/filesystem para guardarlas localmente.

3. UI/UX (KFC STYLE):
   - Pantalla 'POS': Grid de productos con filtros por categoría, buscador y un panel lateral de 'Ticket' que calcule IVA y totales.
   - Pantalla 'Inventory': Tabla con edición rápida de stock y carga de fotos.
   - Pantalla 'Cartera': Dashboard con el total de ingresos por método de pago (Efectivo/Transferencia) y reporte de productos más vendidos.

4. ESTILO: Usa CSS moderno con variables para un tema 'Donut Delight' (Rosados, Cremas y Cafés). Incluye comentarios breves en español en cada cambio de lógica."
