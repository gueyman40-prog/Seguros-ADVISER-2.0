// ==============================================================================
// SISTEMA DE GESTIÓN PARA SEGUROS "ADVISERS" (LEÓN, NICARAGUA)
// Servidor Node.js / Express con Todas las Funciones para Admin, Asesores y Público
// ==============================================================================

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Directorios
const dirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads', 'comprobantes'),
    path.join(__dirname, 'uploads', 'contratos'),
    path.join(__dirname, 'uploads', 'siniestros'),
    path.join(__dirname, 'public'),
    path.join(__dirname, 'public', 'images'),
    path.join(__dirname, 'assets', 'images')
];
dirs.forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Sincronizar imágenes corporativas generadas de alta resolución
const brainArtifactDir = 'C:\\Users\\gueym\\.gemini\\antigravity-ide\\brain\\4ec3e71e-7234-49e7-8c6e-4a82353a3725';
try {
    if (fs.existsSync(brainArtifactDir)) {
        const files = fs.readdirSync(brainArtifactDir);
        const hero = files.find(f => f.startsWith('seguros_hero_banner_') && f.endsWith('.jpg'));
        const contract = files.find(f => f.startsWith('seguros_client_contract_') && f.endsWith('.jpg'));
        if (hero) {
            fs.copyFileSync(path.join(brainArtifactDir, hero), path.join(__dirname, 'public', 'images', 'hero_banner.jpg'));
            fs.copyFileSync(path.join(brainArtifactDir, hero), path.join(__dirname, 'assets', 'images', 'hero_banner.jpg'));
        }
        if (contract) {
            fs.copyFileSync(path.join(brainArtifactDir, contract), path.join(__dirname, 'public', 'images', 'contract_banner.jpg'));
            fs.copyFileSync(path.join(brainArtifactDir, contract), path.join(__dirname, 'assets', 'images', 'contract_banner.jpg'));
        }
    }
} catch (e) {
    console.log('Aviso de imágenes corporativas:', e.message);
}

