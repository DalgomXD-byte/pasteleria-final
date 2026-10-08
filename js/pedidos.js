// =========================================================
// PEDIDOS DEL PERSONAL: bandeja, detalle del pedido, delivery y entregas
// La usan el cajero, el administrador y el repartidor.
// Necesita datos.js (se carga antes en cada página).
// =========================================================

const REPARTIDOR = 'Jorge Mendoza';            // sesión simulada del repartidor
let puedeCambiarDespacho = false;              // en Delivery, solo el administrador cambia el estado

// ---------- Estados (RN-20: solo avanzan, se puede saltar uno, nunca retroceder) ----------
function siguientes(actual, delRol) {
  return delRol.filter(e => ESTADOS.indexOf(e) > ESTADOS.indexOf(actual));
}

// Lista con todos los estados: el actual marcado y en gris los que no se pueden elegir
function listaEstados(actual, permitidos) {
  let opciones = '';
  for (const e of ESTADOS) {
    if (e === actual) {
      opciones += `<option value="" selected disabled>${textoEstado(e)} (actual)</option>`;
    } else {
      opciones += `<option value="${e}" ${permitidos.includes(e) ? '' : 'disabled'}>${textoEstado(e)}</option>`;
    }
  }
  return `<select name="estado" required aria-label="Nuevo estado">${opciones}</select>`;
}

function cambiarEstado(bd, pedido, estado) {
  pedido.estado = estado;
  pedido.historial.push({ estado, hora: ahora() });      // RN-23: cada cambio guarda su hora
  guardar(bd);
}

// ---------- Bandeja de pedidos (funcionalidad 12) ----------
function mostrarBandeja() {
  const web = cargar().pedidos.filter(p => p.canal === 'WEB');
  const cuantos = estado => web.filter(p => p.estado === estado).length;
  document.getElementById('kpi-recibidos').textContent = cuantos('RECIBIDO');
  document.getElementById('kpi-preparacion').textContent = cuantos('EN_PREPARACION');
  document.getElementById('kpi-listos').textContent = cuantos('LISTO');
  document.getElementById('kpi-cancelados').textContent = cuantos('CANCELADO');

  const filtro = document.getElementById('filtro-estado').value;
  let filas = '';
  for (const p of web) {
    if (filtro !== 'TODOS' && p.estado !== filtro) continue;
    filas += `
      <tr>
        <td>${p.codigo}</td>
        <td>${p.cliente}</td>
        <td>${p.historial[0].hora}</td>
        <td>${p.pago}</td>
        <td>${p.operacion || '—'}</td>
        <td>${soles(totalDe(p.productos))}</td>
        <td>${etiqueta(p.estado)}</td>
        <td>${accionDe(p)}</td>
      </tr>`;
  }
  document.getElementById('filas').innerHTML = filas || '<tr><td colspan="8">No hay pedidos con ese estado.</td></tr>';
}

// Lo que se puede hacer con el pedido según su estado
function accionDe(p) {
  const ver = `pedido.html?codigo=${p.codigo}`;
  if (p.estado === 'RECIBIDO') return `<a href="${ver}" class="boton">Atender</a>`;
  if (p.estado === 'EN_PREPARACION') return `<a href="${ver}" class="boton boton-secundario">Atendido · Ver</a>`;
  if (p.estado === 'LISTO') return '<a href="delivery.html" class="boton boton-secundario">Asignar repartidor</a>';
  if (p.estado === 'CANCELADO') return 'Cancelado: ' + p.motivo;
  if (p.estado === 'ENTREGADO') return 'Entregado ✓';
  return 'En delivery con ' + p.repartidor;
}

