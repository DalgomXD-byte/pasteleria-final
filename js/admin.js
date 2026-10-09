function avisar(texto) {
  document.getElementById('mensaje').textContent = texto;
}

function mostrarCatalogoAdmin() {
  const bd = cargar();
  let filas = '';
  for (const p of bd.productos) {
    const f = 'editar-' + p.codigo;
    const inactivar = p.activo
      ? `<button type="button" class="boton-peligro" onclick="inactivar('${p.codigo}')">Inactivar</button>` : '';
    filas += `
      <tr>
        <td>${p.codigo}</td>
        <td><input type="text" name="nombre" value="${p.nombre}" required form="${f}" aria-label="Nombre"></td>
        <td>${p.categoria}</td>
        <td><input type="number" name="precio" value="${p.precio.toFixed(2)}" min="0.01" step="0.01" required form="${f}" aria-label="Precio"></td>
        <td><input type="number" name="stock" value="${p.stock}" min="0" required form="${f}" aria-label="Stock"></td>
        <td class="${p.activo ? 'activo-txt' : 'inactivo-txt'}">${p.activo ? 'ACTIVO' : 'INACTIVO'}</td>
        <td class="acciones">
          <form id="${f}" onsubmit="guardarProducto(event, '${p.codigo}')"><button type="submit">Guardar</button></form>
          ${inactivar}
        </td>
      </tr>`;
  }
  document.getElementById('filas').innerHTML = filas;

  let categorias = '';
  for (const c of bd.categorias) {
    const cuantos = bd.productos.filter(p => p.categoria === c.nombre).length;
    categorias += `<tr><td>${c.nombre}</td><td>${c.descripcion}</td><td>${cuantos}</td></tr>`;
  }
  document.getElementById('categorias').innerHTML = categorias;
}

function guardarProducto(evento, codigo) {
  evento.preventDefault();
  const datos = evento.target;
  const bd = cargar();
  const p = buscarProducto(bd, codigo);
  p.nombre = datos.nombre.value;
  p.precio = Number(datos.precio.value);
  p.stock = Number(datos.stock.value);
  guardar(bd);
  mostrarCatalogoAdmin();
  avisar('Producto ' + codigo + ' actualizado.');
}

function inactivar(codigo) {
  const bd = cargar();
  buscarProducto(bd, codigo).activo = false;
  guardar(bd);
  mostrarCatalogoAdmin();
  avisar('Producto ' + codigo + ' inactivado: ya no aparece en la tienda.');
}

function nuevaCategoria(evento) {
  evento.preventDefault();
  const datos = evento.target;
  const bd = cargar();
  const nombre = datos.nombre.value.trim();
  if (bd.categorias.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
    avisar('Ya existe la categoría ' + nombre + '.');
    return;
  }
  bd.categorias.push({ nombre, descripcion: datos.descripcion.value });
  guardar(bd);
  datos.reset();
  mostrarCatalogoAdmin();
  avisar('Categoría ' + nombre + ' creada.');
}

function mostrarCategoriasEnFormulario() {
  let opciones = '<option value="">— Elige una categoría —</option>';
  for (const c of cargar().categorias) {
    opciones += `<option>${c.nombre}</option>`;
  }
  document.getElementById('categoria').innerHTML = opciones;
}

function crearProducto(evento) {
  evento.preventDefault();
  const datos = evento.target;
  const bd = cargar();
  const codigo = datos.codigo.value.trim().toUpperCase();
  if (buscarProducto(bd, codigo)) {
    avisar('Ya existe un producto con el código ' + codigo + '.');
    return;
  }
  bd.productos.push({
    codigo, nombre: datos.nombre.value, categoria: datos.categoria.value, precio: Number(datos.precio.value),
    stock: Number(datos.stock.value), foto: '', activo: true
  });
  guardar(bd);
  location.href = 'catalogo.html';
}

function mostrarUsuarios() {
  let filas = '';
  cargar().usuarios.forEach((u, i) => {
    if (u.rol === 'Administrador') return;
    const f = 'usuario-' + i;
    const roles = ['Cajero', 'Repartidor'].map(r => `<option ${r === u.rol ? 'selected' : ''}>${r}</option>`).join('');
    const desactivar = u.activo
      ? `<button type="button" class="boton-peligro" onclick="desactivarUsuario(${i})">Desactivar</button>` : '';
    filas += `
      <tr>
        <td><input type="text" name="nombre" value="${u.nombre}" required form="${f}" aria-label="Nombre"></td>
        <td><input type="email" name="correo" value="${u.correo}" required form="${f}" aria-label="Correo"></td>
        <td><input type="tel" name="telefono" value="${u.telefono}" required pattern="[0-9]{9}" form="${f}" aria-label="Teléfono"></td>
        <td><select name="rol" form="${f}" aria-label="Rol">${roles}</select></td>
        <td class="${u.activo ? 'activo-txt' : 'inactivo-txt'}">${u.activo ? 'ACTIVO' : 'INACTIVO'}</td>
        <td class="acciones">
          <form id="${f}" onsubmit="guardarUsuario(event, ${i})"><button type="submit">Guardar</button></form>
          ${desactivar}
        </td>
      </tr>`;
  });
  document.getElementById('filas').innerHTML = filas;
}

function correoRepetido(bd, correo, menos) {
  return bd.usuarios.some((u, i) => i !== menos && u.correo.toLowerCase() === correo.toLowerCase());
}

function guardarUsuario(evento, i) {
  evento.preventDefault();
  const datos = evento.target;
  const bd = cargar();
  if (correoRepetido(bd, datos.correo.value, i)) {
    avisar('Ese correo ya lo usa otra cuenta.');
    return;
  }
  Object.assign(bd.usuarios[i], {
    nombre: datos.nombre.value, correo: datos.correo.value, telefono: datos.telefono.value, rol: datos.rol.value
  });
  guardar(bd);
  mostrarUsuarios();
  avisar('Cuenta de ' + datos.nombre.value + ' actualizada.');
}

function desactivarUsuario(i) {
  const bd = cargar();
  bd.usuarios[i].activo = false;
  guardar(bd);
  mostrarUsuarios();
  avisar('Cuenta de ' + bd.usuarios[i].nombre + ' desactivada: ya no aparece como repartidor disponible.');
}

function crearUsuario(evento) {
  evento.preventDefault();
  const datos = evento.target;
  const bd = cargar();
  if (correoRepetido(bd, datos.correo.value, -1)) {
    avisar('Ese correo ya lo usa otra cuenta.');
    return;
  }
  bd.usuarios.push({
    correo: datos.correo.value, nombre: datos.nombre.value, telefono: datos.telefono.value, rol: datos.rol.value, activo: true
  });
  guardar(bd);
  avisar('Cuenta de ' + datos.nombre.value + ' creada.');
  datos.reset();
  mostrarUsuarios();
}