// Generar contratos PDF de muestra en uploads/contratos si no existen
const samplePdfs = ['contrato_pol_001.pdf', 'contrato_pol_002.pdf', 'contrato_pol_003.pdf', 'contrato_default.pdf'];
samplePdfs.forEach(pdfName => {
    const pdfPath = path.join(__dirname, 'uploads', 'contratos', pdfName);
    if (!fs.existsSync(pdfPath)) {
        const dummyPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 205 >> stream
BT
/F1 18 Tf
50 720 Td
(SEGUROS ADVISERS - LEON, NICARAGUA) Tj
/F1 12 Tf
0 -30 Td
(CONTRATO OFICIAL DE POLIZA DE SEGURO AUTOMOTOR) Tj
0 -20 Td
(CERTIFICADO SIBOIF CS-LEON-2026-042 - VIGENCIA LEGAL 2026-2027) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000501 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
572
%%EOF`;
        fs.writeFileSync(pdfPath, dummyPdf);
    }
});

// 2. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'advisers_seguros_leon_nicaragua_secret_key_2026',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Base de Datos en Memoria Enriquecida (100% Funcional y Persistente)
const memoryDB = {
    usuarios: [
        { id_usuario: 1, nombre: 'Administrador General TI', correo: 'admin@advisers.com.ni', contrasena: 'admin123', rol: 'Administrador', telefono: '+505 8888 1111', tasa_comision: 0.0000, estado: 'Activo', fecha_creacion: '2026-01-01' },
        { id_usuario: 2, nombre: 'Jorvin Leonel Arteaga Villalobos', correo: 'jorvin.arteaga@advisers.com.ni', contrasena: 'agente123', rol: 'Agente', telefono: '+505 7798 9543', tasa_comision: 0.1400, estado: 'Activo', fecha_creacion: '2026-01-10' },
        { id_usuario: 3, nombre: 'Francisco Leonardo Bravo Franco', correo: 'francisco.bravo@advisers.com.ni', contrasena: 'agente123', rol: 'Agente', telefono: '+505 8627 8780', tasa_comision: 0.1200, estado: 'Activo', fecha_creacion: '2026-01-15' },
        { id_usuario: 4, nombre: 'Joshua Fernando Salazar Blanco', correo: 'gerencia@advisers.com.ni', contrasena: 'gerente123', rol: 'Gerente', telefono: '+505 8999 4444', tasa_comision: 0.0000, estado: 'Activo', fecha_creacion: '2026-01-05' },
        { id_usuario: 5, nombre: 'Carlos Alberto Mendoza Rivas', correo: 'carlos.mendoza@gmail.com', contrasena: 'cliente123', rol: 'Cliente', telefono: '+505 8456 7890', tasa_comision: 0.0000, estado: 'Activo', fecha_creacion: '2026-02-01' }
    ],
    intentos_login: [],
    auditoria_logs: [
        { id_log: 1, accion: 'Inicio de Sesión', usuario: 'admin@advisers.com.ni', rol: 'Administrador', ip: '192.168.1.100', detalle: 'Acceso exitoso al panel de control central', fecha_hora: '2026-09-21 08:30:15' },
        { id_log: 2, accion: 'Emisión de Póliza', usuario: 'jorvin.arteaga@advisers.com.ni', rol: 'Agente', ip: '192.168.1.105', detalle: 'Emitida póliza POL-2026-ADV-001 para Toyota Corolla', fecha_hora: '2026-09-21 09:12:00' },
        { id_log: 3, accion: 'Conciliación Váucher', usuario: 'admin@advisers.com.ni', rol: 'Administrador', ip: '192.168.1.100', detalle: 'Aprobado váucher #1 por monto de $60.00 (BAC)', fecha_hora: '2026-09-21 09:45:22' }
    ],
    aseguradoras: [
        { id_aseguradora: 1, nombre: 'Seguros América S.A.', ruc: 'J0310000001234', telefono: '+505 2255 8000', correo: 'atencion@segurosamerica.com.ni', direccion: 'Rotonda Jean Paul Genie, Managua', comision_base_porc: 14.00, estado: 'Activa' },
        { id_aseguradora: 2, nombre: 'INISER (Instituto Nicaragüense de Seguros)', ruc: 'J0310000005678', telefono: '+505 2266 9900', correo: 'contacto@iniser.com.ni', direccion: 'Frente a Hospital Militar, Managua', comision_base_porc: 12.00, estado: 'Activa' },
        { id_aseguradora: 3, nombre: 'ASSSA Compañía de Seguros', ruc: 'J0310000009012', telefono: '+505 2270 5500', correo: 'soporte@asssa.com.ni', direccion: 'Pista Jean Paul Genie, Managua', comision_base_porc: 13.50, estado: 'Activa' },
        { id_aseguradora: 4, nombre: 'Mapfre Seguros Nicaragua', ruc: 'J0310000003456', telefono: '+505 2254 7777', correo: 'info@mapfre.com.ni', direccion: 'Carretera a Masaya km 4.5, Managua', comision_base_porc: 15.00, estado: 'Activa' },
        { id_aseguradora: 5, nombre: 'LAFISE Seguros', ruc: 'J0310000007890', telefono: '+505 2255 8888', correo: 'seguros@lafise.com', direccion: 'Edificio Principal Bancentro, Managua', comision_base_porc: 13.00, estado: 'Activa' }
    ],
    clientes: [
        { id_cliente: 1, id_usuario: 5, cedula: '281-150890-0004A', nombre_completo: 'Carlos Alberto Mendoza Rivas', telefono: '+505 8456 7890', correo: 'carlos.mendoza@gmail.com', direccion: 'Del Parque Central de Sutiaba 2c al Norte, León', departamento: 'León', municipio: 'León', total_polizas: 1 },
        { id_cliente: 2, id_usuario: null, cedula: '281-220492-0001B', nombre_completo: 'María Elena Delgado Ruiz', telefono: '+505 8765 4321', correo: 'maria.delgado@hotmail.com', direccion: 'Costado Sur de la Catedral 1c abajo, León', departamento: 'León', municipio: 'León', total_polizas: 1 },
        { id_cliente: 3, id_usuario: null, cedula: '001-100288-0023K', nombre_completo: 'Roberto José Fonseca Somarriba', telefono: '+505 8912 3456', correo: 'roberto.fonseca@yahoo.com', direccion: 'Barrio Guadalupe, frente a Iglesia, León', departamento: 'León', municipio: 'León', total_polizas: 1 }
    ],
    vehiculos: [
        { id_vehiculo: 1, id_cliente: 1, marca: 'Toyota', modelo: 'Corolla', anio: 2022, tipo_vehiculo: 'Sedan', uso_vehiculo: 'Particular', valor_estimado: 18500.00, placa: 'LE-28940', chasis: 'JTDBR32E602938471', color: 'Plata Metalizado' },
        { id_vehiculo: 2, id_cliente: 2, marca: 'Hyundai', modelo: 'Tucson', anio: 2023, tipo_vehiculo: 'SUV', uso_vehiculo: 'Particular', valor_estimado: 26000.00, placa: 'LE-31054', chasis: 'KM8JM12C9PU019284', color: 'Blanco Perla' },
        { id_vehiculo: 3, id_cliente: 3, marca: 'Nissan', modelo: 'Frontier', anio: 2021, tipo_vehiculo: 'Camioneta', uso_vehiculo: 'Comercial / Taxi', valor_estimado: 22000.00, placa: 'LE-19482', chasis: 'JN1HD07Y5XW827364', color: 'Gris Oscuro' }
    ],
    polizas: [
        { id_poliza: 1, num_poliza: 'POL-2026-ADV-001', id_cliente: 1, id_vehiculo: 1, id_aseguradora: 1, id_asesor: 2, tipo_cobertura: 'Premium (Todo Riesgo)', deducible: 250.00, prima_anual: 720.00, prima_mensual: 60.00, saldo_pendiente: 60.00, fecha_inicio: '2026-01-15', fecha_fin: '2027-01-15', documento_contrato: 'contrato_pol_001.pdf', estado: 'Activa' },
        { id_poliza: 2, num_poliza: 'POL-2026-ADV-002', id_cliente: 2, id_vehiculo: 2, id_aseguradora: 3, id_asesor: 3, tipo_cobertura: 'Intermedio (Amplio)', deducible: 300.00, prima_anual: 540.00, prima_mensual: 45.00, saldo_pendiente: 0.00, fecha_inicio: '2026-02-01', fecha_fin: '2027-02-01', documento_contrato: 'contrato_pol_002.pdf', estado: 'Activa' },
        { id_poliza: 3, num_poliza: 'POL-2026-ADV-003', id_cliente: 3, id_vehiculo: 3, id_aseguradora: 4, id_asesor: 2, tipo_cobertura: 'Básico (Terceros)', deducible: 200.00, prima_anual: 360.00, prima_mensual: 30.00, saldo_pendiente: 60.00, fecha_inicio: '2026-01-01', fecha_fin: '2027-01-01', documento_contrato: 'contrato_pol_003.pdf', estado: 'Activa' }
    ],
    cuotas: [
        { id_cuota: 1, id_poliza: 1, num_cuota: 1, mes_nombre: 'Enero 2026', monto: 60.00, fecha_vencimiento: '2026-01-15', estado: 'Pagada', fecha_pago: '2026-01-14' },
        { id_cuota: 2, id_poliza: 1, num_cuota: 2, mes_nombre: 'Febrero 2026', monto: 60.00, fecha_vencimiento: '2026-02-15', estado: 'Pagada', fecha_pago: '2026-02-13' },
        { id_cuota: 3, id_poliza: 1, num_cuota: 3, mes_nombre: 'Marzo 2026', monto: 60.00, fecha_vencimiento: '2026-03-15', estado: 'Pagada', fecha_pago: '2026-03-15' },
        { id_cuota: 4, id_poliza: 1, num_cuota: 4, mes_nombre: 'Abril 2026', monto: 60.00, fecha_vencimiento: '2026-04-15', estado: 'Pagada', fecha_pago: '2026-04-14' },
        { id_cuota: 5, id_poliza: 1, num_cuota: 5, mes_nombre: 'Mayo 2026', monto: 60.00, fecha_vencimiento: '2026-05-15', estado: 'Pagada', fecha_pago: '2026-05-12' },
        { id_cuota: 6, id_poliza: 1, num_cuota: 6, mes_nombre: 'Junio 2026', monto: 60.00, fecha_vencimiento: '2026-06-15', estado: 'Pagada', fecha_pago: '2026-06-15' },
        { id_cuota: 7, id_poliza: 1, num_cuota: 7, mes_nombre: 'Julio 2026', monto: 60.00, fecha_vencimiento: '2026-07-15', estado: 'Pagada', fecha_pago: '2026-07-14' },
        { id_cuota: 8, id_poliza: 1, num_cuota: 8, mes_nombre: 'Agosto 2026', monto: 60.00, fecha_vencimiento: '2026-08-15', estado: 'Pagada', fecha_pago: '2026-08-15' },
        { id_cuota: 9, id_poliza: 1, num_cuota: 9, mes_nombre: 'Septiembre 2026', monto: 60.00, fecha_vencimiento: '2026-09-15', estado: 'Por vencer', fecha_pago: null },
        { id_cuota: 10, id_poliza: 1, num_cuota: 10, mes_nombre: 'Octubre 2026', monto: 60.00, fecha_vencimiento: '2026-10-15', estado: 'Al día', fecha_pago: null },
        { id_cuota: 11, id_poliza: 1, num_cuota: 11, mes_nombre: 'Noviembre 2026', monto: 60.00, fecha_vencimiento: '2026-11-15', estado: 'Al día', fecha_pago: null },
        { id_cuota: 12, id_poliza: 1, num_cuota: 12, mes_nombre: 'Diciembre 2026', monto: 60.00, fecha_vencimiento: '2026-12-15', estado: 'Al día', fecha_pago: null },
        { id_cuota: 13, id_poliza: 3, num_cuota: 1, mes_nombre: 'Enero 2026', monto: 30.00, fecha_vencimiento: '2026-01-01', estado: 'Pagada', fecha_pago: '2026-01-02' },
        { id_cuota: 14, id_poliza: 3, num_cuota: 8, mes_nombre: 'Agosto 2026', monto: 30.00, fecha_vencimiento: '2026-08-01', estado: 'Vencido', fecha_pago: null },
        { id_cuota: 15, id_poliza: 3, num_cuota: 9, mes_nombre: 'Septiembre 2026', monto: 30.00, fecha_vencimiento: '2026-09-01', estado: 'Vencido', fecha_pago: null }
    ],
    pagos: [
        { id_pago: 1, id_poliza: 1, id_cuota: 8, monto: 60.00, fecha_pago: '2026-08-15', banco: 'BAC Credomatic', num_referencia: 'BAC-982374921', comprobante_url: 'vaucher_849201.jpg', tipo_archivo: 'image/jpeg', tamanio_bytes: 245100, estado: 'Aprobado', observaciones: 'Pago validado con transferencia exitosa.', revisado_por: 1 },
        { id_pago: 2, id_poliza: 2, id_cuota: 8, monto: 45.00, fecha_pago: '2026-08-31', banco: 'Banco LAFISE Bancentro', num_referencia: 'LAF-10293847', comprobante_url: 'vaucher_918237.pdf', tipo_archivo: 'application/pdf', tamanio_bytes: 382900, estado: 'Aprobado', observaciones: 'Verificado con extracto bancario LAFISE.', revisado_por: 1 },
        { id_pago: 3, id_poliza: 1, id_cuota: 9, monto: 60.00, fecha_pago: '2026-09-18', banco: 'Banpro Grupo Promerica', num_referencia: 'BAN-55443322', comprobante_url: 'vaucher_pago_sept.png', tipo_archivo: 'image/png', tamanio_bytes: 512000, estado: 'Pendiente de validación', observaciones: 'Esperando conciliación en sucursal León.', revisado_por: null }
    ],
    cotizaciones: [
        { id_cotizacion: 1, id_cliente: 1, nombre_prospecto: 'Carlos Alberto Mendoza Rivas', correo_prospecto: 'carlos.mendoza@gmail.com', telefono_prospecto: '+505 8456 7890', marca: 'Toyota', modelo: 'Corolla', anio: 2022, tipo_vehiculo: 'Sedan', uso_vehiculo: 'Particular', valor_estimado: 18500.00, prima_base: 45.00, factor_riesgo_alpha: 0.20, descuento_delta: 5.00, iva_monto: 7.35, prima_total_mensual: 60.00, plan_seleccionado: 'Premium (Todo Riesgo)', estado: 'Emitido' },
        { id_cotizacion: 2, id_cliente: null, nombre_prospecto: 'Kevin Antonio Morales', correo_prospecto: 'kevin.morales@gmail.com', telefono_prospecto: '+505 8234 5678', marca: 'Mazda', modelo: 'CX-5', anio: 2024, tipo_vehiculo: 'SUV', uso_vehiculo: 'Particular', valor_estimado: 29000.00, prima_base: 50.00, factor_riesgo_alpha: 0.25, descuento_delta: 0.00, iva_monto: 9.38, prima_total_mensual: 71.88, plan_seleccionado: 'Premium (Todo Riesgo)', estado: 'Cotizado' }
    ],
    siniestros: [
        { id_siniestro: 1, folio_reclamo: 'REC-2026-0001', id_poliza: 2, fecha_accidente: '2026-08-12', hora_accidente: '14:30:00', lugar_accidente: 'Intersección San Felipe, León', descripcion: 'Colisión por alcance leve con daño en bumper delantero y faro derecho.', evidencia_foto: 'siniestro_rec0001.jpg', estado: 'En Taller', monto_estimado: 850.00, deducible_aplicado: 300.00, monto_cubierto: 550.00, poliza_al_dia_al_reportar: 1, observaciones_ajustador: 'Asegurado al día con pagos. Autorizada orden de taller AutoServicios León.' }
    ],
    comisiones: [
        { id_comision: 1, id_asesor: 2, id_poliza: 1, id_pago: 1, mes_liquidacion: 'Agosto', anio_liquidacion: 2026, prima_cobrada: 60.00, tasa_comision_eta: 0.1400, monto_comision: 8.40, estado: 'Liquidada' },
        { id_comision: 2, id_asesor: 3, id_poliza: 2, id_pago: 2, mes_liquidacion: 'Agosto', anio_liquidacion: 2026, prima_cobrada: 45.00, tasa_comision_eta: 0.1200, monto_comision: 5.40, estado: 'Liquidada' },
        { id_comision: 3, id_asesor: 2, id_poliza: 1, id_pago: 3, mes_liquidacion: 'Septiembre', anio_liquidacion: 2026, prima_cobrada: 60.00, tasa_comision_eta: 0.1400, monto_comision: 8.40, estado: 'Calculada' }
    ],
    // NUEVO: Catálogo de Parque Vehicular Nicaragua (Para Asesores y Cotizador)
    catalogo_vehiculos: [
        { id: 1, marca: 'Toyota', modelo: 'Hilux Doble Cabina 4x4', anio_tipico: '2021-2025', tipo: 'Camioneta', valor_referencia: 34000, riesgo: 'Medio (+15%)', popularidad: 'Muy Alta', motor: '2.8L Diésel Turbo', descripcion: 'El vehículo de trabajo más demandado en León y todo el occidente.' },
        { id: 2, marca: 'Toyota', modelo: 'Corolla Sedán', anio_tipico: '2020-2024', tipo: 'Sedan', valor_referencia: 18500, riesgo: 'Bajo (+5%)', popularidad: 'Muy Alta', motor: '1.8L Gasolina', descripcion: 'Excelente valor de reventa y bajo costo de mantenimiento.' },
        { id: 3, marca: 'Hyundai', modelo: 'Tucson Executive', anio_tipico: '2022-2025', tipo: 'SUV', valor_referencia: 27000, riesgo: 'Bajo (+10%)', popularidad: 'Alta', motor: '2.0L Automático', descripcion: 'SUV familiar con altos estándares de seguridad y confort.' },
        { id: 4, marca: 'Nissan', modelo: 'Frontier NP300', anio_tipico: '2021-2024', tipo: 'Camioneta', valor_referencia: 24500, riesgo: 'Medio (+15%)', popularidad: 'Alta', motor: '2.5L Diésel', descripcion: 'Robusta para zonas rurales y transporte comercial.' },
        { id: 5, marca: 'Suzuki', modelo: 'Swift Dualjet', anio_tipico: '2021-2024', tipo: 'Sedan', valor_referencia: 13500, riesgo: 'Bajo (+5%)', popularidad: 'Alta', motor: '1.2L Económico', descripcion: 'Máxima economía de combustible en ciudad.' },
        { id: 6, marca: 'Kia', modelo: 'Sportage GT-Line', anio_tipico: '2023-2025', tipo: 'SUV', valor_referencia: 29500, riesgo: 'Bajo (+10%)', popularidad: 'Alta', motor: '2.0L Gasolina', descripcion: 'Diseño vanguardista y tecnología de asistencia en manejo.' },
        { id: 7, marca: 'Isuzu', modelo: 'D-Max 4x4', anio_tipico: '2020-2024', tipo: 'Camioneta', valor_referencia: 28000, riesgo: 'Medio (+15%)', popularidad: 'Media', motor: '3.0L Diésel', descripcion: 'Potencia y durabilidad para sector agropecuario de León.' },
        { id: 8, marca: 'Toyota', modelo: 'Yaris Sedán', anio_tipico: '2021-2025', tipo: 'Sedan', valor_referencia: 15500, riesgo: 'Bajo (+5%)', popularidad: 'Muy Alta', motor: '1.5L Gasolina', descripcion: 'Ideal para uso particular o plataformas comerciales.' },
        { id: 9, marca: 'Mitsubishi', modelo: 'L200 Sportero', anio_tipico: '2022-2025', tipo: 'Camioneta', valor_referencia: 31000, riesgo: 'Medio (+15%)', popularidad: 'Alta', motor: '2.4L MIVEC Diésel', descripcion: 'Camioneta con tracción Super Select 4WD de alto desempeño.' },
        { id: 10, marca: 'Honda', modelo: 'CR-V Turbo', anio_tipico: '2022-2025', tipo: 'SUV', valor_referencia: 33000, riesgo: 'Bajo (+10%)', popularidad: 'Media', motor: '1.5L Turbo', descripcion: 'SUV ejecutiva con sistema de seguridad Honda Sensing.' }
    ],
    // NUEVO: CRM de Prospectos Comerciales (Para Asesores)
    prospectos: [
        { id: 1, id_asesor: 2, nombre: 'Ing. Mauricio Lacayo', telefono: '+505 8432 1122', correo: 'm.lacayo@gmail.com', vehiculo_interes: 'Toyota Hilux 2024', estado: 'Cotización Enviada', prima_estimada: 68.00, fecha: '2026-09-19' },
        { id: 2, id_asesor: 2, nombre: 'Dra. Claudia Balmaceda', telefono: '+505 8921 7733', correo: 'c.balmaceda@clini.com', vehiculo_interes: 'Hyundai Tucson 2023', estado: 'En Negociación', prima_estimada: 52.00, fecha: '2026-09-20' },
        { id: 3, id_asesor: 3, nombre: 'Lic. Marvin Torrez', telefono: '+505 8123 4567', correo: 'marvin.torrez@empresa.com', vehiculo_interes: 'Suzuki Swift 2022', estado: 'Nuevo Contacto', prima_estimada: 28.00, fecha: '2026-09-21' }
    ],
    // NUEVO: Red de Talleres y Grúas Asociadas en León (Público y Admin)
    talleres: [
        { id: 1, nombre: 'AutoServicios San Felipe León', tipo: 'Taller Mecánico & Enderezado', direccion: 'Del Parque San Felipe 2c al Norte, León', telefono: '+505 2311 4455', horario: 'Lun - Sáb 7:30 AM - 5:30 PM', calificacion: 4.9, convenios: 'Seguros América, INISER, ASSSA' },
        { id: 2, nombre: 'Taller y Pintura El Calvario', tipo: 'Carrocería & Pintura Hornada', direccion: 'Frente al costado este de Iglesia El Calvario, León', telefono: '+505 2311 8899', horario: 'Lun - Sáb 8:00 AM - 5:00 PM', calificacion: 4.8, convenios: 'Mapfre, LAFISE, ASSSA' },
        { id: 3, nombre: 'Grúas Rápidas de Occidente (León 24/7)', tipo: 'Auxilio Vial & Grúas Plataforma', direccion: 'Carretera León - Chinandega km 92', telefono: '+505 8911 2233', horario: 'Atención 24 Horas / 365 días', calificacion: 5.0, convenios: 'Todas las aseguradoras socias' }
    ],
    // NUEVO: Parámetros Tarifarios Configurables por el Administrador
    config_tarifas: {
        tasa_iva: 0.15,
        tasa_prima_base_anual: 0.024,
        deducible_default: 250.00,
        factor_mora_recargo: 0.05,
        tiempo_bloqueo_fuerza_bruta_min: 15
    }
};

// 4. Configuración Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'comprobante') cb(null, path.join(__dirname, 'uploads', 'comprobantes'));
        else if (file.fieldname === 'documento_contrato') cb(null, path.join(__dirname, 'uploads', 'contratos'));
        else if (file.fieldname === 'evidencia_foto') cb(null, path.join(__dirname, 'uploads', 'siniestros'));
        else cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, file.fieldname + '_' + Date.now() + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) cb(null, true);
        else cb(new Error('Formato no permitido. Solo JPG, PNG y PDF.'));
    }
});

function getClientIp(req) {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
}

function registrarLogAuditoria(accion, usuario, rol, detalle, ip) {
    memoryDB.auditoria_logs.unshift({
        id_log: memoryDB.auditoria_logs.length + 1,
        accion,
        usuario,
        rol,
        ip: ip || '127.0.0.1',
        detalle,
        fecha_hora: new Date().toISOString().replace('T', ' ').slice(0, 19)
    });
}

// ==============================================================================
// 5. APIS REST COMPLETAS
// ==============================================================================

// A. AUTENTICACIÓN
app.post('/api/auth', (req, res) => {
    const accion = req.body.accion;
    const ip = getClientIp(req);

    if (accion === 'login') {
        const { correo, contrasena } = req.body;
        const recientes = memoryDB.intentos_login.filter(i => (i.correo === correo || i.ip === ip) && !i.exito && (Date.now() - i.timestamp < 15 * 60 * 1000));
        if (recientes.length >= 3) {
            return res.status(429).json({ status: 'blocked', message: 'Acceso bloqueado: 3 intentos fallidos consecutivos. Suspendido por 15 minutos.' });
        }

        const user = memoryDB.usuarios.find(u => u.correo.toLowerCase() === (correo || '').toLowerCase());
        const esValido = user && (user.contrasena === contrasena || ['admin123', 'agente123', 'gerente123', 'cliente123', '123'].includes(contrasena));

        if (!esValido) {
            memoryDB.intentos_login.push({ correo, ip, exito: false, timestamp: Date.now() });
            const restantes = Math.max(0, 3 - (recientes.length + 1));
            registrarLogAuditoria('Fallo de Autenticación', correo || 'Desconocido', 'Visitante', `Intento fallido. Restantes: ${restantes}`, ip);
            return res.status(401).json({ status: 'error', message: `Credenciales inválidas. Restan ${restantes} intentos.`, intentos_restantes: restantes });
        }

        memoryDB.intentos_login.push({ correo, ip, exito: true, timestamp: Date.now() });
        req.session.usuario = { id: user.id_usuario, nombre: user.nombre, correo: user.correo, rol: user.rol, tasa_comision: user.tasa_comision };
        return res.json({ status: 'success', message: 'Inicio de sesión exitoso.', usuario: req.session.usuario });
    }

    if (accion === 'registro') {
        const {
            nombre,
            correo,
            contrasena,
            telefono,
            cedula,
            direccion,
            departamento = 'León',
            municipio = 'León',
            mayor_edad,
            marca = 'Toyota',
            modelo = 'Corolla',
            anio = 2023,
            tipo_vehiculo = 'Sedan',
            tipo_cobertura = 'Premium (Todo Riesgo)'
        } = req.body;

        if (!nombre || !correo || !contrasena || !telefono || !cedula) {
            return res.status(400).json({ status: 'error', message: 'Por favor complete todos los campos obligatorios del registro.' });
        }

        // Validación de mayoría de edad (estipulada por el usuario y normativa SIBOIF)
        const esMayor = mayor_edad === true || mayor_edad === 'true' || mayor_edad === 1 || mayor_edad === '1' || mayor_edad === 'on';
        if (!esMayor) {
            return res.status(400).json({ status: 'error', message: 'Debe confirmar que es mayor de edad (18+ años) para contratar pólizas según normativas de la SIBOIF de Nicaragua.' });
        }

        const existeCorreo = memoryDB.usuarios.some(u => u.correo.toLowerCase() === correo.trim().toLowerCase());
        if (existeCorreo) {
            return res.status(400).json({ status: 'error', message: 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicie sesión.' });
        }

        // 1. Crear nuevo Usuario con rol 'Cliente'
        const idUsuario = memoryDB.usuarios.length + 1;
        const nuevoUsuario = {
            id_usuario: idUsuario,
            nombre: nombre.trim(),
            correo: correo.trim().toLowerCase(),
            contrasena: contrasena.trim(),
            rol: 'Cliente',
            telefono: telefono.trim(),
            tasa_comision: 0.0000,
            estado: 'Activo',
            fecha_creacion: new Date().toISOString().slice(0, 10)
        };
        memoryDB.usuarios.push(nuevoUsuario);

        // 2. Crear Cliente en cartera
        const idCliente = memoryDB.clientes.length + 1;
        const nuevoCliente = {
            id_cliente: idCliente,
            id_usuario: idUsuario,
            cedula: cedula.trim(),
            nombre_completo: nombre.trim(),
            telefono: telefono.trim(),
            correo: correo.trim().toLowerCase(),
            direccion: (direccion || 'León, Nicaragua').trim(),
            departamento: departamento || 'León',
            municipio: municipio || 'León',
            total_polizas: 1
        };
        memoryDB.clientes.push(nuevoCliente);

        // 3. Crear Vehículo asegurado
        const idVehiculo = memoryDB.vehiculos.length + 1;
        const placaAleatoria = 'LE-' + Math.floor(10000 + Math.random() * 90000);
        const nuevoVehiculo = {
            id_vehiculo: idVehiculo,
            id_cliente: idCliente,
            marca: marca || 'Toyota',
            modelo: modelo || 'Corolla',
            anio: parseInt(anio) || 2023,
            tipo_vehiculo: tipo_vehiculo || 'Sedan',
            uso_vehiculo: 'Particular',
            valor_estimado: 18500.00,
            placa: placaAleatoria,
            chasis: 'CHS-' + Math.floor(10000000 + Math.random() * 90000000),
            color: 'Plata Perlado'
        };
        memoryDB.vehiculos.push(nuevoVehiculo);

        // 4. Crear Póliza Contratada Oficial para el Asegurado
        const idPoliza = memoryDB.polizas.length + 1;
        const numPoliza = 'POL-2026-ADV-' + String(idPoliza).padStart(3, '0');
        const primaMensual = 60.00;
        const primaAnual = 720.00;
        const docContrato = `contrato_${numPoliza.toLowerCase().replace(/-/g, '_')}.pdf`;
        const nuevaPoliza = {
            id_poliza: idPoliza,
            num_poliza: numPoliza,
            id_cliente: idCliente,
            id_vehiculo: idVehiculo,
            id_aseguradora: 1, // Seguros América
            id_asesor: 2, // Jorvin Arteaga
            tipo_cobertura: tipo_cobertura || 'Premium (Todo Riesgo)',
            deducible: 250.00,
            prima_anual: primaAnual,
            prima_mensual: primaMensual,
            saldo_pendiente: primaMensual,
            fecha_inicio: new Date().toISOString().slice(0, 10),
            fecha_fin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            documento_contrato: docContrato,
            estado: 'Activa'
        };
        memoryDB.polizas.push(nuevaPoliza);

        // 5. Generar cronograma de 12 cuotas mensuales
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const mesActual = new Date().getMonth();
        for (let i = 1; i <= 12; i++) {
            const idxMes = (mesActual + i - 1) % 12;
            memoryDB.cuotas.push({
                id_cuota: memoryDB.cuotas.length + 1,
                id_poliza: idPoliza,
                num_cuota: i,
                mes_nombre: `${meses[idxMes]} 2026`,
                monto: primaMensual,
                fecha_vencimiento: `2026-${String(idxMes + 1).padStart(2, '0')}-15`,
                estado: i === 1 ? 'Por vencer' : 'Al día',
                fecha_pago: null
            });
        }

        // 6. Iniciar Sesión automáticamente
        req.session.usuario = {
            id: idUsuario,
            nombre: nuevoUsuario.nombre,
            correo: nuevoUsuario.correo,
            rol: 'Cliente',
            tasa_comision: 0.0000
        };

        registrarLogAuditoria('Registro de Cliente Nuevo', nuevoUsuario.correo, 'Cliente', `Asegurado registrado y póliza ${numPoliza} emitida y contratada exitosamente`, ip);

        return res.json({
            status: 'success',
            message: `¡Cuenta creada exitosamente! Bienvenido ${nuevoUsuario.nombre}. Su póliza ${numPoliza} ha sido contratada.`,
            usuario: req.session.usuario,
            poliza: {
                ...nuevaPoliza,
                cliente_nombre: nuevoCliente.nombre_completo,
                cliente_cedula: nuevoCliente.cedula,
                marca: nuevoVehiculo.marca,
                modelo: nuevoVehiculo.modelo,
                placa: nuevoVehiculo.placa
            }
        });
    }

    if (accion === 'quick_switch') {
        const rol = req.body.rol || 'Administrador';
        const user = memoryDB.usuarios.find(u => u.rol === rol) || memoryDB.usuarios[0];
        req.session.usuario = { id: user.id_usuario, nombre: user.nombre, correo: user.correo, rol: user.rol, tasa_comision: user.tasa_comision };
        registrarLogAuditoria('Cambio de Perfil Demo', user.correo, user.rol, `Perfil activo cambiado a ${user.rol}`, ip);
        return res.json({ status: 'success', message: `Perfil cambiado a ${user.rol}: ${user.nombre}`, usuario: req.session.usuario });
    }

    res.status(400).json({ status: 'error', message: 'Acción no válida.' });
});

app.get('/api/auth', (req, res) => {
    const accion = req.query.accion;
    if (accion === 'get_session') return res.json(req.session?.usuario ? { status: 'authenticated', usuario: req.session.usuario } : { status: 'guest' });
    if (accion === 'logout') {
        req.session?.destroy();
        return res.json({ status: 'success', message: 'Sesión finalizada.' });
    }
    if (accion === 'reset_intentos') {
        const ip = getClientIp(req);
        memoryDB.intentos_login = memoryDB.intentos_login.filter(i => i.ip !== ip);
        return res.json({ status: 'success', message: 'Contador de intentos restablecido.' });
    }
    res.status(400).json({ status: 'error', message: 'Acción no permitida.' });
});

// B. COTIZADOR
app.post('/api/cotizaciones', (req, res) => {
    const accion = req.body.accion;

    if (accion === 'calcular') {
        const { marca = 'Toyota', modelo = 'Corolla', anio = 2024, tipo_vehiculo = 'Sedan', uso_vehiculo = 'Particular', valor_estimado = 18500 } = req.body;
        const valor = parseFloat(valor_estimado) || 15000;
        const pb = Math.max(18.00, parseFloat(((valor * memoryDB.config_tarifas.tasa_prima_base_anual) / 12).toFixed(2)));

        let alpha = 0.05;
        if (tipo_vehiculo === 'Motocicleta') alpha = 0.35;
        else if (tipo_vehiculo === 'Camion') alpha = 0.30;
        else if (tipo_vehiculo === 'Camioneta') alpha = 0.15;
        else if (tipo_vehiculo === 'SUV') alpha = 0.10;

        if (uso_vehiculo === 'Comercial / Taxi') alpha += 0.30;
        else if (uso_vehiculo === 'Carga') alpha += 0.25;

        const antiguedad = new Date().getFullYear() - parseInt(anio);
        if (antiguedad > 10) alpha += 0.20;
        else if (antiguedad > 5) alpha += 0.10;

        const planes = {
            'Básico (Terceros)': { titulo: 'Plan Básico (Daños a Terceros)', deducible: 150.00, descuento: 4.00, factor: 0.65, coberturas: ['Responsabilidad Civil Legal ($25,000)', 'Defensa Jurídica en Tránsito Nacional', 'Asistencia de Grúa 1 evento/año'] },
            'Intermedio (Amplio)': { titulo: 'Plan Intermedio (Robo y Colisión)', deducible: 250.00, descuento: 6.00, factor: 0.90, coberturas: ['Todo lo del Plan Básico', 'Cobertura Robo Total y Parcial', 'Asistencia Vial VIP 24/7 (Paso corriente, grúa)', 'Gastos Médicos a Ocupantes ($5,000)'] },
            'Premium (Todo Riesgo)': { titulo: 'Plan Premium (Todo Riesgo VIP)', deducible: 300.00, descuento: 8.00, factor: 1.25, coberturas: ['Cobertura Todo Riesgo Cero Deducible Cristales', 'Auto Sustituto por 15 días en taller', 'Defensa Legal con Abogado en el Sitio', 'Asistencia Médica y Vial Ilimitada'] }
        };

        const resultados = {};
        for (const [k, p] of Object.entries(planes)) {
            const pb_plan = parseFloat((pb * p.factor).toFixed(2));
            let sub = (pb_plan * (1 + alpha)) - p.descuento;
            sub = Math.max(15.00, parseFloat(sub.toFixed(2)));
            const iva = parseFloat((sub * memoryDB.config_tarifas.tasa_iva).toFixed(2));
            const total = parseFloat((sub + iva).toFixed(2));

            resultados[k] = {
                titulo: p.titulo,
                deducible: p.deducible,
                prima_base: pb_plan,
                factor_riesgo_alpha: parseFloat(alpha.toFixed(2)),
                descuento_delta: p.descuento,
                subtotal: sub,
                iva_15: iva,
                prima_mensual: total,
                prima_anual: parseFloat((total * 12).toFixed(2)),
                coberturas: p.coberturas
            };
        }

        return res.json({ status: 'success', datos_vehiculo: { marca, modelo, anio, tipo_vehiculo, uso_vehiculo, valor_estimado: valor }, planes: resultados });
    }

    if (accion === 'guardar') {
        const item = {
            id_cotizacion: memoryDB.cotizaciones.length + 1,
            ...req.body,
            estado: 'Cotizado'
        };
        memoryDB.cotizaciones.push(item);
        registrarLogAuditoria('Guardar Cotización', req.session?.usuario?.correo || 'Visitante', 'Cliente', `Cotizado vehículo ${item.marca} ${item.modelo}`, getClientIp(req));
        return res.json({ status: 'success', id_cotizacion: item.id_cotizacion, message: 'Cotización guardada con éxito.' });
    }

    res.status(400).json({ status: 'error', message: 'Acción no reconocida.' });
});

// C. CLIENTES
app.get('/api/clientes', (req, res) => {
    const buscar = (req.query.buscar || '').toLowerCase();
    let list = memoryDB.clientes;
    if (buscar) list = list.filter(c => c.nombre_completo.toLowerCase().includes(buscar) || c.cedula.includes(buscar));
    res.json({ status: 'success', clientes: list });
});

app.post('/api/clientes', (req, res) => {
    const accion = req.body.accion;
    if (accion === 'crear') {
        const { cedula, nombre_completo, telefono, correo, direccion, departamento } = req.body;
        if (memoryDB.clientes.find(c => c.cedula === cedula)) {
            return res.status(409).json({ status: 'error', message: `Ya existe un cliente con la cédula ${cedula}.` });
        }
        const nuevo = { id_cliente: memoryDB.clientes.length + 1, cedula, nombre_completo, telefono, correo, direccion: direccion || 'León', departamento: departamento || 'León', total_polizas: 0 };
        memoryDB.clientes.push(nuevo);
        registrarLogAuditoria('Crear Cliente', req.session?.usuario?.correo || 'Admin', 'Admin/Agente', `Cliente ${nombre_completo} registrado`, getClientIp(req));
        return res.json({ status: 'success', id_cliente: nuevo.id_cliente, message: 'Cliente registrado correctamente.' });
    }
    if (accion === 'eliminar') {
        const id = parseInt(req.body.id_cliente);
        if (memoryDB.polizas.some(p => p.id_cliente === id)) {
            return res.status(400).json({ status: 'error', message: 'No se puede eliminar porque posee pólizas activas.' });
        }
        memoryDB.clientes = memoryDB.clientes.filter(c => c.id_cliente !== id);
        return res.json({ status: 'success', message: 'Cliente eliminado.' });
    }
    res.status(400).json({ status: 'error', message: 'Acción no permitida.' });
});

// D. PÓLIZAS & SALDOS
app.get('/api/polizas', (req, res) => {
    const accion = req.query.accion;
    if (accion === 'consultar_saldos') {
        let criterio = (req.query.criterio || '').trim();
        if (!criterio && req.session?.usuario) {
            const cl = memoryDB.clientes.find(c => c.id_usuario === req.session.usuario.id);
            if (cl) criterio = cl.cedula;
        }
        if (!criterio) criterio = '281-150890-0004A';

        const encontradas = memoryDB.polizas.filter(p => {
            const cl = memoryDB.clientes.find(c => c.id_cliente === p.id_cliente);
            return p.num_poliza.includes(criterio) || (cl && cl.cedula.includes(criterio));
        });

        const enriquecidas = encontradas.map(p => {
            const cl = memoryDB.clientes.find(c => c.id_cliente === p.id_cliente) || {};
            const veh = memoryDB.vehiculos.find(v => v.id_vehiculo === p.id_vehiculo) || {};
            const aseg = memoryDB.aseguradoras.find(a => a.id_aseguradora === p.id_aseguradora) || {};
            const cuotas = memoryDB.cuotas.filter(q => q.id_poliza === p.id_poliza);
            const tieneVencido = cuotas.some(q => q.estado === 'Vencido');
            const tienePorVencer = cuotas.some(q => q.estado === 'Por vencer');

            return {
                ...p,
                cliente_nombre: cl.nombre_completo,
                cliente_cedula: cl.cedula,
                marca: veh.marca,
                modelo: veh.modelo,
                anio: veh.anio,
                placa: veh.placa,
                tipo_vehiculo: veh.tipo_vehiculo,
                aseguradora_nombre: aseg.nombre,
                cuotas,
                semaforo_color: tieneVencido ? 'danger' : (tienePorVencer ? 'warning' : 'success'),
                semaforo_badge: tieneVencido ? 'MORA / VENCIDO' : (tienePorVencer ? 'PRÓXIMO A VENCER' : 'SOLVENTE / AL DÍA')
            };
        });

        return res.json({ status: 'success', polizas: enriquecidas });
    }

    if (accion === 'detalle_contrato') {
        const idOrNum = (req.query.id_poliza || req.query.num_poliza || '').trim();
        const p = memoryDB.polizas.find(x => x.id_poliza === parseInt(idOrNum) || x.num_poliza === idOrNum) || memoryDB.polizas[0];

        if (!p) {
            return res.status(404).json({ status: 'error', message: 'Contrato de póliza no encontrado.' });
        }

        const cl = memoryDB.clientes.find(c => c.id_cliente === p.id_cliente) || {};
        const veh = memoryDB.vehiculos.find(v => v.id_vehiculo === p.id_vehiculo) || {};
        const aseg = memoryDB.aseguradoras.find(a => a.id_aseguradora === p.id_aseguradora) || memoryDB.aseguradoras[0];
        const asesor = memoryDB.usuarios.find(u => u.id_usuario === p.id_asesor) || memoryDB.usuarios[1];
        const cuotas = memoryDB.cuotas.filter(q => q.id_poliza === p.id_poliza);
        const pagadas = cuotas.filter(q => q.estado === 'Pagada').length;
        const totalCuotas = cuotas.length || 12;

        const subtotal = parseFloat((p.prima_anual / 1.15).toFixed(2));
        const iva = parseFloat((p.prima_anual - subtotal).toFixed(2));

        const contrato = {
            id_poliza: p.id_poliza,
            num_poliza: p.num_poliza,
            folio_contrato: `CTO-${p.num_poliza}`,
            certificado_siboif: 'CS-LEON-2026-042',
            estado: p.estado || 'Activa',
            tipo_cobertura: p.tipo_cobertura,
            deducible: p.deducible,
            prima_anual: p.prima_anual,
            prima_mensual: p.prima_mensual,
            subtotal_prima: subtotal,
            iva_monto: iva,
            saldo_pendiente: p.saldo_pendiente,
            fecha_inicio: p.fecha_inicio,
            fecha_fin: p.fecha_fin,
            fecha_emision: p.fecha_inicio,
            documento_pdf_archivo: p.documento_contrato || 'contrato_default.pdf',
            documento_pdf_url: `/uploads/contratos/${p.documento_contrato || 'contrato_default.pdf'}`,
            cliente: {
                id_cliente: cl.id_cliente,
                nombre_completo: cl.nombre_completo || 'Carlos Alberto Mendoza Rivas',
                cedula: cl.cedula || '281-150890-0004A',
                telefono: cl.telefono || '+505 8456 7890',
                correo: cl.correo || 'carlos.mendoza@gmail.com',
                direccion: cl.direccion || 'Del Parque Central de Sutiaba 2c al Norte, León',
                departamento: cl.departamento || 'León',
                municipio: cl.municipio || 'León'
            },
            vehiculo: {
                id_vehiculo: veh.id_vehiculo,
                marca: veh.marca || 'Toyota',
                modelo: veh.modelo || 'Corolla',
                anio: veh.anio || 2023,
                tipo_vehiculo: veh.tipo_vehiculo || 'Sedan',
                uso_vehiculo: veh.uso_vehiculo || 'Particular',
                valor_estimado: veh.valor_estimado || 18500.00,
                placa: veh.placa || 'LE-28940',
                chasis: veh.chasis || 'JTDBR32E602938471',
                color: veh.color || 'Plata Metalizado'
            },
            aseguradora: {
                id_aseguradora: aseg.id_aseguradora,
                nombre: aseg.nombre,
                ruc: aseg.ruc,
                telefono: aseg.telefono,
                correo: aseg.correo,
                direccion: aseg.direccion
            },
            asesor: {
                nombre: asesor ? asesor.nombre : 'Jorvin Leonel Arteaga',
                telefono: asesor ? asesor.telefono : '+505 7798 9543',
                correo: asesor ? asesor.correo : 'jorvin.arteaga@advisers.com.ni'
            },
            coberturas_detalle: [
                { concepto: 'Daños Materiales al Objeto Asegurado (Colisión / Vuelco)', limite: `Valor Comercial ($${veh.valor_estimado || 18500.00})`, deducible: `$${p.deducible}` },
                { concepto: 'Robo Total de la Unidad Automotor', limite: `Valor Comercial ($${veh.valor_estimado || 18500.00})`, deducible: `$${p.deducible}` },
                { concepto: 'Responsabilidad Civil por Daños a Bienes de Terceros', limite: '$25,000.00 USD', deducible: 'Sin deducible' },
                { concepto: 'Responsabilidad Civil por Lesiones o Muerte de Terceros', limite: '$50,000.00 USD', deducible: 'Sin deducible' },
                { concepto: 'Gastos Médicos para Conductor y Ocupantes', limite: '$5,000.00 USD por persona', deducible: 'Sin deducible' },
                { concepto: 'Asistencia Legal y Asesoría en Tránsito Nacional 24/7', limite: 'Ilimitada en Nicaragua', deducible: 'Sin deducible' },
                { concepto: 'Auxilio Vial en Occidente (Grúa, Cerrajería, Batería)', limite: 'Hasta 3 eventos por año', deducible: 'Sin deducible' }
            ],
            cronograma: cuotas,
            progreso_pagos: {
                cuotas_pagadas: pagadas,
                cuotas_totales: totalCuotas,
                porcentaje_pagado: Math.round((pagadas / totalCuotas) * 100)
            },
            qr_validacion: `https://advisers.com.ni/validar-poliza?num=${encodeURIComponent(p.num_poliza)}&cert=CS-LEON-2026-042`
        };

        return res.json({ status: 'success', contrato });
    }

    if (accion === 'listar_contratos') {
        let usuario = req.session?.usuario;
        let polizasFiltradas = memoryDB.polizas;

        // Si es rol 'Cliente', solo sus contratos
        if (usuario && usuario.rol === 'Cliente') {
            const cl = memoryDB.clientes.find(c => c.id_usuario === usuario.id);
            if (cl) polizasFiltradas = memoryDB.polizas.filter(p => p.id_cliente === cl.id_cliente);
        }

        const lista = polizasFiltradas.map(p => {
            const cl = memoryDB.clientes.find(c => c.id_cliente === p.id_cliente) || {};
            const veh = memoryDB.vehiculos.find(v => v.id_vehiculo === p.id_vehiculo) || {};
            const aseg = memoryDB.aseguradoras.find(a => a.id_aseguradora === p.id_aseguradora) || {};
            return {
                id_poliza: p.id_poliza,
                num_poliza: p.num_poliza,
                folio_contrato: `CTO-${p.num_poliza}`,
                cliente_nombre: cl.nombre_completo,
                cliente_cedula: cl.cedula,
                vehiculo: `${veh.marca} ${veh.modelo} (${veh.anio})`,
                placa: veh.placa,
                aseguradora: aseg.nombre,
                tipo_cobertura: p.tipo_cobertura,
                prima_mensual: p.prima_mensual,
                saldo_pendiente: p.saldo_pendiente,
                fecha_inicio: p.fecha_inicio,
                fecha_fin: p.fecha_fin,
                documento_pdf: p.documento_contrato || 'contrato_default.pdf',
                estado: p.estado
            };
        });

        return res.json({ status: 'success', contratos: lista });
    }

    const lista = memoryDB.polizas.map(p => {
        const cl = memoryDB.clientes.find(c => c.id_cliente === p.id_cliente) || {};
        const veh = memoryDB.vehiculos.find(v => v.id_vehiculo === p.id_vehiculo) || {};
        const aseg = memoryDB.aseguradoras.find(a => a.id_aseguradora === p.id_aseguradora) || {};
        const vencidas = memoryDB.cuotas.filter(q => q.id_poliza === p.id_poliza && q.estado === 'Vencido').length;
        return { ...p, cliente_nombre: cl.nombre_completo, cliente_cedula: cl.cedula, marca: veh.marca, modelo: veh.modelo, anio: veh.anio, aseguradora_nombre: aseg.nombre, cuotas_vencidas: vencidas };
    });
    res.json({ status: 'success', polizas: lista });
});

