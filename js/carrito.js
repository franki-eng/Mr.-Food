                                                                    
import { findAll } from "./loadProducts.js"; 
import { db } from "./createDB.js"

document.addEventListener("DOMContentLoaded", async () => {
    const main = document.getElementById("main");
    const lista = document.getElementById("lista");
    const resumen = document.getElementById("resumen");

    try {
                                                                      
        let productos = await findAll("carrito"); 

        console.log("Productos en carrito:", productos);
        
                                                                              
        lista.innerHTML = "";
        resumen.innerHTML = "";
        
        lista.innerHTML += `
            <h1>Tu carrito</h1>
            <p class="cantidad-total">${productos.length} productos</p>
        `;

                                                                                                  
        if (productos.length <= 0) {
            resumen.style.display = "none"; 
            lista.innerHTML += `<p class="carrito-vacio">No tienes puctos en tu carrito de compras.</p>`;
            return;
        }

                                                                       
        resumen.style.display = "block";

        let total = renderizar(productos, lista);
        sessionStorage.setItem("total", JSON.stringify(total));
        
        resumen.innerHTML += `
            <h2>Resumen</h2>
            <div class="linea">
                <span>Subtotal</span>
                <span>S/ ${total.toFixed(2)}</span>
            </div>
            <div class="linea">
                <span>Delivery</span>
                <span>S/ 4.00</span>
            </div>
            <div class="linea total">
                <span>Total</span>
                <span>S/ ${(total + 4).toFixed(2)}</span>
            </div>

            <a href="pago.html" class="boton-pagar">Ir a pagar</a>
            <a href="productos.html" class="seguir">← Seguir comprando</a>
        `;
    } catch (error) {
        console.error("Error al cargar los productos del carrito:", error);
    }
});

function renderizar(elementos, html) {
    let total = 0;
    for (let elemento of elementos) {
        html.innerHTML += `
        <div class="item">
            <div class="item-foto"><img src="${elemento.imagen}" alt="${elemento.nombre}" style="width: 100%; max-width: 80px;"></div>
            <div class="item-info">
                <p class="item-nombre">${elemento.nombre}</p>
                <p class="item-precio">S/ ${elemento.precio.toFixed(2)} c/u</p>
                <a href="#" class="eliminar deleteProduct" data-id="${elemento.id}">Eliminar</a>
            </div>
            <input type="number" class="item-cantidad" value="${elemento.cantidad}" min="1" max="20" aria-label="Cantidad">
            <p class="item-subtotal">S/ ${(elemento.cantidad * elemento.precio).toFixed(2)}</p>
        </div>
        `;
        total += (elemento.cantidad * elemento.precio);
    }
    return total;
}

let lista = document.getElementById("lista");

lista.addEventListener("click", async (e) => {
    
    if (e.target.classList.contains("deleteProduct")) {
        e.preventDefault();

        const enlaceEliminar = e.target;
                                                               
        const id = Number(enlaceEliminar.dataset.id); 
                                                                
        const tarjetaProducto = enlaceEliminar.closest(".item");

        try {
            await new Promise((resolve, reject) => {
                let transaction = db.transaction(["carrito"], "readwrite");
                const objectStore = transaction.objectStore("carrito");

                const solicitudLimpieza = objectStore.delete(id);

                solicitudLimpieza.onsuccess = function () {
                    console.log(`¡Producto con ID ${id} eliminado de IndexedDB!`);
                    
                                                                                      
                    if (tarjetaProducto) {
                        tarjetaProducto.remove();
                    }
                    
                    location.reload();

                    resolve();
                };

                solicitudLimpieza.onerror = function (error) {
                    console.error("Error al intentar eliminar el producto:", error);
                    reject(error);
                };
            });
            
                                                                                 
                                                                                           

        } catch (error) {
            console.error("Error en el proceso de eliminación:", error);
        }
    }
});