// ---------- Detalle del pedido (funcionalidades 13 y 14) ----------
function mostrarPedido() {
  const p = buscarPedido(cargar(), codigoDeLaDireccion());
  if (!p) return;                                          // queda el mensaje "no encontrado"
  const total = totalDe(p.productos);
  let filas = '';
  for (const x of p.productos) {
    filas += `<tr><td>${x.nombre}</td><td>${x.cantidad}</td><td class="derecha">${soles(x.precio * x.cantidad)}</td></tr>`;
  }
  document.getElementById('titulo').innerHTML = `Pedido ${p.codigo} ${etiqueta(p.estado)}`;
  document.getElementById('llegada').textContent = 'Llegó el ' + p.historial[0].hora;
  document.getElementById('cliente').textContent = p.cliente + ' · ' + p.telefono;
  document.getElementById('direccion').textContent = p.direccion;
  document.getElementById('referencia').textContent = p.referencia || '—';
  document.getElementById('productos').innerHTML = filas;
  document.getElementById('total').textContent = soles(total);
  document.getElementById('pago').textContent = p.pago + (p.operacion ? ' · operación ' + p.operacion : '');
  document.getElementById('aviso-pago').textContent = p.pago === 'CONTRAENTREGA'
    ? `No hay pago que verificar: el repartidor cobrará ${soles(total)} al entregar.`
    : `Antes de avanzar, revisa que la operación ${p.operacion} por ${soles(total)} exista.`;

  // El cajero lleva el pedido hasta LISTO; lo demás lo hace el delivery
  const permitidos = siguientes(p.estado, ['EN_PREPARACION', 'LISTO']);
  if (permitidos.length > 0) {
    document.getElementById('lista-estados').innerHTML = listaEstados(p.estado, permitidos);
  } else {
    document.getElementById('form-estado').hidden = true;
    document.getElementById('sin-cambios').hidden = false;
  }
  // RN-20: solo se cancela antes de LISTO
  document.getElementById('seccion-cancelar').hidden = !['RECIBIDO', 'EN_PREPARACION'].includes(p.estado);
  document.getElementById('detalle').hidden = false;
  document.getElementById('no-encontrado').hidden = true;
}

function guardarEstado(evento) {
  evento.preventDefault();
  const bd = cargar();
  cambiarEstado(bd, buscarPedido(bd, codigoDeLaDireccion()), evento.target.estado.value);
  location.href = 'pedidos.html';                          // vuelve a la bandeja ya actualizada
}

function cancelarPedido(evento) {
  evento.preventDefault();
  const bd = cargar();
  const p = buscarPedido(bd, codigoDeLaDireccion());
  for (const x of p.productos) {                           // RN-21: devuelve el stock
    buscarProducto(bd, x.codigo).stock += x.cantidad;
  }
  p.motivo = evento.target.motivo.value;
  cambiarEstado(bd, p, 'CANCELADO');
  location.href = 'pedidos.html';
}

// ---------- Delivery (funcionalidades 15 y 17) ----------
function mostrarDelivery(esAdministrador) {
  puedeCambiarDespacho = esAdministrador;
  const bd = cargar();
  let opciones = '<option value="">— Repartidor —</option>';
  for (const u of bd.usuarios.filter(u => u.rol === 'Repartidor' && u.activo)) {
    opciones += `<option>${u.nombre}</option>`;
  }

  let listos = '';
  for (const p of bd.pedidos.filter(p => p.estado === 'LISTO')) {     // RN-22: solo los LISTO
    listos += `
      <tr>
        <td>${p.codigo}</td><td>${p.cliente}</td><td>${p.direccion}</td><td>${soles(totalDe(p.productos))}</td>
        <td>
          <form class="form-linea" onsubmit="asignar(event, '${p.codigo}')">
            <select name="repartidor" required aria-label="Repartidor">${opciones}</select>
            <button type="submit">Asignar</button>
          </form>
        </td>
      </tr>`;
  }
  document.getElementById('listos').innerHTML = listos || '<tr><td colspan="5">No hay pedidos listos para asignar.</td></tr>';

  let ruta = '';
  for (const p of bd.pedidos.filter(p => p.estado === 'ASIGNADO' || p.estado === 'EN_CAMINO')) {
    const asignado = p.historial.find(h => h.estado === 'ASIGNADO').hora;
    const cambio = esAdministrador
      ? `<td><form class="form-linea" onsubmit="cambiarDespacho(event, '${p.codigo}')">
           ${listaEstados(p.estado, siguientes(p.estado, ['EN_CAMINO', 'ENTREGADO']))}
           <button type="submit">Guardar</button></form></td>`
      : '';
    ruta += `<tr><td>${p.codigo}</td><td>${p.cliente}</td><td>${p.repartidor}</td><td>${asignado}</td><td>${etiqueta(p.estado)}</td>${cambio}</tr>`;
  }
  document.getElementById('ruta').innerHTML = ruta || `<tr><td colspan="6">No hay pedidos en ruta.</td></tr>`;
}