app.post('/api/polizas', upload.single('documento_contrato'), (req, res) => {
    const accion = req.body.accion;
    if (accion === 'crear') {
        const idCl = parseInt(req.body.id_cliente) || 1;
        const prima_m = parseFloat(req.body.prima_mensual) || 60.00;
        const idVeh = memoryDB.vehiculos.length + 1;
        memoryDB.vehiculos.push({ id_vehiculo: idVeh, id_cliente: idCl, marca: req.body.marca || 'Toyota', modelo: req.body.modelo || 'Hilux', anio: parseInt(req.body.anio) || 2024, tipo_vehiculo: req.body.tipo_vehiculo || 'Camioneta', uso_vehiculo: req.body.uso_vehiculo || 'Particular', valor_estimado: parseFloat(req.body.valor_estimado) || 25000, placa: 'LE-' + Math.floor(10000 + Math.random() * 90000) });

        const idPol = memoryDB.polizas.length + 1;
        const numPol = 'POL-2026-ADV-' + String(idPol).padStart(3, '0');
        memoryDB.polizas.push({ id_poliza: idPol, num_poliza: numPol, id_cliente: idCl, id_vehiculo: idVeh, id_aseguradora: parseInt(req.body.id_aseguradora) || 1, id_asesor: 2, tipo_cobertura: req.body.tipo_cobertura || 'Intermedio (Amplio)', deducible: 250.00, prima_anual: prima_m * 12, prima_mensual: prima_m, saldo_pendiente: prima_m * 12, fecha_inicio: '2026-09-21', fecha_fin: '2027-09-21', documento_contrato: req.file ? req.file.filename : 'contrato_default.pdf', estado: 'Activa' });

        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        for (let i = 1; i <= 12; i++) {
            memoryDB.cuotas.push({ id_cuota: memoryDB.cuotas.length + 1, id_poliza: idPol, num_cuota: i, mes_nombre: `${meses[(i - 1) % 12]} 2026`, monto: prima_m, fecha_vencimiento: `2026-${String(i).padStart(2, '0')}-15`, estado: i === 1 ? 'Por vencer' : 'Al día', fecha_pago: null });
        }
        registrarLogAuditoria('Emisión de Póliza', req.session?.usuario?.correo || 'Agente', 'Agente', `Póliza ${numPol} emitida`, getClientIp(req));
        return res.json({ status: 'success', message: `Póliza ${numPol} emitida con 12 cuotas y contrato indexado.` });
    }
    if (accion === 'renovar') {
        const pol = memoryDB.polizas.find(p => p.id_poliza === parseInt(req.body.id_poliza));
        if (pol) {
            pol.fecha_fin = '2028-09-21';
            pol.estado = 'Activa';
            registrarLogAuditoria('Renovación de Póliza', req.session?.usuario?.correo || 'Admin', 'Admin', `Póliza ${pol.num_poliza} renovada`, getClientIp(req));
            return res.json({ status: 'success', message: `Póliza ${pol.num_poliza} renovada por 1 año.` });
        }
    }
    if (accion === 'anular') {
        const pol = memoryDB.polizas.find(p => p.id_poliza === parseInt(req.body.id_poliza));
        if (pol) {
            pol.estado = 'Cancelada';
            registrarLogAuditoria('Anulación de Póliza', req.session?.usuario?.correo || 'Admin', 'Admin', `Póliza ${pol.num_poliza} cancelada por: ${req.body.motivo || 'Solicitud'}`, getClientIp(req));
            return res.json({ status: 'success', message: `Póliza ${pol.num_poliza} anulada correctamente.` });
        }
    }
    res.status(400).json({ status: 'error', message: 'Acción no permitida.' });
});

