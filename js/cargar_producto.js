import { loadProduct } from "./loadProducts.js";
import { agregarAlCarrito } from "./app.js";
const main = document.getElementById("producto_info");

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Obtenemos el ID del producto que el usuario seleccionó en el catálogo
  const idGuardado = sessionStorage.getItem("idProductoSeleccionado");
  if (!idGuardado) return;

  try {
    // 2. Buscamos el plato peruano en IndexedDB
    const producto = await findById("productos", idGuardado);

    if (producto) {
      // 3. Pintamos el HTML dinámico (esto dibuja tu estructura con el botón nuevo)
      loadProduct(producto, main);

      // 🎯 4. CAPTURAMOS EL EVENTO DEL BOTÓN RECIÉN CREADO
      const botonCarrito = main.querySelector(".boton-pedido");

      botonCarrito.addEventListener("click", async (event) => {
        // Detenemos temporalmente el viaje a 'carrito.html'
        // para que le dé tiempo a IndexedDB de procesar la escritura
        event.preventDefault();

        console.log("Añadiendo al carrito...", producto.nombre);

        // 5. Guardamos el objeto completo del producto en la tabla 'carrito'
        await agregarAlCarrito(producto);

        console.log("¡Producto guardado con éxito!");

        // 6. Ahora que IndexedDB terminó, redirigimos manualmente a la vista del carrito
        alert(`¡Se añadió 1 ${producto.nombre} al carrito! 🛒`);
      });
    }
  } catch (error) {
    console.error(
      "Error al procesar el producto o guardarlo en el carrito:",
      error
    );
  }
});

// 🎯 FUNCIÓN CON PROMESAS: Busca un único registro por su ID de forma asíncrona
export function findById(tabla, id) {
  return new Promise((resolve, reject) => {
    const idNumerico = parseInt(id, 10); // Forzamos que sea un número entero
    const solicitud = indexedDB.open("MiTienda", 4);

    solicitud.onsuccess = (evento) => {
      const db = evento.target.result;
      const transaccion = db.transaction([tabla], "readonly");
      const almacen = transaccion.objectStore(tabla);

      // Solicitamos el registro por su clave primaria
      const peticion = almacen.get(idNumerico);

      peticion.onsuccess = () => resolve(peticion.result);
      peticion.onerror = () => reject(peticion.error);
    };

    solicitud.onerror = () => reject(solicitud.error);
  });
}
