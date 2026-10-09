function mostrarProductosVenta() {
  let tarjetas = '';
  for (const p of cargar().productos.filter(p => p.activo)) {
    const campo = p.stock > 0
      ? `<input type="number" id="c-${p.codigo}" class="cantidad" data-codigo="${p.codigo}"
                value="0" min="0" max="${p.stock}" oninput="calcularVenta()">`
      : `<input type="number" id="c-${p.codigo}" value="0" disabled>`;
    tarjetas += `
      <article class="producto">
        ${fotoDe(p)}
        <p class="categoria">${p.categoria}</p>
        <h3>${p.nombre}</h3>
        <p class="precio">${soles(p.precio)}</p>
        <p class="stock ${p.stock > 0 ? '' : 'agotado'}">${p.stock > 0 ? 'Stock: ' + p.stock : 'Agotado'}</p>
        <label for="c-${p.codigo}">Cantidad</label>
        ${campo}
      </article>`;
  }
  document.getElementById('productos').innerHTML = tarjetas;
}

function productosElegidos() {
  const bd = cargar();
  const elegidos = [];
  for (const campo of document.querySelectorAll('.cantidad')) {
    let cantidad = Number(campo.value);
    if (cantidad > Number(campo.max)) {
      cantidad = Number(campo.max);
      campo.value = campo.max;
    }
    if (cantidad > 0) {
      const p = buscarProducto(bd, campo.dataset.codigo);
      elegidos.push({ codigo: p.codigo, nombre: p.nombre, precio: p.precio, cantidad });
    }
  }
  return elegidos;
}

function calcularVenta() {
  const total = totalDe(productosElegidos());
  const recibido = Number(document.getElementById('recibido').value);
  document.getElementById('total').textContent = soles(total);
  document.getElementById('vuelto').textContent = soles(recibido > total ? recibido - total : 0);
  return total;
}

function registrarVenta(evento) {
  evento.preventDefault();
  const datos = evento.target;
  const mensaje = document.getElementById('mensaje');
  const productos = productosElegidos();
  const total = totalDe(productos);
  const recibido = Number(datos.recibido.value);

  if (total === 0) {
    mensaje.textContent = 'Escribe la cantidad de al menos un producto.';
    return;
  }
  if (datos.pago.value === 'EFECTIVO' && recibido < total) {
    mensaje.textContent = 'El monto recibido no alcanza para el total.';
    return;
  }
  if (datos.pago.value === 'YAPE' && datos.operacion.value.trim() === '') {
    mensaje.textContent = 'Escribe el código de operación del Yape.';
    return;
  }

  const bd = cargar();
  for (const x of productos) {
    buscarProducto(bd, x.codigo).stock -= x.cantidad;
  }
  const venta = {
    codigo: nuevoCodigo(bd), canal: 'MOSTRADOR', cliente: datos.dni.value ? 'DNI ' + datos.dni.value : 'Cliente en mostrador',
    telefono: '', direccion: 'Local', referencia: '', pago: datos.pago.value, operacion: datos.operacion.value,
    recibido, repartidor: '', motivo: '', estado: 'ENTREGADO',
    productos, historial: [{ estado: 'ENTREGADO', hora: ahora() }]
  };
  bd.pedidos.unshift(venta);
  guardar(bd);
  localStorage.setItem('ultimaVenta', venta.codigo);
  location.href = 'venta-registrada.html';
}

function mostrarTicket() {
  const venta = buscarPedido(cargar(), localStorage.getItem('ultimaVenta'));
  if (!venta) return;
  const total = totalDe(venta.productos);
  let filas = '';
  for (const p of venta.productos) {
    filas += `<tr><td>${p.nombre}</td><td>${p.cantidad}</td><td class="derecha">${soles(p.precio * p.cantidad)}</td></tr>`;
  }
  let pago = `<tr><td colspan="2">Pago con Yape · operación ${venta.operacion}</td><td></td></tr>`;
  if (venta.pago === 'EFECTIVO') {
    pago = `<tr><td colspan="2">Efectivo recibido</td><td class="derecha">${soles(venta.recibido)}</td></tr>
            <tr><td colspan="2">Vuelto</td><td class="derecha">${soles(venta.recibido - total)}</td></tr>`;
  }
  document.getElementById('codigo').textContent = venta.codigo;
  document.getElementById('fecha').textContent = venta.historial[0].hora;
  document.getElementById('filas').innerHTML = filas;
  document.getElementById('total').textContent = soles(total);
  document.getElementById('igv').textContent = soles(total * 18 / 118);
  document.getElementById('pago').innerHTML = pago;
  document.getElementById('ticket').hidden = false;
  document.getElementById('sin-venta').hidden = true;
}