function asignar(evento, codigo) {
  evento.preventDefault();
  const bd = cargar();
  const p = buscarPedido(bd, codigo);
  p.repartidor = evento.target.repartidor.value;
  cambiarEstado(bd, p, 'ASIGNADO');
  mostrarDelivery(puedeCambiarDespacho);                   // la tabla se actualiza al instante
}

function cambiarDespacho(evento, codigo) {
  evento.preventDefault();
  const bd = cargar();
  cambiarEstado(bd, buscarPedido(bd, codigo), evento.target.estado.value);
  mostrarDelivery(puedeCambiarDespacho);
}

// ---------- Repartidor: mis entregas (funcionalidades 16 y 17) ----------
function mostrarEntregas() {
  const mias = cargar().pedidos.filter(p => p.repartidor === REPARTIDOR);   // solo las suyas
  const cuantos = estado => mias.filter(p => p.estado === estado).length;
  document.getElementById('kpi-recoger').textContent = cuantos('ASIGNADO');
  document.getElementById('kpi-camino').textContent = cuantos('EN_CAMINO');
  document.getElementById('kpi-entregados').textContent = cuantos('ENTREGADO');

  let filas = '';
  for (const p of mias.filter(p => p.estado === 'ASIGNADO' || p.estado === 'EN_CAMINO')) {
    filas += `
      <tr>
        <td>${p.codigo}</td><td>${p.cliente}</td><td>${p.direccion}</td><td>${cobrar(p)}</td>
        <td>${etiqueta(p.estado)}</td>
        <td><a href="entrega.html?codigo=${p.codigo}" class="boton">Ver</a></td>
      </tr>`;
  }
  document.getElementById('filas').innerHTML = filas || '<tr><td colspan="6">No tienes entregas pendientes.</td></tr>';
}

function cobrar(p) {
  return p.pago === 'CONTRAENTREGA' ? soles(totalDe(p.productos)) + ' (contraentrega)' : 'Pagado (' + p.pago + ')';
}

function mostrarEntrega() {
  const p = buscarPedido(cargar(), codigoDeLaDireccion());
  if (!p || p.repartidor !== REPARTIDOR) return;           // no es suya: queda "no encontrado"
  let filas = '';
  for (const x of p.productos) {
    filas += `<tr><td>${x.nombre}</td><td>${x.cantidad}</td></tr>`;
  }
  let historial = '';
  for (const h of p.historial.filter(h => ['ASIGNADO', 'EN_CAMINO', 'ENTREGADO'].includes(h.estado))) {
    historial += `<li class="hecho">${textoEstado(h.estado)} — ${h.hora}</li>`;
  }
  document.getElementById('titulo').innerHTML = `Pedido ${p.codigo} ${etiqueta(p.estado)}`;
  document.getElementById('cliente').textContent = p.cliente;
  document.getElementById('telefono').textContent = p.telefono;
  document.getElementById('direccion').textContent = p.direccion;
  document.getElementById('referencia').textContent = p.referencia || '—';
  document.getElementById('productos').innerHTML = filas;
  document.getElementById('cobro').textContent = p.pago === 'CONTRAENTREGA'
    ? 'Pago contraentrega: cobrar ' + soles(totalDe(p.productos)) + ' al entregar.'
    : 'Ya pagado con ' + p.pago + ': no hay que cobrar nada al entregar.';
  document.getElementById('historial').innerHTML = historial;

  const permitidos = siguientes(p.estado, ['EN_CAMINO', 'ENTREGADO']);
  if (permitidos.length > 0) {
    document.getElementById('lista-estados').innerHTML = listaEstados(p.estado, permitidos);
  } else {
    document.getElementById('form-estado').hidden = true;
    document.getElementById('sin-cambios').hidden = false;
  }
  document.getElementById('detalle').hidden = false;
  document.getElementById('no-encontrado').hidden = true;
}

function guardarEntrega(evento) {
  evento.preventDefault();
  const bd = cargar();
  cambiarEstado(bd, buscarPedido(bd, codigoDeLaDireccion()), evento.target.estado.value);
  location.href = 'mis-entregas.html';
}