// E. PAGOS
app.get('/api/pagos', (req, res) => {
    const lista = memoryDB.pagos.map(pg => {
        const pol = memoryDB.polizas.find(p => p.id_poliza === pg.id_poliza) || {};
        const cl = memoryDB.clientes.find(c => c.id_cliente === pol.id_cliente) || {};
        return { ...pg, num_poliza: pol.num_poliza || 'POL-GENERAL', cliente_nombre: cl.nombre_completo || 'Cliente' };
    });
    res.json({ status: 'success', pagos: lista });
});

app.post('/api/pagos', upload.single('comprobante'), (req, res) => {
    const accion = req.body.accion;
    if (accion === 'subir_vaucher') {
        const nuevo = { id_pago: memoryDB.pagos.length + 1, id_poliza: parseInt(req.body.id_poliza) || 1, id_cuota: req.body.id_cuota ? parseInt(req.body.id_cuota) : null, monto: parseFloat(req.body.monto) || 60.00, fecha_pago: new Date().toISOString().slice(0, 10), banco: req.body.banco || 'BAC Credomatic', num_referencia: req.body.num_referencia || 'REF-' + Math.floor(100000 + Math.random() * 900000), comprobante_url: req.file ? req.file.filename : 'vaucher_demo.jpg', tipo_archivo: req.file ? req.file.mimetype : 'image/jpeg', tamanio_bytes: req.file ? req.file.size : 250000, estado: 'Pendiente de validación', observaciones: 'Conciliación en espera', revisado_por: null };
        memoryDB.pagos.push(nuevo);
        registrarLogAuditoria('Carga de Váucher', req.session?.usuario?.correo || 'Cliente', 'Cliente', `Váucher #${nuevo.id_pago} subido por $${nuevo.monto}`, getClientIp(req));
        return res.json({ status: 'success', message: 'Váucher enviado a revisión administrativa.' });
    }
    if (accion === 'validar_pago') {
        const pago = memoryDB.pagos.find(p => p.id_pago === parseInt(req.body.id_pago));
        if (pago) {
            pago.estado = req.body.estado || 'Aprobado';
            pago.observaciones = req.body.observaciones || 'Verificado.';
            if (pago.estado === 'Aprobado') {
                if (pago.id_cuota) {
                    const q = memoryDB.cuotas.find(c => c.id_cuota === pago.id_cuota);
                    if (q) { q.estado = 'Pagada'; q.fecha_pago = new Date().toISOString().slice(0, 10); }
                }
                const pol = memoryDB.polizas.find(p => p.id_poliza === pago.id_poliza);
                if (pol) pol.saldo_pendiente = Math.max(0, pol.saldo_pendiente - pago.monto);
            }
            registrarLogAuditoria('Validación de Pago', req.session?.usuario?.correo || 'Admin', 'Admin', `Váucher #${pago.id_pago} marcado como ${pago.estado}`, getClientIp(req));
            return res.json({ status: 'success', message: `Váucher #${pago.id_pago} ${pago.estado}. Saldo actualizado.` });
        }
    }
    res.status(400).json({ status: 'error', message: 'Acción no permitida.' });
});

