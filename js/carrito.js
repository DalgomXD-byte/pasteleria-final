// =========================================================
// PANTALLAS DEL CLIENTE: catálogo, carrito, confirmación y mis pedidos
// Necesita datos.js (se carga antes en cada página).
// El carrito se guarda aparte, en localStorage, con la clave 'carrito'.
// Los precios YA INCLUYEN IGV: el total es la suma de los importes.
// =========================================================

const CLIENTE = { nombre: 'Ana Ríos', telefono: '987 654 321' };   // sesión simulada

function leerCarrito() {
  return JSON.parse(localStorage.getItem('carrito')) || [];
}

function guardarCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// ---------- Menú: "Carrito (n)" ----------
function mostrarContador() {
  let unidades = 0;
  for (const p of leerCarrito()) {
    unidades += p.cantidad;
  }
  document.getElementById('contador').textContent = unidades;
}

// ---------- Catálogo (funcionalidad 3) ----------
function mostrarCatalogo() {
  const bd = cargar();
  let opciones = '<option>Todas</option>';
  for (const c of bd.categorias) {
    opciones += `<option>${c.nombre}</option>`;
  }
  document.getElementById('categoria').innerHTML = opciones;

  let tarjetas = '';
  for (const p of bd.productos.filter(p => p.activo)) {      // RN-10: los inactivos no se muestran
    const compra = p.stock > 0
      ? `<p class="stock">Stock: ${p.stock} unidades</p>
         <form class="form-linea" onsubmit="agregar(event, '${p.codigo}')">
           <input type="number" name="cantidad" value="1" min="1" max="${p.stock}" aria-label="Cantidad">
           <button type="submit">Agregar</button>
         </form>`
      : `<p class="stock agotado">Agotado</p>
         <button type="button" disabled>Sin stock</button>`;          // RN-12
    tarjetas += `
      <article class="producto">
        ${fotoDe(p)}
        <p class="categoria">${p.categoria}</p>
        <h3>${p.nombre}</h3>
        <p class="precio">${soles(p.precio)}</p>
        ${compra}
      </article>`;
  }
  document.getElementById('productos').innerHTML = tarjetas;
  mostrarContador();
}

function filtrar(evento) {
  evento.preventDefault();
  const texto = evento.target.q.value.toLowerCase();
  const categoria = evento.target.categoria.value;
  for (const tarjeta of document.querySelectorAll('.producto')) {
    const nombre = tarjeta.querySelector('h3').textContent.toLowerCase();
    const suCategoria = tarjeta.querySelector('.categoria').textContent;
    tarjeta.hidden = !(nombre.includes(texto) && (categoria === 'Todas' || suCategoria === categoria));
  }
}

// ---------- Botón "Agregar" (funcionalidad 8) ----------
function agregar(evento, codigo) {
  evento.preventDefault();                                    // se queda en el catálogo
  const p = buscarProducto(cargar(), codigo);
  const cantidad = Number(evento.target.cantidad.value);
  const carrito = leerCarrito();
  const enCarrito = carrito.find(x => x.codigo === codigo);

  if (enCarrito) {
    enCarrito.cantidad = Math.min(enCarrito.cantidad + cantidad, p.stock);   // RN-12
  } else {
    carrito.push({ codigo, nombre: p.nombre, precio: p.precio, stock: p.stock, cantidad });
  }
  guardarCarrito(carrito);
  mostrarContador();
  evento.target.querySelector('button').textContent = 'Agregado ✓';
}

// ---------- Carrito ----------
function mostrarCarrito() {
  const carrito = leerCarrito();
  let filas = '';
  carrito.forEach((p, i) => {
    filas += `
      <tr>
        <td>${p.nombre}</td>
        <td>${soles(p.precio)}</td>
        <td><input type="number" value="${p.cantidad}" min="1" max="${p.stock}"
                   aria-label="Cantidad" oninput="cambiarCantidad(${i}, this)"></td>
        <td class="derecha importe">${soles(p.precio * p.cantidad)}</td>
        <td><button type="button" class="boton-icono" title="Eliminar" onclick="eliminar(${i})">🗑</button></td>
      </tr>`;
  });
  document.getElementById('filas').innerHTML = filas;
  document.getElementById('carrito-vacio').hidden = carrito.length > 0;
  document.getElementById('confirmar').disabled = carrito.length === 0;
  actualizarTotales();
}

// Al escribir una cantidad se recalcula todo al instante
function cambiarCantidad(i, campo) {
  const carrito = leerCarrito();
  const p = carrito[i];
  let cantidad = Number(campo.value);
  if (cantidad < 1) cantidad = 1;
  if (cantidad > p.stock) {                                   // RN-12
    cantidad = p.stock;
    campo.value = p.stock;
  }
  p.cantidad = cantidad;
  guardarCarrito(carrito);
  campo.closest('tr').querySelector('.importe').textContent = soles(p.precio * cantidad);
  actualizarTotales();
}

function eliminar(i) {
  const carrito = leerCarrito();
  carrito.splice(i, 1);                                       // quita el producto
  guardarCarrito(carrito);
  mostrarCarrito();
}

// Total = suma de importes. El IGV ya está dentro: solo se muestra (total × 18 / 118)
function actualizarTotales() {
  const total = totalDe(leerCarrito());
  document.getElementById('total').textContent = soles(total);
  document.getElementById('igv').textContent = soles(total * 18 / 118);
  mostrarContador();
}

