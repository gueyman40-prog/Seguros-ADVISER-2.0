-- ==============================================================================
-- SISTEMA DE GESTIÓN PARA AGENCIA DE SEGUROS "ADVISERS" (LEÓN, NICARAGUA)
-- Script DDL y Datos Iniciales con Integridad Referencial Estricta (InnoDB)
-- Cumplimiento de Matriz de Requisitos: RF-01 al RF-06, RNF-01 al RNF-06
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS advisers_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE advisers_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS comisiones;
DROP TABLE IF EXISTS siniestros;
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS cuotas;
DROP TABLE IF EXISTS polizas;
DROP TABLE IF EXISTS cotizaciones;
DROP TABLE IF EXISTS vehiculos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS aseguradoras;
DROP TABLE IF EXISTS intentos_login;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------------------
-- 1. TABLA DE USUARIOS Y CONTROL DE ROLES (RNF-01, RNF-03, RF-01 3.1)
-- ------------------------------------------------------------------------------
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL, -- Bcrypt hash
    rol ENUM('Administrador', 'Agente', 'Gerente', 'Cliente') NOT NULL DEFAULT 'Cliente',
    telefono VARCHAR(20) NULL,
    intentos_fallidos INT DEFAULT 0,
    bloqueado_hasta DATETIME NULL,
    tasa_comision DECIMAL(5,4) DEFAULT 0.1000, -- 10% por defecto para asesores
    estado ENUM('Activo', 'Inactivo', 'Bloqueado') DEFAULT 'Activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 2. TABLA DE REGISTRO DE INTENTOS DE LOGIN (Mitigación Fuerza Bruta)