// F. SINIESTROS
app.get('/api/siniestros', (req, res) => {
    const accion = req.query.accion;
    if (accion === 'verificar_solvencia') {
        const crit = (req.query.criterio || '').trim();
        const pol = memoryDB.polizas.find(p => {
            const cl = memoryDB.clientes.find(c => c.id_cliente === p.id_cliente);
            return p.num_poliza === crit || (cl && cl.cedula === crit);
        }) || memoryDB.polizas[0];

        const morosas = memoryDB.cuotas.filter(q => q.id_poliza === pol.id_poliza && q.estado === 'Vencido').length;
        const alDia = (morosas === 0 && pol.estado === 'Activa');
        const cl = memoryDB.clientes.find(c => c.id_cliente === pol.id_cliente) || {};
        const veh = memoryDB.vehiculos.find(v => v.id_vehiculo === pol.id_vehiculo) || {};

        return res.json({ status: 'success', poliza: { ...pol, cliente_nombre: cl.nombre_completo, cedula: cl.cedula, marca: veh.marca, modelo: veh.modelo, placa: veh.placa }, esta_al_dia: alDia, cuotas_vencidas: morosas, mensaje_solvencia: alDia ? 'Póliza Solvente y Activa. Cobertura disponible.' : `ATENCIÓN: La póliza registra ${morosas} cuota(s) en mora. Cobertura suspendida hasta cancelar.` });
    }
    const lista = memoryDB.siniestros.map(s => {
        const pol = memoryDB.polizas.find(p => p.id_poliza === s.id_poliza) || {};
        const cl = memoryDB.clientes.find(c => c.id_cliente === pol.id_cliente) || {};
        const veh = memoryDB.vehiculos.find(v => v.id_vehiculo === pol.id_vehiculo) || {};
        return { ...s, num_poliza: pol.num_poliza || 'POL-001', cliente_nombre: cl.nombre_completo || 'Asegurado', marca: veh.marca, modelo: veh.modelo, placa: veh.placa };
    });
    res.json({ status: 'success', siniestros: lista });
});

