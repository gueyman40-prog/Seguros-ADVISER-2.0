<?php
require_once __DIR__ . '/config/conexion.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ADVISERS - Sistema de Gestión de Seguros (León, Nicaragua)</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- FontAwesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Estilos Personalizados Premium -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <!-- BARRA LATERAL (SIDEBAR) -->
    <aside class="sidebar" id="sidebar-menu">
        <div>
            <div class="brand-header text-center">
                <h4 class="brand-title justify-content-center">
                    <i class="fa-solid fa-shield-halved text-primary"></i> ADVISERS
                </h4>
                <div class="text-white-50 small mt-1" style="font-size: 0.75rem; letter-spacing: 0.05em;">
                    LEÓN, NICARAGUA • AGENCIA DE SEGUROS
                </div>
            </div>

            <nav class="nav-menu">
                <div class="nav-section-title">Portal de Clientes</div>
                <a href="javascript:void(0)" class="nav-link active" onclick="switchView('inicio', this)">
                    <span><i class="fa-solid fa-house"></i> Inicio</span>
                </a>
                <a href="javascript:void(0)" class="nav-link" onclick="switchView('cotizar', this)">
                    <span><i class="fa-solid fa-calculator text-info"></i> Cotizador Inteligente</span>
                </a>
                <a href="javascript:void(0)" class="nav-link" onclick="switchView('consultar-saldos', this)">
                    <span><i class="fa-solid fa-file-invoice-dollar text-success"></i> Consultar Saldos</span>
                </a>
                <a href="javascript:void(0)" class="nav-link" onclick="switchView('subir-pago', this)">
                    <span><i class="fa-solid fa-cloud-arrow-up text-primary"></i> Subir Váucher</span>
                </a>
                <a href="javascript:void(0)" class="nav-link" onclick="switchView('siniestros', this)">
                    <span><i class="fa-solid fa-car-burst text-danger"></i> Reportar Siniestro</span>
                </a>
                <a href="javascript:void(0)" class="nav-link" onclick="switchView('asesores', this)">
                    <span><i class="fa-solid fa-headset text-warning"></i> Asesores Asignados</span>
                </a>

                <div class="nav-section-title nav-agente-only">Operaciones & Administración</div>
                <a href="javascript:void(0)" class="nav-link nav-agente-only" onclick="switchView('panel-admin', this)">
                    <span><i class="fa-solid fa-table-columns text-primary"></i> Gestión de Cartera</span>
                </a>
                <a href="javascript:void(0)" class="nav-link nav-agente-only" onclick="switchView('siniestros-admin', this)">
                    <span><i class="fa-solid fa-clipboard-check text-danger"></i> Reclamos & Siniestros</span>
                </a>
                <a href="javascript:void(0)" class="nav-link nav-admin-only" onclick="switchView('aseguradoras', this)">
                    <span><i class="fa-solid fa-building-shield text-info"></i> Aseguradoras</span>
                </a>

                <div class="nav-section-title nav-gerente-only">Gerencia & Finanzas</div>
                <a href="javascript:void(0)" class="nav-link nav-gerente-only" onclick="switchView('gerencia-dashboard', this)">
                    <span><i class="fa-solid fa-chart-pie text-warning"></i> Dashboard Analítico</span>
                </a>
                <a href="javascript:void(0)" class="nav-link nav-gerente-only" onclick="switchView('comisiones', this)">
                    <span><i class="fa-solid fa-hand-holding-dollar text-success"></i> Liquidar Comisiones</span>
                </a>
            </nav>
        </div>

        <div class="user-card">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="text-truncate me-2">
                    <div class="text-white fw-bold small text-truncate" id="user-display-name">Visitante</div>
                    <span class="badge bg-secondary" id="user-role-badge">Público</span>
                </div>
                <button id="btn-auth-action" class="btn btn-outline-light btn-sm" onclick="abrirModalLogin()">
                    <i class="fa-solid fa-lock"></i>
                </button>
            </div>
        </div>
    </aside>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="main-content">
        
        <!-- BARRA SUPERIOR DE HERRAMIENTAS Y CAMBIO RÁPIDO DE ROL -->
        <header class="top-navbar no-print">
            <div class="d-flex align-items-center gap-3">
                <button class="btn btn-light mobile-nav-toggle d-none" onclick="document.getElementById('sidebar-menu').classList.toggle('show')">
                    <i class="fa-solid fa-bars"></i>
                </button>
                <div class="d-none d-md-block">
                    <span class="badge bg-light text-dark border px-3 py-2">
                        <i class="fa-solid fa-network-wired text-success me-1"></i> LAN Sucursal León: <strong>192.168.1.100</strong> (SIBOIF Compliant)
                    </span>
                </div>
            </div>

            <!-- DEMOSTRACIÓN RÁPIDA DE ROLES PARA EVALUACIÓN -->
            <div class="d-flex align-items-center gap-2">
                <span class="small text-muted d-none d-lg-inline fw-semibold"><i class="fa-solid fa-users-gear me-1"></i>Perfil Demo:</span>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary" onclick="cambiarRolRapido('Administrador')">Admin</button>
                    <button type="button" class="btn btn-outline-info" onclick="cambiarRolRapido('Agente')">Agente</button>
                    <button type="button" class="btn btn-outline-warning" onclick="cambiarRolRapido('Gerente')">Gerente</button>
                    <button type="button" class="btn btn-outline-secondary" onclick="cambiarRolRapido('Cliente')">Cliente</button>
                </div>
            </div>
        </header>

        <!-- ====================================================================
             1. VISTA: INICIO / PORTAL PRINCIPAL
             ==================================================================== -->
        <section id="view-inicio" class="view-pane active">
            <!-- Hero Banner -->
            <div class="p-5 rounded-4 mb-4 text-white position-relative overflow-hidden shadow-lg" 
                 style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(13, 110, 253, 0.88) 100%), 
                        url('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1200') no-repeat center center; 
                        background-size: cover; min-height: 320px; display: flex; align-items: center;">
                <div class="position-relative z-index-2 py-4 col-md-9 ps-md-4">
                    <span class="badge bg-primary text-white fw-bold mb-2 text-uppercase px-3 py-2" style="font-size: 0.75rem; letter-spacing: 0.08em;">
                        Correduría y Agencia de Seguros ADVISERS
                    </span>
                    <h1 class="display-5 fw-bold text-white mb-2" style="font-weight: 800; letter-spacing: -1px;">
                        Protección Integral para tu Vehículo en Nicaragua
                    </h1>
                    <p class="fs-6 text-white-50 mb-4 col-lg-10">
                        Gestionamos, cotizamos y emitimos pólizas en tiempo real con las principales compañías aseguradoras del país: <strong>ASSSA, Seguros América, INISER, Mapfre y LAFISE</strong>.
                    </p>
                    <div class="d-flex flex-wrap gap-3">
                        <button onclick="switchView('cotizar', document.querySelector('[onclick*=\'cotizar\']'))" class="btn btn-light btn-lg px-4 py-3 fw-bold text-primary shadow-sm">
                            <i class="fa-solid fa-calculator me-2"></i>Cotizar Seguro Ahora
                        </button>
                        <button onclick="switchView('consultar-saldos', document.querySelector('[onclick*=\'consultar-saldos\']'))" class="btn btn-outline-light btn-lg px-4 py-3 fw-bold">
                            <i class="fa-solid fa-magnifying-glass me-2"></i>Consultar Mi Póliza
                        </button>
                    </div>
                </div>
            </div>

            <!-- Accesos Rápidos a Módulos -->
            <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-layer-group text-primary me-2"></i>Servicios y Operaciones en Línea</h5>
            <div class="row g-4 mb-5">
                <div class="col-md-4">
                    <div onclick="switchView('cotizar')" class="card card-custom h-100 p-4 card-hover cursor-pointer border-0 bg-white shadow-sm" style="cursor: pointer;">
                        <div class="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center mb-3" style="width: 50px; height: 50px;">
                            <i class="fa-solid fa-calculator fs-4"></i>
                        </div>
                        <h5 class="fw-bold text-dark mb-1">Cotizador Paramétrico</h5>
                        <p class="text-muted small mb-0">Cálculo dinámico con factores de riesgo, deducibles e IVA del 15% conforme a la legislación de Nicaragua.</p>
                        <div class="mt-3 text-primary fw-bold small">Calcular Prima <i class="fa-solid fa-arrow-right ms-1"></i></div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div onclick="switchView('consultar-saldos')" class="card card-custom h-100 p-4 card-hover cursor-pointer border-0 bg-white shadow-sm" style="cursor: pointer;">
                        <div class="bg-success text-white rounded-3 d-flex align-items-center justify-content-center mb-3" style="width: 50px; height: 50px;">
                            <i class="fa-solid fa-file-invoice-dollar fs-4"></i>
                        </div>
                        <h5 class="fw-bold text-dark mb-1">Consulta en Tiempo Real</h5>
                        <p class="text-muted small mb-0">Revisa tu cronograma de cuotas, saldos pendientes y el semáforo de estado de tu póliza.</p>
                        <div class="mt-3 text-success fw-bold small">Ver Estado de Cuenta <i class="fa-solid fa-arrow-right ms-1"></i></div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div onclick="switchView('siniestros')" class="card card-custom h-100 p-4 card-hover cursor-pointer border-0 bg-white shadow-sm" style="cursor: pointer;">
                        <div class="bg-danger text-white rounded-3 d-flex align-items-center justify-content-center mb-3" style="width: 50px; height: 50px;">
                            <i class="fa-solid fa-car-burst fs-4"></i>
                        </div>
                        <h5 class="fw-bold text-dark mb-1">Reclamos y Siniestros</h5>
                        <p class="text-muted small mb-0">Apertura electrónica de expedientes con Folio Único y verificación automática de póliza solvente.</p>
                        <div class="mt-3 text-danger fw-bold small">Reportar Incidente <i class="fa-solid fa-arrow-right ms-1"></i></div>
                    </div>
                </div>
            </div>

            <!-- Aseguradoras Aliadas -->
            <div class="card card-custom p-4 bg-white border">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="fw-bold text-muted text-uppercase m-0" style="letter-spacing: 0.05em;">Aseguradoras Aliadas y Respaldadas en Nicaragua</h6>
                    <span class="badge bg-light text-primary border">100% Reguladas por SIBOIF</span>
                </div>
                <div class="row text-center g-3 align-items-center">
                    <div class="col-md-2 col-4"><div class="p-3 bg-light rounded-3 fw-bold text-primary">Seguros América</div></div>
                    <div class="col-md-2 col-4"><div class="p-3 bg-light rounded-3 fw-bold text-danger">INISER</div></div>
                    <div class="col-md-2 col-4"><div class="p-3 bg-light rounded-3 fw-bold text-success">ASSSA</div></div>
                    <div class="col-md-2 col-4"><div class="p-3 bg-light rounded-3 fw-bold text-dark">Mapfre</div></div>
                    <div class="col-md-2 col-4"><div class="p-3 bg-light rounded-3 fw-bold text-info">LAFISE Seguros</div></div>
                    <div class="col-md-2 col-4"><div class="p-3 bg-light rounded-3 fw-bold text-secondary">Ficohsa</div></div>
                </div>
            </div>
        </section>

        <!-- ====================================================================
             2. VISTA: COTIZADOR INTELIGENTE CON CÁLCULO PARAMÉTRICO (RF-01, RF-04 3.4)
             ==================================================================== -->
        <section id="view-cotizar" class="view-pane">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="fw-bold text-dark m-0">Cotizador Vehicular Paramétrico</h3>
                    <p class="text-muted small m-0">Fórmula de Tarifa: $P_t = P_b \cdot (1 + \alpha) - \delta + \text{IVA}(15\%)$ (Cumplimiento SIBOIF Nicaragua)</p>
                </div>
            </div>

            <div class="card card-custom p-4 bg-white border mb-4 shadow-sm">
                <form onsubmit="calcularCotizacion(event)">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label">Marca del Vehículo *</label>
                            <input type="text" name="marca" class="form-control" placeholder="Ej: Toyota, Hyundai, Nissan" required value="Toyota">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Modelo *</label>
                            <input type="text" name="modelo" class="form-control" placeholder="Ej: Corolla, Hilux, Tucson" required value="Corolla">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Año de Fabricación *</label>
                            <input type="number" name="anio" class="form-control" min="2000" max="2027" required value="2023">
                        </div>

                        <div class="col-md-4">
                            <label class="form-label">Tipo de Vehículo *</label>
                            <select name="tipo_vehiculo" class="form-select">
                                <option value="Sedan">Sedán (Riesgo Bajo +5%)</option>
                                <option value="SUV">SUV / Camioneta Cerrada (+10%)</option>
                                <option value="Camioneta">Camioneta de Trabajo (+15%)</option>
                                <option value="Camion">Camión / Carga Pesada (+30%)</option>
                                <option value="Motocicleta">Motocicleta (+35%)</option>
                            </select>
                        </div>

                        <div class="col-md-4">
                            <label class="form-label">Uso Destinado *</label>
                            <select name="uso_vehiculo" class="form-select">
                                <option value="Particular">Particular / Personal</option>
                                <option value="Comercial / Taxi">Comercial / Taxi / Transporte</option>
                                <option value="Carga">Carga y Distribución</option>
                            </select>
                        </div>

                        <div class="col-md-4">
                            <label class="form-label">Valor Comercial Estimado ($ USD) *</label>
                            <input type="number" name="valor_estimado" class="form-control" placeholder="18500" required value="18500">
                        </div>
                    </div>

                    <div class="mt-4 text-end">
                        <button type="submit" class="btn btn-primary fw-bold px-5 py-2 shadow-sm">
                            <i class="fa-solid fa-calculator me-2"></i>Calcular Coberturas y Tarifas
                        </button>
                    </div>
                </form>
            </div>

            <!-- RESULTADOS DEL CÁLCULO -->
            <div id="box-planes-calculados" class="d-none">
                <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-shield-halved text-success me-2"></i>Opciones Parametrizadas Disponibles</h5>
                <div class="row g-4" id="container-cards-planes"></div>
            </div>
        </section>

        <!-- ====================================================================
             3. VISTA: CONSULTA DE SALDOS EN TIEMPO REAL (RF-02 1.2)
             ==================================================================== -->
        <section id="view-consultar-saldos" class="view-pane">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h3 class="fw-bold text-dark m-0">Portal de Consulta de Saldos y Pólizas</h3>
                    <p class="text-muted small m-0">Monitoreo en tiempo real de saldos, vigencias y semáforo de estado de cuotas</p>
                </div>
                <div class="input-group" style="max-width: 360px;">
                    <span class="input-group-text bg-white border-end-0"><i class="fa-solid fa-id-card text-muted"></i></span>
                    <input type="text" id="search-saldo-input" class="form-control border-start-0" placeholder="Ingrese Cédula (Ej: 281-...) o Póliza" value="281-150890-0004A">
                    <button class="btn btn-primary fw-bold" onclick="consultarSaldos()">Buscar</button>
                </div>
            </div>

            <div id="container-resultado-saldos"></div>
        </section>

        <!-- ====================================================================
             4. VISTA: SUBIDA SEGURA DE VÁUCHERS Y PAGOS (RF-03 1.3)
             ==================================================================== -->
        <section id="view-subir-pago" class="view-pane">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="fw-bold text-dark m-0">Módulo de Subida de Váuchers y Comprobantes</h3>
                    <p class="text-muted small m-0">Carga segura de comprobantes de transferencias bancarias para conciliación administrativa</p>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-lg-7">
                    <div class="card card-custom p-4 bg-white border shadow-sm">
                        <form onsubmit="procesarSubidaVaucher(event)" enctype="multipart/form-data">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">ID de Póliza o Cédula *</label>
                                    <input type="number" name="id_poliza" class="form-control" placeholder="1" required value="1">
                                    <small class="text-muted">Póliza asociada al asegurado</small>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Monto Depositado ($ USD) *</label>
                                    <input type="number" step="0.01" name="monto" class="form-control" placeholder="60.00" required value="60.00">
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Banco Emisor de la Transferencia *</label>
                                    <select name="banco" class="form-select">
                                        <option>BAC Credomatic</option>
                                        <option>Banco LAFISE Bancentro</option>
                                        <option>Banpro Grupo Promerica</option>
                                        <option>BDF</option>
                                        <option>Ficohsa</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Número de Referencia Bancaria *</label>
                                    <input type="text" name="num_referencia" class="form-control" placeholder="Ej: TR-89283749" required>
                                </div>

                                <div class="col-12">
                                    <label class="form-label">Comprobante o Váucher Digital (JPG, PNG, PDF - Máx 5MB) *</label>
                                    <input type="file" name="comprobante" id="vaucher-file" class="form-control" accept=".jpg,.jpeg,.png,.pdf" required>
                                    <div class="form-text small text-danger">
                                        <i class="fa-solid fa-shield me-1"></i> Por seguridad, ejecutables (.exe, .bat, .sh) son bloqueados automáticamente por el servidor.
                                    </div>
                                </div>
                            </div>

                            <!-- Barra de Progreso de Subida -->
                            <div id="vaucher-progress-wrapper" class="mt-3 d-none">
                                <div class="progress" style="height: 10px;">
                                    <div id="vaucher-progress" class="progress-bar progress-bar-striped progress-bar-animated bg-success" style="width: 0%"></div>
                                </div>
                                <small class="text-muted mt-1 d-block">Subiendo archivo de forma segura...</small>
                            </div>

                            <div class="mt-4 text-end">
                                <button type="submit" class="btn btn-success fw-bold px-5 py-2">
                                    <i class="fa-solid fa-upload me-2"></i>Enviar Váucher a Verificación
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="col-lg-5">
                    <div class="card card-custom p-4 bg-white border h-100">
                        <h6 class="fw-bold text-dark mb-3"><i class="fa-solid fa-circle-info text-primary me-2"></i>Cuentas Bancarias de ADVISERS (León)</h6>
                        <ul class="list-group list-group-flush small mb-4">
                            <li class="list-group-item px-0"><strong>BAC Credomatic:</strong> 362-984019-2 ($ USD)</li>
                            <li class="list-group-item px-0"><strong>LAFISE Bancentro:</strong> 109-283746-1 ($ USD)</li>
                            <li class="list-group-item px-0"><strong>Banpro Promerica:</strong> 1002-847291-0 ($ USD)</li>
                        </ul>
                        <div class="alert alert-info small mb-0">
                            <i class="fa-solid fa-clock me-1"></i> La validación administrativa se completa en menos de <strong>30 minutos</strong> y actualiza de inmediato el saldo de tu póliza.
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ====================================================================
             5. VISTA: REPORTE DE SINIESTROS CON VALIDACIÓN DE SOLVENCIA (RF-05 3.5)
             ==================================================================== -->
        <section id="view-siniestros" class="view-pane">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="fw-bold text-dark m-0">Centro de Apertura Electrónica de Siniestros</h3>
                    <p class="text-muted small m-0">Generación de Folio Único (REC-2026-XXXX) y verificación automática de solvencia</p>
                </div>
            </div>

            <div class="card card-custom p-4 bg-white border mb-4 shadow-sm">
                <!-- Paso 1: Verificación de Solvencia -->
                <div class="row g-3 align-items-end mb-3">
                    <div class="col-md-8">
                        <label class="form-label fw-bold">Paso 1: Ingrese su Número de Póliza o Cédula para Validar Cobertura</label>
                        <input type="text" id="sin-poliza-search" class="form-control" placeholder="POL-2026-ADV-001 o Cédula" value="POL-2026-ADV-001">
                    </div>
                    <div class="col-md-4">
                        <button type="button" onclick="verificarSolvenciaSiniestro()" class="btn btn-dark w-100 fw-bold">
                            <i class="fa-solid fa-user-check me-2"></i>Verificar Solvencia
                        </button>
                    </div>
                </div>

                <div id="solvencia-siniestro-feedback" class="alert d-none mb-4"></div>

                <!-- Paso 2: Formulario del Accidente -->
                <form onsubmit="registrarSiniestro(event)" enctype="multipart/form-data">
                    <input type="hidden" name="id_poliza" id="sin-id-poliza" value="1">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label">Fecha del Accidente *</label>
                            <input type="date" name="fecha_accidente" class="form-control" required value="<?php echo date('Y-m-d'); ?>">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Hora Aproximada *</label>
                            <input type="time" name="hora_accidente" class="form-control" required value="10:30">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Monto Estimado de Daños ($ USD)</label>
                            <input type="number" name="monto_estimado" class="form-control" value="650">
                        </div>

                        <div class="col-12">
                            <label class="form-label">Lugar Exacto del Percance Vial *</label>
                            <input type="text" name="lugar_accidente" class="form-control" placeholder="Ej: Carretera León - Chinandega km 98" required value="Del Empalme de León 100 vrs al Sur">
                        </div>

                        <div class="col-12">
                            <label class="form-label">Descripción de los Hechos *</label>
                            <textarea name="descripcion" class="form-control" rows="3" placeholder="Detalla cómo ocurrió el incidente, impacto o daños a terceros..." required>Colisión en intersección por giro indebido de otro vehículo. Daño en puerta lateral y espejo retrovisor.</textarea>
                        </div>

                        <div class="col-12">
                            <label class="form-label">Evidencia Fotográfica de los Daños (Opcional)</label>
                            <input type="file" name="evidencia_foto" class="form-control" accept="image/*">
                        </div>
                    </div>

                    <div class="mt-4 text-end">
                        <button type="submit" id="btn-submit-siniestro" class="btn btn-danger fw-bold px-5 py-2">
                            <i class="fa-solid fa-file-circle-exclamation me-2"></i>Aperturar Expediente de Reclamo
                        </button>
                    </div>
                </form>
            </div>
        </section>

        <!-- ====================================================================
             6. VISTA: ASESORES ASIGNADOS (ATENCIÓN AL CLIENTE)
             ==================================================================== -->
        <section id="view-asesores" class="view-pane">
            <h3 class="fw-bold text-dark mb-2">Equipo de Asesores Comerciales</h3>
            <p class="text-muted mb-4">Atención personalizada y soporte directo para asegurados en León y el occidente del país:</p>

            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card card-custom p-4 bg-white text-center h-100 card-hover border shadow-sm">
                        <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 70px; height: 70px;">
                            <i class="fa-solid fa-user-tie fs-2"></i>
                        </div>
                        <h5 class="fw-bold text-dark mb-1">Jorvin Leonel Arteaga</h5>
                        <span class="badge bg-primary mb-2">Consultor Ejecutivo (Tasa 14%)</span>
                        <p class="text-muted small"><i class="fa-solid fa-phone me-1"></i>+505 7798 9543</p>
                        <div class="d-grid gap-2 mt-auto">
                            <a href="https://wa.me/50577989543" target="_blank" class="btn btn-success btn-sm fw-bold"><i class="fa-brands fa-whatsapp me-1"></i> WhatsApp</a>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card card-custom p-4 bg-white text-center h-100 card-hover border shadow-sm">
                        <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 70px; height: 70px;">
                            <i class="fa-solid fa-user-gear fs-2"></i>
                        </div>
                        <h5 class="fw-bold text-dark mb-1">Francisco Leonardo Bravo</h5>
                        <span class="badge bg-info text-dark mb-2">Asesor Corporativo (Tasa 12%)</span>
                        <p class="text-muted small"><i class="fa-solid fa-phone me-1"></i>+505 8627 8780</p>
                        <div class="d-grid gap-2 mt-auto">
                            <a href="https://wa.me/50586278780" target="_blank" class="btn btn-success btn-sm fw-bold"><i class="fa-brands fa-whatsapp me-1"></i> WhatsApp</a>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card card-custom p-4 bg-white text-center h-100 card-hover border shadow-sm">
                        <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 70px; height: 70px;">
                            <i class="fa-solid fa-user-shield fs-2"></i>
                        </div>
                        <h5 class="fw-bold text-dark mb-1">Joshua Fernando Salazar</h5>
                        <span class="badge bg-warning text-dark mb-2">Gerente Comercial</span>
                        <p class="text-muted small"><i class="fa-solid fa-phone me-1"></i>+505 8999 4444</p>
                        <div class="d-grid gap-2 mt-auto">
                            <a href="https://wa.me/50589994444" target="_blank" class="btn btn-success btn-sm fw-bold"><i class="fa-brands fa-whatsapp me-1"></i> WhatsApp</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ====================================================================
             7. VISTA: PANEL ADMINISTRATIVO CRUD (RF-04 1.4)
             ==================================================================== -->
        <section id="view-panel-admin" class="view-pane">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="fw-bold text-dark m-0">Panel Integral de Gestión de Cartera</h3>
                    <p class="text-muted small m-0">Administración de Clientes, Emisión de Pólizas con Contratos PDF y Conciliación de Pagos</p>
                </div>
                <div class="d-flex gap-2">
                    <a href="api/backup.php" class="btn btn-outline-dark btn-sm fw-bold">
                        <i class="fa-solid fa-database me-1"></i> Descargar Backup SQL
                    </a>
                </div>
            </div>

            <ul class="nav nav-pills mb-4" id="adminTabs" role="tablist">
                <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="pill" data-bs-target="#tab-admin-polizas">
                        <i class="fa-solid fa-shield-halved me-1"></i> Pólizas Emitidas
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="pill" data-bs-target="#tab-admin-clientes">
                        <i class="fa-solid fa-users me-1"></i> Clientes & Cédulas
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="pill" data-bs-target="#tab-admin-pagos">
                        <i class="fa-solid fa-receipt me-1"></i> Váuchers por Validar
                    </button>
                </li>
            </ul>

            <div class="tab-content">
                <!-- TAB PÓLIZAS -->
                <div class="tab-pane fade show active" id="tab-admin-polizas">
                    <div class="card card-custom p-4 bg-white border">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="fw-bold m-0">Registro de Pólizas Contractuales</h5>
                            <button class="btn btn-primary btn-sm fw-bold" data-bs-toggle="modal" data-bs-target="#modalNuevaPoliza">
                                <i class="fa-solid fa-plus me-1"></i> Emitir Nueva Póliza
                            </button>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-custom align-middle">
                                <thead>
                                    <tr>
                                        <th>Núm. Póliza</th>
                                        <th>Cliente / Cédula</th>
                                        <th>Vehículo</th>
                                        <th>Aseguradora</th>
                                        <th>Prima</th>
                                        <th>Saldo</th>
                                        <th>Estado</th>
                                        <th class="text-end">Acción</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody-admin-polizas"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- TAB CLIENTES -->
                <div class="tab-pane fade" id="tab-admin-clientes">
                    <div class="card card-custom p-4 bg-white border">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="fw-bold m-0">Cartera de Clientes Registrados</h5>
                            <button class="btn btn-primary btn-sm fw-bold" data-bs-toggle="modal" data-bs-target="#modalNuevoCliente">
                                <i class="fa-solid fa-user-plus me-1"></i> Registrar Cliente
                            </button>
                        </div>
                        <div class="mb-3">
                            <input type="text" id="search-cliente-input" class="form-control" placeholder="Filtrar por nombre o cédula..." onkeyup="cargarClientesAdmin()">
                        </div>
                        <div class="table-responsive">
                            <table class="table table-custom align-middle">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre Completo</th>
                                        <th>Cédula Única</th>
                                        <th>Teléfono</th>
                                        <th>Correo</th>
                                        <th>Departamento</th>
                                        <th>Pólizas</th>
                                        <th class="text-end">Acción</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody-admin-clientes"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- TAB VÁUCHERS -->
                <div class="tab-pane fade" id="tab-admin-pagos">
                    <div class="card card-custom p-4 bg-white border">
                        <h5 class="fw-bold mb-3">Revisión y Conciliación Administrativa de Váuchers</h5>
                        <div class="table-responsive">
                            <table class="table table-custom align-middle">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Cliente / Póliza</th>
                                        <th>Banco / Ref</th>
                                        <th>Monto</th>
                                        <th>Fecha</th>
                                        <th>Archivo</th>
                                        <th>Estado</th>
                                        <th class="text-end">Validar</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody-admin-pagos"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ====================================================================
             8. VISTA: GESTIÓN DE RECLAMOS Y SINIESTROS ADMIN (RF-05 3.5)
             ==================================================================== -->
        <section id="view-siniestros-admin" class="view-pane">
            <h3 class="fw-bold text-dark mb-4">Módulo de Reclamos y Siniestros (Ajustador)</h3>
            <div class="card card-custom p-4 bg-white border">
                <div class="table-responsive">
                    <table class="table table-custom align-middle">
                        <thead>
                            <tr>
                                <th>Folio Único</th>
                                <th>Cliente / Póliza</th>
                                <th>Vehículo</th>
                                <th>Fecha Accidente</th>
                                <th>Lugar</th>
                                <th>Estado</th>
                                <th>Monto Estimado</th>
                                <th>Monto Cubierto</th>
                                <th class="text-end">Gestionar</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-admin-siniestros"></tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- ====================================================================
             9. VISTA: ASEGURADORAS SOCIAS (RF-04)
             ==================================================================== -->
        <section id="view-aseguradoras" class="view-pane">
            <h3 class="fw-bold text-dark mb-4">Catálogo de Aseguradoras Aliadas (Nicaragua)</h3>
            <div class="card card-custom p-4 bg-white border">
                <div class="table-responsive">
                    <table class="table table-custom align-middle">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Compañía</th>
                                <th>RUC</th>
                                <th>Teléfono</th>
                                <th>Correo</th>
                                <th>Comisión Base</th>
                                <th>Pólizas Suscritas</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-admin-aseguradoras"></tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- ====================================================================
             10. VISTA: LIQUIDACIÓN DE COMISIONES (RF-06 3.6)
             Formula: C_total = SUM( P_i * eta_i )
             ==================================================================== -->
        <section id="view-comisiones" class="view-pane">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h3 class="fw-bold text-dark m-0">Módulo Financiero y Liquidación de Comisiones</h3>
                    <p class="text-muted small m-0">Fórmula de Liquidación de Honorarios: $C_{total} = \sum_{i=1}^n (P_i \cdot \eta_i)$</p>
                </div>
                <div class="d-flex gap-2">
                    <select id="filtro-comision-mes" class="form-select form-select-sm" onchange="cargarComisiones()">
                        <option value="">Todos los Meses</option>
                        <option value="Enero">Enero</option>
                        <option value="Febrero">Febrero</option>
                        <option value="Marzo">Marzo</option>
                        <option value="Abril">Abril</option>
                        <option value="Mayo">Mayo</option>
                        <option value="Junio">Junio</option>
                        <option value="Julio">Julio</option>
                        <option value="Agosto" selected>Agosto</option>
                        <option value="Septiembre">Septiembre</option>
                        <option value="Octubre">Octubre</option>
                        <option value="Noviembre">Noviembre</option>
                        <option value="Diciembre">Diciembre</option>
                    </select>
                    <button onclick="window.print()" class="btn btn-outline-secondary btn-sm no-print">
                        <i class="fa-solid fa-print me-1"></i> Imprimir Estado de Cuenta
                    </button>
                </div>
            </div>

            <!-- Resumen Financiero -->
            <div class="row g-4 mb-4">
                <div class="col-md-4">
                    <div class="kpi-card border-start border-primary border-4">
                        <div class="kpi-label">Primas Totales Cobradas</div>
                        <div class="kpi-value text-primary" id="com-total-primas">$0.00</div>
                        <small class="text-muted">Base de cálculo ($\sum P_i$)</small>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="kpi-card border-start border-success border-4">
                        <div class="kpi-label">Comisiones Devengadas ($C_{total}$)</div>
                        <div class="kpi-value text-success" id="com-total-comisiones">$0.00</div>
                        <small class="text-muted">Total liquidado a la fuerza de ventas</small>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="kpi-card border-start border-warning border-4">
                        <div class="kpi-label">Transacciones Conciliadas</div>
                        <div class="kpi-value text-warning" id="com-total-ops">0</div>
                        <small class="text-muted">Operaciones aprobadas</small>
                    </div>
                </div>
            </div>

            <!-- Tabla Resumen por Asesor -->
            <div class="card card-custom p-4 bg-white border mb-4">
                <h5 class="fw-bold mb-3"><i class="fa-solid fa-users me-2 text-primary"></i>Liquidación Consolidada por Asesor Comercial</h5>
                <div class="table-responsive">
                    <table class="table table-custom align-middle">
                        <thead>
                            <tr>
                                <th>Asesor Comercial</th>
                                <th>Tasa Pactada ($\eta_i$)</th>
                                <th>Transacciones</th>
                                <th>Primas Cobradas ($P_i$)</th>
                                <th>Comisión Devengada ($C_{total}$)</th>
                                <th>Pendiente de Pago</th>
                                <th class="no-print">Acción</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-comisiones-asesores"></tbody>
                    </table>
                </div>
            </div>

            <!-- Detalle Individual de Comisiones -->
            <div class="card card-custom p-4 bg-white border">
                <h5 class="fw-bold mb-3"><i class="fa-solid fa-list me-2 text-primary"></i>Detalle de Transacciones Individuales</h5>
                <div class="table-responsive">
                    <table class="table table-custom align-middle">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Asesor</th>
                                <th>Póliza</th>
                                <th>Período</th>
                                <th>Prima ($P_i$)</th>
                                <th>Tasa ($\eta_i$)</th>
                                <th>Comisión Calculada</th>
                                <th>Estado</th>
                                <th class="no-print">Acción</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-comisiones-detalle"></tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- ====================================================================
             11. VISTA: DASHBOARD ANALÍTICO GERENCIA GENERAL (RNF-03, EDT 1.3)
             ==================================================================== -->
        <section id="view-gerencia-dashboard" class="view-pane">
            <h3 class="fw-bold text-dark mb-1">Tablero Analítico Ejecutivo</h3>
            <p class="text-muted small mb-4">Indicadores clave de rendimiento (KPIs), siniestralidad y recaudación de la Agencia ADVISERS</p>

            <div class="row g-4 mb-4">
                <div class="col-lg-3 col-sm-6">
                    <div class="kpi-card">
                        <div class="kpi-label">Pólizas Activas</div>
                        <div class="kpi-value text-primary" id="dash-polizas-activas">0</div>
                        <span class="badge bg-success-subtle text-success small">Cartera Vigente</span>
                    </div>
                </div>
                <div class="col-lg-3 col-sm-6">
                    <div class="kpi-card">
                        <div class="kpi-label">Recaudación Total</div>
                        <div class="kpi-value text-success" id="dash-recaudacion-total">$0.00</div>
                        <span class="badge bg-primary-subtle text-primary small">Primas Cobradas</span>
                    </div>
                </div>
                <div class="col-lg-3 col-sm-6">
                    <div class="kpi-card">
                        <div class="kpi-label">Saldo por Recaudar</div>
                        <div class="kpi-value text-warning" id="dash-saldo-pendiente">$0.00</div>
                        <span class="badge bg-warning-subtle text-warning small">Cuentas por Cobrar</span>
                    </div>
                </div>
                <div class="col-lg-3 col-sm-6">
                    <div class="kpi-card">
                        <div class="kpi-label">Clientes Registrados</div>
                        <div class="kpi-value text-dark" id="dash-total-clientes">0</div>
                        <span class="badge bg-light text-dark border small">León, Nicaragua</span>
                    </div>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-lg-6">
                    <div class="card card-custom p-4 bg-white border h-100">
                        <h5 class="fw-bold mb-3"><i class="fa-solid fa-chart-column text-primary me-2"></i>Distribución de Cartera por Aseguradora</h5>
                        <div id="dash-aseguradoras-lista"></div>
                    </div>
                </div>

                <div class="col-lg-6">
                    <div class="card card-custom p-4 bg-white border h-100">
                        <h5 class="fw-bold mb-3"><i class="fa-solid fa-trophy text-warning me-2"></i>Ranking de Rendimiento por Asesor</h5>
                        <div class="table-responsive">
                            <table class="table table-custom align-middle">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Asesor</th>
                                        <th>Ventas</th>
                                        <th>Primas Recaudadas</th>
                                        <th>Comisión</th>
                                    </tr>
                                </thead>
                                <tbody id="dash-ranking-asesores"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="col-12">
                    <div class="card card-custom p-4 bg-white border">
                        <div class="row align-items-center">
                            <div class="col-md-4">
                                <h6 class="text-muted fw-bold">Índice de Siniestralidad:</h6>
                                <h3 class="fw-bold text-danger m-0" id="dash-total-siniestros">0 casos</h3>
                            </div>
                            <div class="col-md-4">
                                <h6 class="text-muted fw-bold">Monto Indemnizado:</h6>
                                <h3 class="fw-bold text-dark m-0" id="dash-indemnizado">$0.00</h3>
                            </div>
                            <div class="col-md-4 text-md-end">
                                <button onclick="switchView('comisiones')" class="btn btn-primary fw-bold">
                                    <i class="fa-solid fa-file-invoice-dollar me-1"></i> Ir a Liquidación Financiera
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    </main>

    <!-- ====================================================================
         MODALES DEL SISTEMA
         ==================================================================== -->

    <!-- Modal Login (RNF-01, RF-01 3.1) -->
    <div class="modal fade" id="modalLogin" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content p-4 rounded-4 shadow border-0">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title fw-bold text-dark"><i class="fa-solid fa-shield-halved text-primary me-2"></i>Acceso Seguro ADVISERS</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p class="small text-muted mb-3">Ingresa tus credenciales autorizadas. El sistema bloqueará el acceso tras <strong>3 intentos fallidos consecutivos</strong> para mitigar ataques de fuerza bruta.</p>

                    <div id="login-alert" class="alert d-none"></div>

                    <form onsubmit="procesarLogin(event)">
                        <div class="mb-3">
                            <label class="form-label">Correo Electrónico</label>
                            <input type="email" name="correo" class="form-control" placeholder="ejemplo@advisers.com.ni" required value="admin@advisers.com.ni">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Contraseña</label>
                            <input type="password" name="contrasena" class="form-control" placeholder="••••••••" required value="admin123">
                        </div>
                        <button type="submit" class="btn btn-primary w-100 fw-bold py-2 shadow-sm">
                            <i class="fa-solid fa-right-to-bracket me-1"></i> Iniciar Sesión
                        </button>
                    </form>

                    <hr class="my-4">
                    <div class="small text-muted text-center mb-2">Credenciales demo preconfiguradas (Clave común: <code>123</code>):</div>
                    <div class="d-flex flex-wrap justify-content-center gap-1">
                        <span class="badge bg-light text-dark border">admin@advisers.com.ni (admin123)</span>
                        <span class="badge bg-light text-dark border">jorvin.arteaga@advisers.com.ni (agente123)</span>
                        <span class="badge bg-light text-dark border">gerencia@advisers.com.ni (gerente123)</span>
                        <span class="badge bg-light text-dark border">carlos.mendoza@gmail.com (cliente123)</span>
                    </div>

                    <div class="text-center mt-3">
                        <button type="button" onclick="resetearIntentosBruteForce()" class="btn btn-link btn-sm text-secondary">
                            <i class="fa-solid fa-rotate-left me-1"></i> Restablecer intentos de fuerza bruta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Nuevo Cliente (RF-02 3.2: Cédula Única) -->
    <div class="modal fade" id="modalNuevoCliente" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content p-4 rounded-4 shadow border-0">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title fw-bold text-dark"><i class="fa-solid fa-user-plus text-primary me-2"></i>Registrar Nuevo Cliente</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form onsubmit="registrarClienteModal(event)">
                        <div class="mb-3">
                            <label class="form-label">Cédula Nicaragüense (Única) *</label>
                            <input type="text" name="cedula" class="form-control" placeholder="281-200595-0002F" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Nombre Completo *</label>
                            <input type="text" name="nombre_completo" class="form-control" placeholder="Ej: Juan Pérez Morales" required>
                        </div>
                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <label class="form-label">Teléfono *</label>
                                <input type="text" name="telefono" class="form-control" placeholder="+505 8888 7777" required>
                            </div>
                            <div class="col-6">
                                <label class="form-label">Correo *</label>
                                <input type="email" name="correo" class="form-control" placeholder="cliente@correo.com" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Dirección Domiciliar</label>
                            <textarea name="direccion" class="form-control" rows="2" placeholder="Barrio El Sagrario, León"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary w-100 fw-bold py-2">Guardar Cliente</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Nueva Póliza (RF-03 3.3) -->
    <div class="modal fade" id="modalNuevaPoliza" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content p-4 rounded-4 shadow border-0">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title fw-bold text-dark"><i class="fa-solid fa-file-contract text-primary me-2"></i>Emisión Contractual de Póliza</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form onsubmit="registrarPolizaModal(event)" enctype="multipart/form-data">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">Cliente Titular *</label>
                                <select name="id_cliente" id="em-cliente" class="form-select" required></select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Aseguradora Suscriptora *</label>
                                <select name="id_aseguradora" id="em-aseguradora" class="form-select" required></select>
                            </div>

                            <div class="col-md-4">
                                <label class="form-label">Marca *</label>
                                <input type="text" name="marca" id="em-marca" class="form-control" required value="Toyota">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Modelo *</label>
                                <input type="text" name="modelo" id="em-modelo" class="form-control" required value="Hilux">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Año *</label>
                                <input type="number" name="anio" id="em-anio" class="form-control" required value="2024">
                            </div>

                            <div class="col-md-4">
                                <label class="form-label">Tipo de Vehículo</label>
                                <input type="text" name="tipo_vehiculo" id="em-tipo" class="form-control" value="Camioneta">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Uso</label>
                                <input type="text" name="uso_vehiculo" id="em-uso" class="form-control" value="Particular">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Valor Estimado ($)</label>
                                <input type="number" name="valor_estimado" id="em-valor" class="form-control" value="28000">
                            </div>

                            <div class="col-md-4">
                                <label class="form-label">Tipo de Cobertura</label>
                                <select name="tipo_cobertura" id="em-cobertura" class="form-select">
                                    <option value="Premium (Todo Riesgo)">Premium (Todo Riesgo)</option>
                                    <option value="Intermedio (Amplio)">Intermedio (Amplio)</option>
                                    <option value="Básico (Terceros)">Básico (Terceros)</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Deducible ($)</label>
                                <input type="number" name="deducible" id="em-deducible" class="form-control" value="250">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Prima Mensual ($ USD) *</label>
                                <input type="number" step="0.01" name="prima_mensual" id="em-prima-mensual" class="form-control" required value="65.00">
                            </div>

                            <div class="col-12">
                                <label class="form-label">Adjuntar Contrato Digital Oficial (PDF) *</label>
                                <input type="file" name="documento_contrato" class="form-control" accept=".pdf">
                                <small class="text-muted">El archivo contractual PDF quedará indexado en el expediente digital del cliente.</small>
                            </div>
                        </div>

                        <div class="mt-4 text-end">
                            <button type="submit" class="btn btn-primary fw-bold px-4 py-2">Emitir Póliza y Generar 12 Cuotas</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Subir Váucher desde Estado de Cuenta -->
    <div class="modal fade" id="modalSubirVaucher" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content p-4 rounded-4 shadow border-0">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title fw-bold text-dark"><i class="fa-solid fa-cloud-arrow-up text-primary me-2"></i>Reportar Pago de Cuota</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p class="small text-muted" id="vaucher-info-cuota"></p>
                    <form onsubmit="procesarSubidaVaucher(event)" enctype="multipart/form-data">
                        <input type="hidden" name="id_poliza" id="vaucher-poliza-id">
                        <input type="hidden" name="id_cuota" id="vaucher-cuota-id">

                        <div class="mb-3">
                            <label class="form-label">Monto ($ USD) *</label>
                            <input type="number" step="0.01" name="monto" id="vaucher-monto" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Banco de Destino *</label>
                            <select name="banco" class="form-select">
                                <option>BAC Credomatic</option>
                                <option>Banco LAFISE Bancentro</option>
                                <option>Banpro Grupo Promerica</option>
                                <option>BDF</option>
                                <option>Ficohsa</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Número de Referencia de Transferencia *</label>
                            <input type="text" name="num_referencia" class="form-control" placeholder="Ej: 98127391" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Archivo Váucher (JPG, PNG o PDF) *</label>
                            <input type="file" name="comprobante" class="form-control" accept=".jpg,.jpeg,.png,.pdf" required>
                        </div>

                        <button type="submit" class="btn btn-success w-100 fw-bold py-2">Enviar Váucher a Verificación</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Éxito Siniestro -->
    <div class="modal fade" id="modalSiniestroExito" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content p-4 rounded-4 shadow border-0 text-center">
                <div class="text-success mb-3"><i class="fa-solid fa-circle-check display-3"></i></div>
                <h4 class="fw-bold text-dark mb-1">¡Expediente de Siniestro Aperturado!</h4>
                <p class="text-muted small">La póliza fue validada solvente. Se ha asignado el siguiente folio oficial de seguimiento:</p>
                <div class="p-3 bg-light rounded-3 my-3">
                    <span class="display-6 fw-bold text-danger" id="folio-creado-display">REC-2026-0001</span>
                </div>
                <p class="small text-muted">Un ajustador de la Agencia ADVISERS en León se comunicará en breve con usted.</p>
                <button type="button" class="btn btn-dark w-100 fw-bold" data-bs-dismiss="modal">Entendido</button>
            </div>
        </div>
    </div>

    <!-- TOAST NOTIFICACIONES -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
        <div id="appToast" class="toast align-items-center border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body fw-bold" id="toastMessage"></div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    </div>

    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Lógica de la Aplicación -->
    <script src="assets/js/app.js"></script>
</body>
</html>