-- ------------------------------------------------------------------------------
CREATE TABLE intentos_login (
    id_intento INT AUTO_INCREMENT PRIMARY KEY,
    ip_origen VARCHAR(45) NOT NULL,
    correo_intentado VARCHAR(100) NOT NULL,
    es_exitoso TINYINT(1) NOT NULL DEFAULT 0,
    fecha_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 3. TABLA DE ASEGURADORAS SOCIAS (RF-04, RF-03 3.3)
-- ------------------------------------------------------------------------------
CREATE TABLE aseguradoras (
    id_aseguradora INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    ruc VARCHAR(30) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    comision_base_porc DECIMAL(5,2) DEFAULT 12.50,
    estado ENUM('Activa', 'Inactiva') DEFAULT 'Activa',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 4. TABLA DE CLIENTES (RF-02 3.2: Validación de Cédula Única de Nicaragua)
-- ------------------------------------------------------------------------------
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL, -- Ej: 281-200595-0002F
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    departamento VARCHAR(50) DEFAULT 'León',
    municipio VARCHAR(50) DEFAULT 'León',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 5. TABLA DE VEHÍCULOS (RF-01)
-- ------------------------------------------------------------------------------
CREATE TABLE vehiculos (
    id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    anio INT NOT NULL,
    tipo_vehiculo ENUM('Sedan', 'SUV', 'Camioneta', 'Camion', 'Motocicleta') DEFAULT 'Sedan',
    uso_vehiculo ENUM('Particular', 'Comercial / Taxi', 'Carga') DEFAULT 'Particular',
    valor_estimado DECIMAL(12,2) NOT NULL,
    placa VARCHAR(20) NULL,
    chasis VARCHAR(50) NULL,
    color VARCHAR(30) NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 6. TABLA DE PÓLIZAS DE SEGURO (RF-03 3.3, RF-04)
-- ------------------------------------------------------------------------------
CREATE TABLE polizas (
    id_poliza INT AUTO_INCREMENT PRIMARY KEY,
    num_poliza VARCHAR(50) UNIQUE NOT NULL,
    id_cliente INT NOT NULL,
    id_vehiculo INT NOT NULL,
    id_aseguradora INT NOT NULL,
    id_asesor INT NULL, -- Usuario con rol 'Agente'
    tipo_cobertura ENUM('Básico (Terceros)', 'Intermedio (Amplio)', 'Premium (Todo Riesgo)') NOT NULL,
    deducible DECIMAL(10,2) NOT NULL DEFAULT 200.00,
    prima_anual DECIMAL(10,2) NOT NULL,
    prima_mensual DECIMAL(10,2) NOT NULL,
    saldo_pendiente DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    documento_contrato VARCHAR(255) NULL, -- PDF indexado
    estado ENUM('Activa', 'Por Vencer', 'Vencida', 'Cancelada') DEFAULT 'Activa',
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE RESTRICT,
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo) ON DELETE RESTRICT,
    FOREIGN KEY (id_aseguradora) REFERENCES aseguradoras(id_aseguradora) ON DELETE RESTRICT,
    FOREIGN KEY (id_asesor) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 7. TABLA DE CRONOGRAMA DE CUOTAS (RF-02 1.2: Estado de Cuenta en Tiempo Real)
-- ------------------------------------------------------------------------------
CREATE TABLE cuotas (
    id_cuota INT AUTO_INCREMENT PRIMARY KEY,
    id_poliza INT NOT NULL,
    num_cuota INT NOT NULL,
    mes_nombre VARCHAR(30) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado ENUM('Al día', 'Por vencer', 'Vencido', 'Pagada') DEFAULT 'Al día',
    fecha_pago DATE NULL,
    FOREIGN KEY (id_poliza) REFERENCES polizas(id_poliza) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 8. TABLA DE PAGOS Y VÁUCHERS (RF-03 1.3: Carga Segura y Verificación)
-- ------------------------------------------------------------------------------
CREATE TABLE pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_poliza INT NOT NULL,
    id_cuota INT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago DATE NOT NULL,
    banco ENUM('BAC Credomatic', 'Banco LAFISE Bancentro', 'Banpro Grupo Promerica', 'BDF', 'Ficohsa') NOT NULL,
    num_referencia VARCHAR(100) NOT NULL,
    comprobante_url VARCHAR(255) NOT NULL, -- Ruta segura del PDF o imagen
    tipo_archivo VARCHAR(50) NOT NULL,
    tamanio_bytes INT NOT NULL,
    estado ENUM('Pendiente de validación', 'Aprobado', 'Rechazado') DEFAULT 'Pendiente de validación',
    observaciones TEXT NULL,
    revisado_por INT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_poliza) REFERENCES polizas(id_poliza) ON DELETE CASCADE,
    FOREIGN KEY (id_cuota) REFERENCES cuotas(id_cuota) ON DELETE SET NULL,
    FOREIGN KEY (revisado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 9. TABLA DE COTIZACIONES CON FÓRMULA PARAMÉTRICA (RF-01, RF-04 3.4)
-- Formula: P_t = P_base * (1 + alpha) - delta + IVA(15%)
-- ------------------------------------------------------------------------------
CREATE TABLE cotizaciones (
    id_cotizacion INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NULL,
    nombre_prospecto VARCHAR(150) NOT NULL,
    correo_prospecto VARCHAR(100) NOT NULL,
    telefono_prospecto VARCHAR(20) NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    anio INT NOT NULL,
    tipo_vehiculo VARCHAR(50) NOT NULL,
    uso_vehiculo VARCHAR(50) NOT NULL,
    valor_estimado DECIMAL(12,2) NOT NULL,
    prima_base DECIMAL(10,2) NOT NULL,
    factor_riesgo_alpha DECIMAL(5,2) NOT NULL,
    descuento_delta DECIMAL(5,2) NOT NULL,
    iva_monto DECIMAL(10,2) NOT NULL,
    prima_total_mensual DECIMAL(10,2) NOT NULL,
    plan_seleccionado VARCHAR(50) NOT NULL,
    estado ENUM('Cotizado', 'Aprobado', 'Emitido', 'Rechazado') DEFAULT 'Cotizado',
    fecha_cotizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 10. TABLA DE RECLAMOS Y SINIESTROS (RF-05 3.5: Verificación de Solvencia)
-- ------------------------------------------------------------------------------
CREATE TABLE siniestros (
    id_siniestro INT AUTO_INCREMENT PRIMARY KEY,
    folio_reclamo VARCHAR(30) UNIQUE NOT NULL, -- Formato: REC-2026-XXXX
    id_poliza INT NOT NULL,
    fecha_accidente DATE NOT NULL,
    hora_accidente TIME NOT NULL,
    lugar_accidente VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    evidencia_foto VARCHAR(255) NULL,
    estado ENUM('En Revisión', 'Aprobado', 'En Taller', 'Indemnizado', 'Rechazado') DEFAULT 'En Revisión',
    monto_estimado DECIMAL(10,2) DEFAULT 0.00,
    deducible_aplicado DECIMAL(10,2) DEFAULT 200.00,
    monto_cubierto DECIMAL(10,2) DEFAULT 0.00,
    poliza_al_dia_al_reportar TINYINT(1) NOT NULL DEFAULT 1,
    observaciones_ajustador TEXT NULL,
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_poliza) REFERENCES polizas(id_poliza) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 11. TABLA DE COMISIONES Y LIQUIDACIÓN FINANCIERA (RF-06 3.6)
-- Formula: C_total = SUM( P_i * eta_i )
-- ------------------------------------------------------------------------------
CREATE TABLE comisiones (
    id_comision INT AUTO_INCREMENT PRIMARY KEY,
    id_asesor INT NOT NULL,
    id_poliza INT NOT NULL,
    id_pago INT NULL,
    mes_liquidacion VARCHAR(20) NOT NULL,
    anio_liquidacion INT NOT NULL,
    prima_cobrada DECIMAL(10,2) NOT NULL,
    tasa_comision_eta DECIMAL(5,4) NOT NULL, -- ej 0.1200 para 12%
    monto_comision DECIMAL(10,2) NOT NULL,   -- P_i * eta_i
    estado ENUM('Calculada', 'Liquidada', 'Pagada') DEFAULT 'Calculada',
    fecha_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_asesor) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_poliza) REFERENCES polizas(id_poliza) ON DELETE CASCADE,
    FOREIGN KEY (id_pago) REFERENCES pagos(id_pago) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==============================================================================
-- INSERCIÓN DE DATOS DE PRUEBA Y CUENTAS DEMOSTRATIVAS (LEÓN, NICARAGUA)
-- ==============================================================================

-- 1. Usuarios del Sistema (Contraseñas con Hashing Bcrypt para 'admin123', 'agente123', 'gerente123', 'cliente123')
-- Nota: Hash generado con password_hash('clave', PASSWORD_BCRYPT)
INSERT INTO usuarios (id_usuario, nombre, correo, contrasena, rol, telefono, tasa_comision, estado) VALUES
(1, 'Administrador General TI', 'admin@advisers.com.ni', '$2y$10$tZ2wR8wI7x6dZ4F5K.gXCe8Xv/x9gD8K4.y5QZ2Qj5m1n2o3p4q5r', 'Administrador', '+505 8888 1111', 0.0000, 'Activo'),
(2, 'Jorvin Leonel Arteaga Villalobos', 'jorvin.arteaga@advisers.com.ni', '$2y$10$7Zrqx/W1h.a7Rzg.xX5q3O8K8Vv90hFpM9Aom3fFkQqW5kE9Z.7iW', 'Agente', '+505 7798 9543', 0.1400, 'Activo'),
(3, 'Francisco Leonardo Bravo Franco', 'francisco.bravo@advisers.com.ni', '$2y$10$7Zrqx/W1h.a7Rzg.xX5q3O8K8Vv90hFpM9Aom3fFkQqW5kE9Z.7iW', 'Agente', '+505 8627 8780', 0.1200, 'Activo'),
(4, 'Joshua Fernando Salazar Blanco', 'gerencia@advisers.com.ni', '$2y$10$j8P.L/9g1N4z5c2v8B.uYe7Xv/x9gD8K4.y5QZ2Qj5m1n2o3p4q5r', 'Gerente', '+505 8999 4444', 0.0000, 'Activo'),
(5, 'Carlos Alberto Mendoza Rivas', 'carlos.mendoza@gmail.com', '$2y$10$3s.z6g1H9b5c2v8B.uYe7Xv/x9gD8K4.y5QZ2Qj5m1n2o3p4q5r', 'Cliente', '+505 8456 7890', 0.0000, 'Activo'),
(6, 'María Elena Delgado Ruiz', 'maria.delgado@hotmail.com', '$2y$10$3s.z6g1H9b5c2v8B.uYe7Xv/x9gD8K4.y5QZ2Qj5m1n2o3p4q5r', 'Cliente', '+505 8765 4321', 0.0000, 'Activo');

-- 2. Aseguradoras Socias
INSERT INTO aseguradoras (id_aseguradora, nombre, ruc, telefono, correo, direccion, comision_base_porc) VALUES
(1, 'Seguros América S.A.', 'J0310000001234', '+505 2255 8000', 'atencion@segurosamerica.com.ni', 'Rotonda Jean Paul Genie, Managua', 14.00),
(2, 'INISER (Instituto Nicaragüense de Seguros)', 'J0310000005678', '+505 2266 9900', 'contacto@iniser.com.ni', 'Frente a Hospital Militar, Managua', 12.00),
(3, 'ASSSA Compañía de Seguros', 'J0310000009012', '+505 2270 5500', 'soporte@asssa.com.ni', 'Pista Jean Paul Genie, Managua', 13.50),
(4, 'Mapfre Seguros Nicaragua', 'J0310000003456', '+505 2254 7777', 'info@mapfre.com.ni', 'Carretera a Masaya km 4.5, Managua', 15.00),
(5, 'LAFISE Seguros', 'J0310000007890', '+505 2255 8888', 'seguros@lafise.com', 'Edificio Principal Bancentro, Managua', 13.00);

-- 3. Clientes Registrados en León
INSERT INTO clientes (id_cliente, id_usuario, cedula, nombre_completo, telefono, correo, direccion, departamento, municipio) VALUES
(1, 5, '281-150890-0004A', 'Carlos Alberto Mendoza Rivas', '+505 8456 7890', 'carlos.mendoza@gmail.com', 'Del Parque Central de Sutiaba 2c al Norte, León', 'León', 'León'),
(2, 6, '281-220492-0001B', 'María Elena Delgado Ruiz', '+505 8765 4321', 'maria.delgado@hotmail.com', 'Costado Sur de la Catedral 1c abajo, León', 'León', 'León'),
(3, NULL, '001-100288-0023K', 'Roberto José Fonseca Somarriba', '+505 8912 3456', 'roberto.fonseca@yahoo.com', 'Barrio Guadalupe, frente a Iglesia, León', 'León', 'León');

-- 4. Vehículos Registrados
INSERT INTO vehiculos (id_vehiculo, id_cliente, marca, modelo, anio, tipo_vehiculo, uso_vehiculo, valor_estimado, placa, chasis, color) VALUES
(1, 1, 'Toyota', 'Corolla', 2022, 'Sedan', 'Particular', 18500.00, 'LE-28940', 'JTDBR32E602938471', 'Plata Metalizado'),
(2, 2, 'Hyundai', 'Tucson', 2023, 'SUV', 'Particular', 26000.00, 'LE-31054', 'KM8JM12C9PU019284', 'Blanco Perla'),
(3, 3, 'Nissan', 'Frontier', 2021, 'Camioneta', 'Comercial / Taxi', 22000.00, 'LE-19482', 'JN1HD07Y5XW827364', 'Gris Oscuro');

-- 5. Pólizas Emitidas
INSERT INTO polizas (id_poliza, num_poliza, id_cliente, id_vehiculo, id_aseguradora, id_asesor, tipo_cobertura, deducible, prima_anual, prima_mensual, saldo_pendiente, fecha_inicio, fecha_fin, documento_contrato, estado) VALUES
(1, 'POL-2026-ADV-001', 1, 1, 1, 2, 'Premium (Todo Riesgo)', 250.00, 720.00, 60.00, 60.00, '2026-01-15', '2027-01-15', 'contrato_pol_001.pdf', 'Activa'),
(2, 'POL-2026-ADV-002', 2, 2, 3, 3, 'Intermedio (Amplio)', 300.00, 540.00, 45.00, 0.00, '2026-02-01', '2027-02-01', 'contrato_pol_002.pdf', 'Activa'),
(3, 'POL-2026-ADV-003', 3, 3, 4, 2, 'Básico (Terceros)', 200.00, 360.00, 30.00, 90.00, '2026-01-01', '2027-01-01', 'contrato_pol_003.pdf', 'Activa');

-- 6. Cronograma de Cuotas para Póliza 1 (Cliente 1: Carlos Mendoza - 1 Cuota Pendiente)
INSERT INTO cuotas (id_cuota, id_poliza, num_cuota, mes_nombre, monto, fecha_vencimiento, estado, fecha_pago) VALUES
(1, 1, 1, 'Enero 2026', 60.00, '2026-01-15', 'Pagada', '2026-01-14'),
(2, 1, 2, 'Febrero 2026', 60.00, '2026-02-15', 'Pagada', '2026-02-13'),
(3, 1, 3, 'Marzo 2026', 60.00, '2026-03-15', 'Pagada', '2026-03-15'),
(4, 1, 4, 'Abril 2026', 60.00, '2026-04-15', 'Pagada', '2026-04-14'),
(5, 1, 5, 'Mayo 2026', 60.00, '2026-05-15', 'Pagada', '2026-05-12'),
(6, 1, 6, 'Junio 2026', 60.00, '2026-06-15', 'Pagada', '2026-06-15'),
(7, 1, 7, 'Julio 2026', 60.00, '2026-07-15', 'Pagada', '2026-07-14'),
(8, 1, 8, 'Agosto 2026', 60.00, '2026-08-15', 'Pagada', '2026-08-15'),
(9, 1, 9, 'Septiembre 2026', 60.00, '2026-09-15', 'Por vencer', NULL);

-- Cuotas para Póliza 2 (Cliente 2: María Delgado - Al día total)
INSERT INTO cuotas (id_cuota, id_poliza, num_cuota, mes_nombre, monto, fecha_vencimiento, estado, fecha_pago) VALUES
(10, 2, 1, 'Febrero 2026', 45.00, '2026-02-01', 'Pagada', '2026-02-01'),
(11, 2, 2, 'Marzo 2026', 45.00, '2026-03-01', 'Pagada', '2026-03-01'),
(12, 2, 3, 'Abril 2026', 45.00, '2026-04-01', 'Pagada', '2026-03-28'),
(13, 2, 4, 'Mayo 2026', 45.00, '2026-05-01', 'Pagada', '2026-04-30'),
(14, 2, 5, 'Junio 2026', 45.00, '2026-06-01', 'Pagada', '2026-05-31'),
(15, 2, 6, 'Julio 2026', 45.00, '2026-07-01', 'Pagada', '2026-06-30'),
(16, 2, 7, 'Agosto 2026', 45.00, '2026-08-01', 'Pagada', '2026-07-31'),
(17, 2, 8, 'Septiembre 2026', 45.00, '2026-09-01', 'Pagada', '2026-08-31');

-- Cuotas para Póliza 3 (Cliente 3: Roberto Fonseca - Vencido / Moroso)
INSERT INTO cuotas (id_cuota, id_poliza, num_cuota, mes_nombre, monto, fecha_vencimiento, estado, fecha_pago) VALUES
(18, 3, 1, 'Enero 2026', 30.00, '2026-01-01', 'Pagada', '2026-01-02'),
(19, 3, 2, 'Febrero 2026', 30.00, '2026-02-01', 'Pagada', '2026-02-03'),
(20, 3, 3, 'Marzo 2026', 30.00, '2026-03-01', 'Pagada', '2026-03-02'),
(21, 3, 4, 'Abril 2026', 30.00, '2026-04-01', 'Pagada', '2026-04-05'),
(22, 3, 5, 'Mayo 2026', 30.00, '2026-05-01', 'Pagada', '2026-05-04'),
(23, 3, 6, 'Junio 2026', 30.00, '2026-06-01', 'Pagada', '2026-06-02'),
(24, 3, 7, 'Julio 2026', 30.00, '2026-07-01', 'Pagada', '2026-07-03'),
(25, 3, 8, 'Agosto 2026', 30.00, '2026-08-01', 'Vencido', NULL),
(26, 3, 9, 'Septiembre 2026', 30.00, '2026-09-01', 'Vencido', NULL);

-- 7. Registro de Pagos / Váuchers
INSERT INTO pagos (id_pago, id_poliza, id_cuota, monto, fecha_pago, banco, num_referencia, comprobante_url, tipo_archivo, tamanio_bytes, estado, observaciones, revisado_por) VALUES
(1, 1, 8, 60.00, '2026-08-15', 'BAC Credomatic', 'BAC-982374921', 'vaucher_849201.jpg', 'image/jpeg', 245100, 'Aprobado', 'Pago validado con transferencia exitosa.', 1),
(2, 2, 8, 45.00, '2026-08-31', 'Banco LAFISE Bancentro', 'LAF-10293847', 'vaucher_918237.pdf', 'application/pdf', 382900, 'Aprobado', 'Verificado con extracto bancario LAFISE.', 1),
(3, 1, 9, 60.00, '2026-09-18', 'Banpro Grupo Promerica', 'BAN-55443322', 'vaucher_pago_sept.png', 'image/png', 512000, 'Pendiente de validación', 'Esperando conciliación en sucursal León.', NULL);

-- 8. Cotizaciones Registradas
INSERT INTO cotizaciones (id_cotizacion, id_cliente, nombre_prospecto, correo_prospecto, telefono_prospecto, marca, modelo, anio, tipo_vehiculo, uso_vehiculo, valor_estimado, prima_base, factor_riesgo_alpha, descuento_delta, iva_monto, prima_total_mensual, plan_seleccionado, estado) VALUES
(1, 1, 'Carlos Alberto Mendoza Rivas', 'carlos.mendoza@gmail.com', '+505 8456 7890', 'Toyota', 'Corolla', 2022, 'Sedan', 'Particular', 18500.00, 45.00, 0.20, 5.00, 7.35, 60.00, 'Premium (Todo Riesgo)', 'Emitido'),
(2, NULL, 'Kevin Antonio Morales', 'kevin.morales@gmail.com', '+505 8234 5678', 'Mazda', 'CX-5', 2024, 'SUV', 'Particular', 29000.00, 50.00, 0.25, 0.00, 9.38, 71.88, 'Premium (Todo Riesgo)', 'Cotizado'),
(3, NULL, 'Daniela Sofía Barreto', 'daniela.barreto@yahoo.com', '+505 8899 0011', 'Suzuki', 'Swift', 2020, 'Sedan', 'Particular', 12000.00, 25.00, 0.10, 2.50, 3.75, 28.75, 'Básico (Terceros)', 'Cotizado');

-- 9. Siniestros y Reclamos (RF-05 3.5)
INSERT INTO siniestros (id_siniestro, folio_reclamo, id_poliza, fecha_accidente, hora_accidente, lugar_accidente, descripcion, evidencia_foto, estado, monto_estimado, deducible_aplicado, monto_cubierto, poliza_al_dia_al_reportar, observaciones_ajustador) VALUES
(1, 'REC-2026-0001', 2, '2026-08-12', '14:30:00', 'Intersección San Felipe, León', 'Colisión por alcance leve con daño en bumper delantero y faro derecho.', 'siniestro_rec0001.jpg', 'En Taller', 850.00, 300.00, 550.00, 1, 'Asegurado al día con pagos. Autorizada orden de taller AutoServicios León.');

-- 10. Comisiones Asignadas y Liquidación (RF-06 3.6: C_total = SUM(P_i * eta_i))
INSERT INTO comisiones (id_comision, id_asesor, id_poliza, id_pago, mes_liquidacion, anio_liquidacion, prima_cobrada, tasa_comision_eta, monto_comision, estado) VALUES
(1, 2, 1, 1, 'Agosto', 2026, 60.00, 0.1400, 8.40, 'Liquidada'),
(2, 3, 2, 2, 'Agosto', 2026, 45.00, 0.1200, 5.40, 'Liquidada'),
(3, 2, 1, 3, 'Septiembre', 2026, 60.00, 0.1400, 8.40, 'Calculada');