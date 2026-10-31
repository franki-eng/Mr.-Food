import { db } from "./createDB.js";

export function crearProductos(
  imagen,
  nombre,
  precio,
  cantidad,
  descripcion,
  informacion_nutricional,
  alergenos
) {
  let transaction = db.transaction(["productos"], "readwrite");

  const objectStore = transaction.objectStore("productos");

  // Mapeamos los datos exactamente igual a como los definiste en tu data.js
  const nuevoProducto = {
    imagen: imagen,
    nombre: nombre,
    precio: precio,
    cantidad: cantidad,
    descripcion: descripcion,
    informacion_nutricional: informacion_nutricional,
    alergenos: alergenos,
  };

  objectStore.add(nuevoProducto);
}

export function crearCliente(nombre, celular, correo, password) {
  // CORRECCIÓN: 'clientes' en plural para coincidir con onupgradeneeded
  let transaction = db.transaction(["clientes"], "readwrite");

  // CORRECCIÓN: Apuntar al almacén correcto 'clientes'
  const objectStore = transaction.objectStore("clientes");

  const nuevoCliente = {
    nombre: nombre,
    password: password,
    correo: correo,
    celular: celular,
  };

  objectStore.add(nuevoCliente);
}

// Añade esta función al final de tu app.js
// Añade esta función al final de tu app.js
export async function agregarAlCarrito(producto) {
  return await new Promise((resolve, reject) => {
    // Abrimos transacción en la nueva tabla 'carrito'
    let transaction = db.transaction(["carrito"], "readwrite");
    const objectStore = transaction.objectStore("carrito"); // CORRECCIÓN: Pasar string plano, no arreglo

    // Verificamos si el plato ya fue agregado antes
    const peticionObtener = objectStore.get(producto.id);

    // 🎯 CORRECCIÓN CRÍTICA: Debemos esperar a que la consulta termine con onsuccess
    peticionObtener.onsuccess = () => {
      const productoEnCarrito = peticionObtener.result;

      if (productoEnCarrito) {
        // Si ya existe, incrementamos su cantidad
        productoEnCarrito.cantidad += 1;
        const peticionActualizar = objectStore.put(productoEnCarrito);
        peticionActualizar.onsuccess = () =>
          resolve({ msg: "Cantidad incrementada", data: productoEnCarrito });
      } else {
        // Si es nuevo, lo guardamos con cantidad inicial en 1
        const nuevoItem = {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen, // Asegúrate de que mapee 'imagen' o 'img' según tu base de datos
          cantidad: 1,
        };
        const peticionAgregar = objectStore.add(nuevoItem);
        peticionAgregar.onsuccess = () =>
          resolve({ msg: "Producto añadido", data: nuevoItem });
      }
    };

    transaction.onerror = (event) => reject(event.target.error);
  });
}

export async function limpiarTablaIndexedDB() {
  return await new Promise((resolve, reject) => {
    let transaction = db.transaction(["carrito"], "readwrite");
    const objectStore = transaction.objectStore("carrito");

    const solicitudLimpieza = objectStore.clear();

    solicitudLimpieza.onsuccess = function () {
      console.log("¡Tabla vaciada con éxito de IndexedDB!");
    };

    solicitudLimpieza.onerror = function (error) {
      console.error("Error al intentar limpiar la tabla:", error);
    };
  });
}