// ---------- Confirmar pedido (funcionalidad 9) ----------
function confirmarPedido(evento) {
  evento.preventDefault();
  const datos = evento.target;
  const mensaje = document.getElementById('mensaje');
  const bd = cargar();
  const carrito = leerCarrito();

  // RN-17: Yape y transferencia exigen el código de operación
  if (datos.pago.value !== 'CONTRAENTREGA' && datos.operacion.value.trim() === '') {
    mensaje.textContent = 'Escribe el código de operación de tu Yape o transferencia.';
    return;
  }
  // RN-12: se vuelve a revisar el stock justo antes de confirmar
  for (const item of carrito) {
    const p = buscarProducto(bd, item.codigo);
    if (item.cantidad > p.stock) {
      mensaje.textContent = `Solo quedan ${p.stock} de "${p.nombre}". Cambia la cantidad.`;
      return;
    }
  }

  // RN-16: el pedido y el descuento de stock se guardan juntos
  for (const item of carrito) {
    buscarProducto(bd, item.codigo).stock -= item.cantidad;
  }
  const pedido = {
    codigo: nuevoCodigo(bd), canal: 'WEB', cliente: CLIENTE.nombre, telefono: CLIENTE.telefono,
    direccion: datos.direccion.value + ', ' + datos.distrito.value, referencia: datos.referencia.value,
    pago: datos.pago.value, operacion: datos.operacion.value, repartidor: '', motivo: '', estado: 'RECIBIDO',
    productos: carrito.map(p => ({ codigo: p.codigo, nombre: p.nombre, precio: p.precio, cantidad: p.cantidad })),
    historial: [{ estado: 'RECIBIDO', hora: ahora() }]
  };
  bd.pedidos.unshift(pedido);
  guardar(bd);
  guardarCarrito([]);                                         // el carrito queda vacío
  localStorage.setItem('ultimoPedido', pedido.codigo);
  location.href = 'confirmacion.html';
}

// ---------- Confirmación ----------
function mostrarConfirmacion() {
  mostrarContador();
  const pedido = buscarPedido(cargar(), localStorage.getItem('ultimoPedido'));
  if (!pedido) return;                                        // queda el mensaje de la página
  let filas = '';
  for (const p of pedido.productos) {
    filas += `<tr><td>${p.cantidad} × ${p.nombre}</td><td class="derecha">${soles(p.precio * p.cantidad)}</td></tr>`;
  }
  document.getElementById('codigo').textContent = pedido.codigo;
  document.getElementById('productos').innerHTML = filas;
  document.getElementById('total').textContent = soles(totalDe(pedido.productos));
  document.getElementById('entrega').textContent = pedido.direccion;
  document.getElementById('pago').textContent = pedido.pago + (pedido.operacion ? ' · operación ' + pedido.operacion : '');
  document.getElementById('resumen').hidden = false;
  document.getElementById('sin-pedido').hidden = true;
}

// ---------- Mis pedidos (funcionalidades 10 y 11) ----------
// RN-19: el cliente solo ve sus propios pedidos
function mostrarMisPedidos() {
  mostrarContador();
  const mios = cargar().pedidos.filter(p => p.cliente === CLIENTE.nombre);
  let html = '';
  mios.forEach((pedido, i) => {
    let filas = '';
    for (const p of pedido.productos) {
      filas += `<tr><td>${p.cantidad} × ${p.nombre}</td><td class="derecha">${soles(p.precio * p.cantidad)}</td></tr>`;
    }
    html += `
      <details ${i === 0 ? 'open' : ''}>
        <summary>${pedido.codigo} · ${pedido.historial[0].hora} · ${soles(totalDe(pedido.productos))} · ${etiqueta(pedido.estado)}</summary>
        <div class="dos-columnas">
          <div>
            <h3>Productos</h3>
            <table>
              ${filas}
              <tr class="total"><td>Total (IGV incluido)</td><td class="derecha">${soles(totalDe(pedido.productos))}</td></tr>
            </table>
            <p><strong>Entrega:</strong> ${pedido.direccion}</p>
            <p><strong>Pago:</strong> ${pedido.pago}${pedido.operacion ? ' · operación ' + pedido.operacion : ''}</p>
          </div>
          <div>
            <h3>Seguimiento</h3>
            ${lineaDeTiempo(pedido)}
          </div>
        </div>
      </details>`;
  });
  document.getElementById('lista').innerHTML = html || '<p class="aviso">Todavía no tienes pedidos.</p>';
}

// Los pasos ya cumplidos van resaltados y con su hora (RN-23)
function lineaDeTiempo(pedido) {
  if (pedido.estado === 'CANCELADO') {
    return `<p class="aviso">Pedido cancelado el ${pedido.historial.at(-1).hora}. Motivo: ${pedido.motivo}</p>`;
  }
  let pasos = '';
  for (const estado of ESTADOS) {
    const paso = pedido.historial.find(h => h.estado === estado);
    let texto = textoEstado(estado);
    if (estado === 'ASIGNADO' && pedido.repartidor) texto += ' a ' + pedido.repartidor;
    pasos += paso ? `<li class="hecho">${texto} — ${paso.hora}</li>` : `<li>${texto}</li>`;
  }
  return `<ol class="linea-tiempo">${pasos}</ol>`;
}
