# Sistema de Gestión para Seguros ADVISERS (León, Nicaragua) - Node.js Backend

**Autores del Proyecto:**
- Jorvin Leonel Arteaga Villalobos
- Francisco Leonardo Bravo Franco
- Joshua Fernando Salazar Blanco

El backend del sistema está codificado en **Node.js con Express y MySQL (InnoDB)**, permitiendo iniciar el servidor directamente mediante el comando:
```bash
node server.js
```

---

## 🚀 Cómo Iniciar el Proyecto con Node.js

### 1. Iniciar MySQL
- Abre **XAMPP Control Panel** e inicia el servicio **MySQL** (presionando `Start`).
- *(Si es la primera vez, puedes importar `base de datos Seguros ADVISERS.sql` en phpMyAdmin, o dejar que el servidor `server.js` sincronice las tablas automáticamente).*

### 2. Instalar dependencias (Solo la primera vez si no tienes `node_modules`)
Abre tu terminal en la carpeta del proyecto y ejecuta:
```bash
npm install
```

### 3. Iniciar el Servidor
Ejecuta en tu terminal:
```bash
node server.js
```
o también:
```bash
npm start
```

### 4. Abrir en el Navegador
Abre tu navegador (Chrome, Edge, etc.) y entra a:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📋 Matriz de Requisitos Implementados

| Requisito | Descripción | Implementación en Node.js |
| :--- | :--- | :--- |
| **RF-01 (1.1 / 3.4)** | Cotizador Vehicular Paramétrico | Fórmula $P_t = P_b \cdot (1 + \alpha) - \delta + \text{IVA}(15\%)$ en `/api/cotizaciones` (`server.js`). |
| **RF-02 (1.2 / 3.2)** | Consulta de saldos y cuotas en tiempo real | Búsqueda por cédula o póliza con semáforo dinámico (*Al día*, *Por vencer*, *Vencido*) en `/api/polizas`. |
| **RF-03 (1.3 / 3.3)** | Subida segura de váuchers | Middleware `multer` con validación estricta (JPG, PNG, PDF), límite de 5 MB y bloqueo de ejecutables en `/api/pagos`. |
| **RF-04 (1.4 / 2.2)** | Panel administrativo CRUD | Gestión completa de clientes, pólizas, aseguradoras y validación administrativa de pagos. |
| **RNF-01 / RF-01 (3.1)** | Seguridad, Bcrypt y mitigación de fuerza bruta | Hashing de claves con `bcryptjs`, sesiones activas y **bloqueo tras $N=3$ intentos fallidos** en `/api/auth`. |
| **RNF-02 (2.2)** | Diseño adaptativo (responsive) | CSS personalizado en `public/css/style.css` (360px a 1920px) y respuesta menor a 3 segundos. |
| **RNF-03 (2.3)** | Control de acceso basado en roles (RBAC) | Perfiles: **Administrador**, **Agente de Seguros**, **Gerente General** y **Cliente**. |
| **RNF-04 (2.4)** | Entorno VS Code y POO (Node.js) | Backend modular en Node.js / Express con `.vscode/settings.json`. |
| **RNF-05 (2.4.2)** | Persistencia e Integridad Referencial MySQL | Tablas relacionales con llaves primarias (PK), foráneas (FK) y restricciones de integridad. |
| **RF-02 (3.2)** | Registro estructurado de clientes | Verificación de unicidad de cédula nicaragüense (evita duplicados) en `/api/clientes`. |
| **RF-03 (3.3)** | Contratos con aseguradoras y PDF adjuntos | Vinculación Cliente-Póliza-Aseguradora y subida/indexación de contratos en `uploads/contratos/`. |
| **RF-05 (3.5)** | Expediente de siniestros | Generador de Folio Único (`REC-2026-XXXX`) y **validación automática de cuotas al día** antes de admitir el reclamo. |
| **RF-06 (3.6)** | Liquidación mensual de comisiones | Fórmula de sumatoria $C_{total} = \sum (P_i \cdot \eta_i)$ y desglose por asesor en `/api/comisiones`. |

---

## 🔑 Credenciales de Acceso Demo

| Rol | Correo | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@advisers.com.ni` | `admin123` |
| **Agente (Jorvin Arteaga)** | `jorvin.arteaga@advisers.com.ni` | `agente123` |
| **Agente (Francisco Bravo)** | `francisco.bravo@advisers.com.ni` | `agente123` |
| **Gerente (Joshua Salazar)** | `gerencia@advisers.com.ni` | `gerente123` |
| **Cliente (Carlos Mendoza)** | `carlos.mendoza@gmail.com` | `cliente123` |

> En la barra superior de la página también puedes hacer clic en los botones de **Perfil Demo** para alternar instantáneamente de rol durante la presentación.
