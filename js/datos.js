const DATOS_DE_EJEMPLO = {
  categorias: [
    { nombre: 'Tortas', descripcion: 'Tortas enteras para celebraciones' },
    { nombre: 'Postres', descripcion: 'Porciones y dulces individuales' },
    { nombre: 'Bocaditos', descripcion: 'Surtidos para eventos' },
    { nombre: 'Panadería', descripcion: 'Panes y kekes del día' },
    { nombre: 'Bebidas', descripcion: 'Bebidas para acompañar' }
  ],

  productos: [
    { codigo: 'TOR-001', nombre: 'Torta de chocolate', categoria: 'Tortas', precio: 65, stock: 8, foto: 'tor-001.jpg', activo: true },
    { codigo: 'TOR-002', nombre: 'Torta tres leches', categoria: 'Tortas', precio: 55, stock: 5, foto: 'tor-002.jpg', activo: true },
    { codigo: 'POS-001', nombre: 'Pie de manzana (porción)', categoria: 'Postres', precio: 8.5, stock: 20, foto: 'pos-001.jpg', activo: true },
    { codigo: 'POS-002', nombre: 'Alfajor de maicena', categoria: 'Postres', precio: 2.5, stock: 60, foto: 'pos-002.jpg', activo: true },
    { codigo: 'POS-003', nombre: 'Cheesecake de maracuyá (porción)', categoria: 'Postres', precio: 9, stock: 0, foto: 'pos-003.jpg', activo: true },
    { codigo: 'BOC-001', nombre: 'Ciento de bocaditos surtidos', categoria: 'Bocaditos', precio: 90, stock: 4, foto: 'boc-001.jpg', activo: true },
    { codigo: 'PAN-001', nombre: 'Pan de yema (unidad)', categoria: 'Panadería', precio: 0.8, stock: 150, foto: 'pan-001.jpg', activo: true },
    { codigo: 'PAN-002', nombre: 'Keke de naranja', categoria: 'Panadería', precio: 12, stock: 0, foto: '', activo: false }
  ],

  usuarios: [
    { correo: 'admin@dulcemantaro.pe', nombre: 'Dueño de la pastelería', telefono: '999888777', rol: 'Administrador', activo: true },
    { correo: 'caja@dulcemantaro.pe', nombre: 'Carmen Lazo', telefono: '987111222', rol: 'Cajero', activo: true },
    { correo: 'jorge.mendoza@dulcemantaro.pe', nombre: 'Jorge Mendoza', telefono: '964333444', rol: 'Repartidor', activo: true },
    { correo: 'ruben.castro@dulcemantaro.pe', nombre: 'Rubén Castro', telefono: '951555666', rol: 'Repartidor', activo: true },
    { correo: 'luis.vega@dulcemantaro.pe', nombre: 'Luis Vega', telefono: '943777888', rol: 'Repartidor', activo: false }
  ],

  pedidos: [
    { codigo: 'PAS-000124', canal: 'WEB', cliente: 'Ana Ríos', telefono: '987 654 321', direccion: 'Jr. Puno 245, Huancayo', referencia: 'Frente al parque',
      pago: 'YAPE', operacion: '845120', repartidor: '', motivo: '', estado: 'RECIBIDO',
      productos: [{ codigo: 'TOR-001', nombre: 'Torta de chocolate', precio: 65, cantidad: 1 }, { codigo: 'POS-002', nombre: 'Alfajor de maicena', precio: 2.5, cantidad: 4 }],
      historial: [{ estado: 'RECIBIDO', hora: '28/09 10:15' }] },
    { codigo: 'PAS-000123', canal: 'WEB', cliente: 'Luis Quispe', telefono: '951 234 567', direccion: 'Av. Ferrocarril 870, Huancayo', referencia: 'Esquina con Jr. Ica',
      pago: 'CONTRAENTREGA', operacion: '', repartidor: '', motivo: '', estado: 'EN_PREPARACION',
      productos: [{ codigo: 'TOR-002', nombre: 'Torta tres leches', precio: 55, cantidad: 1 }],
      historial: [{ estado: 'RECIBIDO', hora: '28/09 09:50' }, { estado: 'EN_PREPARACION', hora: '28/09 10:00' }] },
    { codigo: 'PAS-000122', canal: 'WEB', cliente: 'María Huamán', telefono: '956 321 789', direccion: 'Av. Real 1450, Huancayo', referencia: 'Al costado de la farmacia',
      pago: 'TRANSFERENCIA', operacion: '00932871', repartidor: '', motivo: '', estado: 'LISTO',
      productos: [{ codigo: 'BOC-001', nombre: 'Ciento de bocaditos surtidos', precio: 90, cantidad: 1 }],
      historial: [{ estado: 'RECIBIDO', hora: '28/09 09:20' }, { estado: 'EN_PREPARACION', hora: '28/09 09:30' }, { estado: 'LISTO', hora: '28/09 10:40' }] },
    { codigo: 'PAS-000121', canal: 'WEB', cliente: 'Carlos Pérez', telefono: '945 678 123', direccion: 'Av. Huancavelica 1020, El Tambo', referencia: 'Edificio azul, 3.er piso',
      pago: 'YAPE', operacion: '771203', repartidor: 'Jorge Mendoza', motivo: '', estado: 'ASIGNADO',
      productos: [{ codigo: 'POS-001', nombre: 'Pie de manzana (porción)', precio: 8.5, cantidad: 2 }, { codigo: 'POS-003', nombre: 'Cheesecake de maracuyá (porción)', precio: 9, cantidad: 1 }],
      historial: [{ estado: 'RECIBIDO', hora: '28/09 08:40' }, { estado: 'EN_PREPARACION', hora: '28/09 08:50' }, { estado: 'LISTO', hora: '28/09 09:55' }, { estado: 'ASIGNADO', hora: '28/09 10:05' }] },
    { codigo: 'PAS-000120', canal: 'WEB', cliente: 'Rosa Torres', telefono: '964 112 233', direccion: 'Jr. Libertad 318, Chilca', referencia: 'Casa de dos pisos, puerta verde',
      pago: 'CONTRAENTREGA', operacion: '', repartidor: 'Jorge Mendoza', motivo: '', estado: 'EN_CAMINO',
      productos: [{ codigo: 'PAN-001', nombre: 'Pan de yema (unidad)', precio: 0.8, cantidad: 10 }, { codigo: 'TOR-001', nombre: 'Torta de chocolate', precio: 65, cantidad: 1 }],
      historial: [{ estado: 'RECIBIDO', hora: '28/09 08:10' }, { estado: 'EN_PREPARACION', hora: '28/09 08:20' }, { estado: 'LISTO', hora: '28/09 09:20' }, { estado: 'ASIGNADO', hora: '28/09 09:30' }, { estado: 'EN_CAMINO', hora: '28/09 09:40' }] },
    { codigo: 'PAS-000119', canal: 'WEB', cliente: 'Ana Ríos', telefono: '987 654 321', direccion: 'Jr. Puno 245, Huancayo', referencia: 'Frente al parque',
      pago: 'YAPE', operacion: '702318', repartidor: 'Jorge Mendoza', motivo: '', estado: 'ENTREGADO',
      productos: [{ codigo: 'TOR-002', nombre: 'Torta tres leches', precio: 55, cantidad: 1 }],
      historial: [{ estado: 'RECIBIDO', hora: '25/09 09:40' }, { estado: 'EN_PREPARACION', hora: '25/09 09:55' }, { estado: 'LISTO', hora: '25/09 11:10' }, { estado: 'ASIGNADO', hora: '25/09 11:20' }, { estado: 'EN_CAMINO', hora: '25/09 11:25' }, { estado: 'ENTREGADO', hora: '25/09 11:50' }] },
    { codigo: 'PAS-000118', canal: 'WEB', cliente: 'Pedro Salazar', telefono: '932 456 780', direccion: 'Jr. Ancash 560, Huancayo', referencia: '',
      pago: 'YAPE', operacion: '650044', repartidor: '', motivo: 'Pago no encontrado', estado: 'CANCELADO',
      productos: [{ codigo: 'POS-001', nombre: 'Pie de manzana (porción)', precio: 8.5, cantidad: 2 }, { codigo: 'POS-003', nombre: 'Cheesecake de maracuyá (porción)', precio: 9, cantidad: 1 }],
      historial: [{ estado: 'RECIBIDO', hora: '27/09 16:05' }, { estado: 'CANCELADO', hora: '27/09 16:30' }] }
  ]
};