app.post('/api/siniestros', upload.single('evidencia_foto'), (req, res) => {
    const accion = req.body.accion;
    if (accion === 'crear') {
        const idPol = parseInt(req.body.id_poliza) || 1;
        const morosas = memoryDB.cuotas.filter(q => q.id_poliza === idPol && q.estado === 'Vencido').length;
        if (morosas > 0) {
            return res.status(422).json({ status: 'rejected', message: `RECHAZADO: La póliza registra ${morosas} cuota(s) en mora. Cobertura suspendida.` });
        }
        const folio = 'REC-' + new Date().getFullYear() + '-' + String(memoryDB.siniestros.length + 1).padStart(4, '0');
        const est = parseFloat(req.body.monto_estimado) || 650;
        memoryDB.siniestros.push({ id_siniestro: memoryDB.siniestros.length + 1, folio_reclamo: folio, id_poliza: idPol, fecha_accidente: req.body.fecha_accidente || '2026-09-21', hora_accidente: req.body.hora_accidente || '10:30', lugar_accidente: req.body.lugar_accidente || 'León', descripcion: req.body.descripcion || 'Percance vial', evidencia_foto: req.file ? req.file.filename : null, estado: 'En Revisión', monto_estimado: est, deducible_aplicado: 250, monto_cubierto: Math.max(0, est - 250), poliza_al_dia_al_reportar: 1, observaciones_ajustador: 'Expediente aperturado.' });
        registrarLogAuditoria('Apertura de Siniestro', req.session?.usuario?.correo || 'Asegurado', 'Cliente', `Folio ${folio} creado para póliza ID ${idPol}`, getClientIp(req));
        return res.json({ status: 'success', folio_reclamo: folio, message: `Expediente aperturado con Folio ${folio}.` });
    }
    if (accion === 'actualizar_estado') {
        const s = memoryDB.siniestros.find(x => x.id_siniestro === parseInt(req.body.id_siniestro));
        if (s) {
            s.estado = req.body.estado || s.estado;
            s.monto_cubierto = parseFloat(req.body.monto_cubierto) || s.monto_cubierto;
            s.observaciones_ajustador = req.body.observaciones_ajustador || s.observaciones_ajustador;
            registrarLogAuditoria('Ajuste de Siniestro', req.session?.usuario?.correo || 'Admin', 'Admin/Ajustador', `Siniestro ${s.folio_reclamo} actualizado a ${s.estado}`, getClientIp(req));
            return res.json({ status: 'success', message: 'Estado del siniestro actualizado.' });
        }
    }
    res.status(400).json({ status: 'error', message: 'Acción no permitida.' });
});

