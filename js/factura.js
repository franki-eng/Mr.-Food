import { limpiarTablaIndexedDB } from "./app.js";
import { findAll } from "./loadProducts.js"; 

document.addEventListener("DOMContentLoaded", async () => {
    
    const factura = document.getElementById("factura");

                                                                  
    const infoRaw = sessionStorage.getItem("datosComprador");
    if (!infoRaw) {
        console.error("No se encontraron datos del comprador.");
        return;
    }
    const info = JSON.parse(infoRaw);

                                          
    const subtotal = parseFloat(sessionStorage.getItem("total")) || 0;
    let productos = await findAll("carrito"); 
    
    factura.innerHTML = "";

    let totalFinal = (subtotal+4).toFixed(2)
    let opGravada = ((totalFinal) / 1.18).toFixed(2);
    let igv = ((totalFinal) - opGravada).toFixed(2);

                                                                      
    factura.innerHTML = `
        <div class="factura-titulo">
        <h2>Factura</h2>
        <p>${info.n_factura}</p> 
      </div>

      <div class="datos">
        <div>
          <h3>Datos del cliente</h3>
          <p><strong>Nombre:</strong> ${info.nombre}</p>
          <p><strong>DNI:</strong> ${info.dni}</p>
          <p><strong>Correo:</strong> ${info.correo}</p>
          <p><strong>Dirección:</strong> ${info.direccion}</p>
        </div>

        <div>
          <h3>Datos del pedido</h3>
          <p><strong>Fecha:</strong> ${info.fecha}</p> 
          <p><strong>Pedido N.º:</strong> ${info.pedido_N}</p> 
          <p><strong>Método de pago:</strong> ${info.metodo_pago}</p>
          <p><strong>Estado:</strong> ${info.estado}</p> 
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Cant.</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody id="cuerpo-tabla-factura">
          
        </tbody>
      </table>

      <div class="totales">
        <div class="linea">
          <span>Op. Gravada</span>
          <span>S/ ${opGravada}</span>
        </div>
        <div class="linea">
          <span>IGV (18%)</span>
          <span>S/ ${igv}</span>
        </div>
        <div class="linea total">
          <span>Total pagado</span>
          <span>S/ ${totalFinal}</span>
        </div>
      </div>
    `;

                                                                              
    const cuerpoTabla = document.getElementById("cuerpo-tabla-factura");
    
    for (let prod of productos) {
        cuerpoTabla.innerHTML += `
          <tr>
            <td>${prod.nombre}</td>
            <td>${prod.cantidad}</td>
            <td>S/ ${(prod.precio * prod.cantidad).toFixed(2)}</td>
          </tr>
        `;
    }

                                    
    cuerpoTabla.innerHTML += `
      <tr>
        <td>🛵 Delivery</td>
        <td>1</td>
        <td>S/ 4.00</td>
      </tr>
    `;

                                                                                            
    try {
        await limpiarTablaIndexedDB();
        console.log("IndexedDB vaciado con éxito.");
    } catch (dbError) {
        console.error("Error al limpiar IndexedDB:", dbError);
    }

                                                      
    sessionStorage.removeItem("datosComprador");
    sessionStorage.removeItem("total");
    console.log("SessionStorage limpio.");
});
