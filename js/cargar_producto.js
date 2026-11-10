import { loadProduct } from "./loadProducts.js";
import { agregarAlCarrito } from "./app.js";
const main = document.getElementById("producto_info");

document.addEventListener("DOMContentLoaded", async () => {
                                                                             
  const idGuardado = sessionStorage.getItem("idProductoSeleccionado");
  if (!idGuardado) return;

  try {
                                                
    const producto = await findById("productos", idGuardado);

    if (producto) {
                                                                                    
      loadProduct(producto, main);

                                                          
      const botonCarrito = main.querySelector(".boton-pedido");

      botonCarrito.addEventListener("click", async (event) => {
                                                            
                                                                     
        event.preventDefault();

        console.log("Añadiendo al carrito...", producto.nombre);

                                                                             
        await agregarAlCarrito(producto);

        console.log("¡Producto guardado con éxito!");

                                                                                         
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

                                                                               
export function findById(tabla, id) {
  return new Promise((resolve, reject) => {
    const idNumerico = parseInt(id, 10);                                     
    const solicitud = indexedDB.open("MiTienda", 6);

    solicitud.onsuccess = (evento) => {
      const db = evento.target.result;
      const transaccion = db.transaction([tabla], "readonly");
      const almacen = transaccion.objectStore(tabla);

                                                      
      const peticion = almacen.get(idNumerico);

      peticion.onsuccess = () => resolve(peticion.result);
      peticion.onerror = () => reject(peticion.error);
    };

    solicitud.onerror = () => reject(solicitud.error);
  });
}