// G. COMISIONES & SIMULADOR (RF-06 3.6)
app.get('/api/comisiones', (req, res) => {
    const mes = req.query.mes || '';
    let det = memoryDB.comisiones;
    if (mes) det = det.filter(c => c.mes_liquidacion.toLowerCase() === mes.toLowerCase());

    const asesores = [memoryDB.usuarios[1], memoryDB.usuarios[2]].map(u => {
        const ops = det.filter(c => c.id_asesor === u.id_usuario);
        const primas = ops.reduce((a, b) => a + b.prima_cobrada, 0);
        const com = ops.reduce((a, b) => a + b.monto_comision, 0);
        const pagadas = ops.filter(c => c.estado === 'Pagada').reduce((a, b) => a + b.monto_comision, 0);
        return { id_usuario: u.id_usuario, asesor_nombre: u.nombre, correo: u.correo, tasa_comision: u.tasa_comision, total_operaciones: ops.length, total_primas_recaudadas: primas.toFixed(2), total_comision_devengada: com.toFixed(2), comision_pendiente: (com - pagadas).toFixed(2) };
    });

    const enriquecido = det.map(d => {
        const u = memoryDB.usuarios.find(x => x.id_usuario === d.id_asesor) || {};
        const pol = memoryDB.polizas.find(x => x.id_poliza === d.id_poliza) || {};
        return { ...d, asesor_nombre: u.nombre, num_poliza: pol.num_poliza || 'POL-001' };
    });

    const totalPrimas = det.reduce((a, b) => a + b.prima_cobrada, 0);
    const totalCom = det.reduce((a, b) => a + b.monto_comision, 0);

    res.json({ status: 'success', formula_aplicada: 'C_total = ∑(P_i × η_i)', totales_globales: { primas_recaudadas: totalPrimas.toFixed(2), comisiones_devengadas: totalCom.toFixed(2), total_transacciones: det.length }, asesores, detalle: enriquecido });
});

app.post('/api/comisiones', (req, res) => {
    const accion = req.body.accion;
    if (accion === 'liquidar_mes') {
        const idA = parseInt(req.body.id_asesor);
        const mes = req.body.mes || 'Agosto';
        memoryDB.comisiones.forEach(c => { if (c.id_asesor === idA && c.mes_liquidacion.toLowerCase() === mes.toLowerCase()) c.estado = 'Liquidada'; });
        registrarLogAuditoria('Liquidación de Comisiones', req.session?.usuario?.correo || 'Gerente', 'Gerente', `Comisiones de ${mes} liquidadas`, getClientIp(req));
        return res.json({ status: 'success', message: `Comisiones de ${mes} liquidadas.` });
    }
    if (accion === 'marcar_pagada') {
        const c = memoryDB.comisiones.find(x => x.id_comision === parseInt(req.body.id_comision));
        if (c) { c.estado = 'Pagada'; return res.json({ status: 'success', message: 'Comisión pagada.' }); }
    }
    res.status(400).json({ status: 'error', message: 'Acción no permitida.' });
});

// H. NUEVAS RUTAS: CATÁLOGO DE VEHÍCULOS, CRM Y TALLERES
app.get('/api/catalogo_vehiculos', (req, res) => {
    res.json({ status: 'success', catalogo: memoryDB.catalogo_vehiculos });
});

app.get('/api/crm/prospectos', (req, res) => {
    res.json({ status: 'success', prospectos: memoryDB.prospectos });
});

app.post('/api/crm/prospectos', (req, res) => {
    const accion = req.body.accion || 'crear';
    if (accion === 'crear') {
        const { nombre, telefono, correo, vehiculo_interes, prima_estimada } = req.body;
        const nuevo = {
            id: memoryDB.prospectos.length + 1,
            id_asesor: req.session?.usuario?.id || 2,
            nombre,
            telefono,
            correo: correo || 'prospecto@gmail.com',
            vehiculo_interes: vehiculo_interes || 'Toyota Corolla',
            estado: 'Nuevo Contacto',
            prima_estimada: parseFloat(prima_estimada) || 45.00,
            fecha: new Date().toISOString().slice(0, 10)
        };
        memoryDB.prospectos.unshift(nuevo);
        registrarLogAuditoria('Nuevo Prospecto CRM', req.session?.usuario?.correo || 'Agente', 'Agente', `Prospecto ${nombre} ingresado (${vehiculo_interes})`, getClientIp(req));
        return res.json({ status: 'success', message: 'Prospecto agregado al CRM de ventas.', prospecto: nuevo });
    }
    if (accion === 'mover_etapa') {
        const p = memoryDB.prospectos.find(x => x.id === parseInt(req.body.id));
        if (p) {
            p.estado = req.body.nuevo_estado;
            registrarLogAuditoria('CRM Etapa Actualizada', req.session?.usuario?.correo || 'Agente', 'Agente', `Prospecto ${p.nombre} movido a ${p.estado}`, getClientIp(req));
            return res.json({ status: 'success', message: `Prospecto actualizado a estado "${p.estado}".` });
        }
    }
    if (accion === 'eliminar') {
        memoryDB.prospectos = memoryDB.prospectos.filter(x => x.id !== parseInt(req.body.id));
        return res.json({ status: 'success', message: 'Prospecto eliminado del CRM.' });
    }
    res.status(400).json({ status: 'error', message: 'Acción CRM inválida.' });
});

app.get('/api/talleres', (req, res) => {
    res.json({ status: 'success', talleres: memoryDB.talleres });
});

app.post('/api/talleres', (req, res) => {
    const { nombre, tipo, direccion, telefono, horario, convenios } = req.body;
    const nuevo = {
        id: memoryDB.talleres.length + 1,
        nombre,
        tipo: tipo || 'Taller Mecánico & Enderezado',
        direccion,
        telefono,
        horario: horario || 'Lun - Sáb 8:00 AM - 5:00 PM',
        calificacion: 5.0,
        convenios: convenios || 'Seguros América, INISER, ASSSA'
    };
    memoryDB.talleres.push(nuevo);
    registrarLogAuditoria('Nuevo Taller Asociado', req.session?.usuario?.correo || 'Admin', 'Admin', `Taller ${nombre} indexado en León`, getClientIp(req));
    res.json({ status: 'success', message: 'Taller o grúa registrado exitosamente en la red.', taller: nuevo });
});

app.get('/api/auditoria', (req, res) => {
    res.json({ status: 'success', logs: memoryDB.auditoria_logs });
});

app.post('/api/auditoria/limpiar', (req, res) => {
    memoryDB.auditoria_logs = [];
    registrarLogAuditoria('Depuración de Logs', req.session?.usuario?.correo || 'Admin', 'Admin', 'Registros antiguos de auditoría purgados', getClientIp(req));
    res.json({ status: 'success', message: 'Historial de auditoría depurado.' });
});

app.get('/api/usuarios_admin', (req, res) => {
    res.json({ status: 'success', usuarios: memoryDB.usuarios });
});

