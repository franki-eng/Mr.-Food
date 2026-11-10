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
                                                                        
  let transaction = db.transaction(["clientes"], "readwrite");

                                                       
  const objectStore = transaction.objectStore("clientes");

  const nuevoCliente = {
    nombre: nombre,
    password: password,
    correo: correo,
    celular: celular,
  };

  objectStore.add(nuevoCliente);
}

                                           
                                           
export async function agregarAlCarrito(producto) {
  return await new Promise((resolve, reject) => {
                                                      
    let transaction = db.transaction(["carrito"], "readwrite");
    const objectStore = transaction.objectStore("carrito");                                              

                                                    
    const peticionObtener = objectStore.get(producto.id);

                                                                                    
    peticionObtener.onsuccess = () => {
      const productoEnCarrito = peticionObtener.result;

      if (productoEnCarrito) {
                                                  
        productoEnCarrito.cantidad += 1;
        const peticionActualizar = objectStore.put(productoEnCarrito);
        peticionActualizar.onsuccess = () =>
          resolve({ msg: "Cantidad incrementada", data: productoEnCarrito });
      } else {
                                                              
        const nuevoItem = {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen,                                                                  
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