const ESTADOS = ['RECIBIDO', 'EN_PREPARACION', 'LISTO', 'ASIGNADO', 'EN_CAMINO', 'ENTREGADO'];

function cargar() {
  const guardado = localStorage.getItem('dulceMantaro');
  return guardado ? JSON.parse(guardado) : structuredClone(DATOS_DE_EJEMPLO);
}

function guardar(bd) {
  localStorage.setItem('dulceMantaro', JSON.stringify(bd));
}

function reiniciarDemo() {
  localStorage.clear();
  location.reload();
}

function soles(monto) {
  return 'S/ ' + monto.toFixed(2);
}

function totalDe(productos) {
  let total = 0;
  for (const p of productos) {
    total += p.precio * p.cantidad;
  }
  return total;
}

function ahora() {
  const f = new Date();
  const dos = n => String(n).padStart(2, '0');
  return dos(f.getDate()) + '/' + dos(f.getMonth() + 1) + ' ' + dos(f.getHours()) + ':' + dos(f.getMinutes());
}

function textoEstado(estado) {
  return estado.replace('_', ' ').replace('PREPARACION', 'PREPARACIÓN');
}

function etiqueta(estado) {
  return `<span class="estado ${estado.toLowerCase().replace('_', '-')}">${textoEstado(estado)}</span>`;
}

function nuevoCodigo(bd) {
  let mayor = 0;
  for (const p of bd.pedidos) {
    mayor = Math.max(mayor, Number(p.codigo.slice(4)));
  }
  return 'PAS-' + String(mayor + 1).padStart(6, '0');
}

function buscarPedido(bd, codigo) {
  return bd.pedidos.find(p => p.codigo === codigo);
}

function buscarProducto(bd, codigo) {
  return bd.productos.find(p => p.codigo === codigo);
}

function codigoDeLaDireccion() {
  return new URLSearchParams(location.search).get('codigo');
}

function fotoDe(producto) {
  return producto.foto
    ? `<img class="foto" src="../img/${producto.foto}" alt="${producto.nombre}">`
    : '<div class="foto">Sin foto</div>';
}