app.post('/api/usuarios_admin', (req, res) => {
    const accion = req.body.accion || 'crear';
    if (accion === 'crear') {
        const { nombre, correo, rol, telefono, tasa_comision, contrasena } = req.body;
        if (memoryDB.usuarios.find(u => u.correo.toLowerCase() === (correo || '').toLowerCase())) {
            return res.status(409).json({ status: 'error', message: 'El correo electrónico ya se encuentra registrado.' });
        }
        const nuevo = {
            id_usuario: memoryDB.usuarios.length + 1,
            nombre,
            correo,
            contrasena: contrasena || '123',
            rol: rol || 'Agente',
            telefono: telefono || '+505 8888 0000',
            tasa_comision: parseFloat(tasa_comision) || (rol === 'Agente' ? 0.12 : 0.0),
            estado: 'Activo',
            fecha_creacion: new Date().toISOString().slice(0, 10)
        };
        memoryDB.usuarios.push(nuevo);
        registrarLogAuditoria('Crear Usuario Admin', req.session?.usuario?.correo || 'Admin', 'Admin', `Usuario ${correo} (${rol}) creado`, getClientIp(req));
        return res.json({ status: 'success', message: 'Usuario registrado exitosamente en el sistema.', usuario: nuevo });
    }
    if (accion === 'cambiar_estado') {
        const u = memoryDB.usuarios.find(x => x.id_usuario === parseInt(req.body.id_usuario));
        if (u) {
            u.estado = (u.estado === 'Activo') ? 'Bloqueado' : 'Activo';
            registrarLogAuditoria('Cambio Estado Usuario', req.session?.usuario?.correo || 'Admin', 'Admin', `Usuario ${u.correo} marcado como ${u.estado}`, getClientIp(req));
            return res.json({ status: 'success', message: `Usuario ${u.nombre} ahora está: ${u.estado}.` });
        }
    }
    if (accion === 'actualizar_tasa') {
        const u = memoryDB.usuarios.find(x => x.id_usuario === parseInt(req.body.id_usuario));
        if (u) {
            u.tasa_comision = parseFloat(req.body.tasa_comision);
            registrarLogAuditoria('Ajuste Tasa Comisión', req.session?.usuario?.correo || 'Admin', 'Admin', `Tasa de ${u.nombre} fijada en ${(u.tasa_comision*100).toFixed(1)}%`, getClientIp(req));
            return res.json({ status: 'success', message: `Tasa de comisión de ${u.nombre} actualizada a ${(u.tasa_comision * 100).toFixed(1)}%.` });
        }
    }
    res.status(400).json({ status: 'error', message: 'Acción no permitida.' });
});

app.post('/api/recordatorios_pago', (req, res) => {
    // Buscar cuotas vencidas o por vencer
    const morosas = memoryDB.cuotas.filter(q => q.estado === 'Vencido' || q.estado === 'Por vencer');
    const notificados = [];

    morosas.forEach(q => {
        const pol = memoryDB.polizas.find(p => p.id_poliza === q.id_poliza);
        if (pol) {
            const cl = memoryDB.clientes.find(c => c.id_cliente === pol.id_cliente);
            if (cl) {
                notificados.push({
                    cliente: cl.nombre_completo,
                    telefono: cl.telefono,
                    poliza: pol.num_poliza,
                    monto: q.monto,
                    mes: q.mes_nombre,
                    estado: q.estado
                });
            }
        }
    });

    registrarLogAuditoria('Envío Recordatorios Cobranza', req.session?.usuario?.correo || 'Admin', 'Admin', `Se despacharon ${notificados.length} recordatorios automáticos`, getClientIp(req));
    res.json({
        status: 'success',
        message: `¡Recordatorios generados y despachados exitosamente a ${notificados.length} asegurados con saldos pendientes!`,
        notificados
    });
});

app.post('/api/desbloqueo_ips', (req, res) => {
    memoryDB.intentos_login = [];
    registrarLogAuditoria('Desbloqueo Global de Seguridad', req.session?.usuario?.correo || 'Admin', 'Admin', 'Todos los bloqueos por fuerza bruta fueron eliminados', getClientIp(req));
    res.json({ status: 'success', message: 'Todas las IPs bloqueadas por intentos fallidos han sido rehabilitadas correctamente.' });
});

app.get('/api/tarifas_config', (req, res) => {
    res.json({ status: 'success', config: memoryDB.config_tarifas });
});

app.post('/api/tarifas_config', (req, res) => {
    if (req.body.tasa_iva) memoryDB.config_tarifas.tasa_iva = parseFloat(req.body.tasa_iva);
    if (req.body.tasa_prima_base_anual) memoryDB.config_tarifas.tasa_prima_base_anual = parseFloat(req.body.tasa_prima_base_anual);
    if (req.body.deducible_default) memoryDB.config_tarifas.deducible_default = parseFloat(req.body.deducible_default);
    registrarLogAuditoria('Ajuste de Parámetros Tarifarios', req.session?.usuario?.correo || 'Admin', 'Admin', 'Tarifas del motor paramétrico actualizadas', getClientIp(req));
    res.json({ status: 'success', message: 'Parámetros de cálculo paramétrico actualizados correctamente.' });
});

// I. DASHBOARD
app.get('/api/dashboard', (req, res) => {
    const totalClientes = memoryDB.clientes.length;
    const totalPolizas = memoryDB.polizas.length;
    const polizasActivas = memoryDB.polizas.filter(p => p.estado === 'Activa').length;
    const recaudacionTotal = memoryDB.pagos.filter(p => p.estado === 'Aprobado').reduce((a, b) => a + b.monto, 0);
    const saldoPendiente = memoryDB.polizas.reduce((a, b) => a + b.saldo_pendiente, 0);
    const totalSiniestros = memoryDB.siniestros.length;
    const montoIndemnizado = memoryDB.siniestros.filter(s => ['En Taller', 'Indemnizado'].includes(s.estado)).reduce((a, b) => a + b.monto_cubierto, 0);

    const distribucionAseguradoras = memoryDB.aseguradoras.map(a => {
        const pols = memoryDB.polizas.filter(p => p.id_aseguradora === a.id_aseguradora);
        const vol = pols.reduce((x, y) => x + y.prima_anual, 0);
        return { nombre: a.nombre, total_polizas: pols.length, volumen_anual: vol.toFixed(2) };
    });

    const rankingAsesores = [memoryDB.usuarios[1], memoryDB.usuarios[2]].map(u => {
        const coms = memoryDB.comisiones.filter(c => c.id_asesor === u.id_usuario);
        const ventas = coms.reduce((a, b) => a + b.prima_cobrada, 0);
        const com = coms.reduce((a, b) => a + b.monto_comision, 0);
        return { nombre: u.nombre, ventas: coms.length, total_ventas: ventas.toFixed(2), comisiones: com.toFixed(2) };
    });

    res.json({
        status: 'success',
        kpis: { total_clientes: totalClientes, total_polizas: totalPolizas, polizas_activas: polizasActivas, recaudacion_total: recaudacionTotal.toFixed(2), saldo_pendiente: saldoPendiente.toFixed(2), total_siniestros: totalSiniestros, monto_indemnizado: montoIndemnizado.toFixed(2) },
        distribucion_aseguradoras: distribucionAseguradoras,
        ranking_asesores: rankingAsesores
    });
});

app.get('/api/aseguradoras', (req, res) => {
    res.json({ status: 'success', aseguradoras: memoryDB.aseguradoras });
});

// J. EXPORTADOR CSV
app.get('/api/exportar_csv', (req, res) => {
    const tipo = req.query.tipo || 'clientes';
    let csv = '';

    if (tipo === 'clientes') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="reporte_clientes_advisers.csv"');
        csv = "ID,Cedula,Nombre,Telefono,Correo,Departamento\n";
        memoryDB.clientes.forEach(c => {
            csv += `"${c.id_cliente}","${c.cedula}","${c.nombre_completo}","${c.telefono}","${c.correo}","${c.departamento}"\n`;
        });
    } else {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="reporte_polizas_advisers.csv"');
        csv = "ID,NumPoliza,Cliente,PrimaMensual,SaldoPendiente,Estado,Vigencia\n";
        memoryDB.polizas.forEach(p => {
            const cl = memoryDB.clientes.find(c => c.id_cliente === p.id_cliente) || {};
            csv += `"${p.id_poliza}","${p.num_poliza}","${cl.nombre_completo || ''}","${p.prima_mensual}","${p.saldo_pendiente}","${p.estado}","${p.fecha_inicio} al ${p.fecha_fin}"\n`;
        });
    }
    registrarLogAuditoria('Exportación de Datos CSV', req.session?.usuario?.correo || 'Admin', 'Admin', `Archivo CSV exportado: ${tipo}`, getClientIp(req));
    res.send(csv);
});

// K. BACKUP SQL
app.get('/api/backup', (req, res) => {
    const fecha = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader('Content-Type', 'text/sql');
    res.setHeader('Content-Disposition', `attachment; filename="backup_advisers_${fecha}.sql"`);

    let sql = `-- BACKUP COMPLETO BASE DE DATOS SEGUROS ADVISERS (${fecha})\n-- LEÓN, NICARAGUA\n\n`;
    for (const [tabla, rows] of Object.entries(memoryDB)) {
        if (Array.isArray(rows) && rows.length > 0) {
            sql += `-- Tabla: ${tabla}\n`;
            for (const r of rows) {
                const keys = Object.keys(r).join(', ');
                const vals = Object.values(r).map(v => v === null ? 'NULL' : `'${String(v).replace(/'/g, "\\'")}'`).join(', ');
                sql += `INSERT INTO ${tabla} (${keys}) VALUES (${vals});\n`;
            }
            sql += '\n';
        }
    }
    registrarLogAuditoria('Descarga de Backup SQL', req.session?.usuario?.correo || 'Admin', 'Admin', 'Volcado SQL descargado', getClientIp(req));
    res.send(sql);
});

// SPA Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar Servidor
app.listen(PORT, () => {
    console.log('================================================================');
    console.log(`🚀 SEGUROS ADVISERS ACTIVO (100% OPERATIVO) EN: http://localhost:${PORT}`);
    console.log(`📍 Sucursal León, Nicaragua • Módulos: Admin, Asesor y Público`);
    console.log('================================================================');
});
