                                          

document.addEventListener("DOMContentLoaded", async () => {
  try {
    let allProducts = await findAll("productos");
    renderizarCatalogo(allProducts);
  } catch (error) {
    console.error("Error en el catálogo:", error);
  }
});

export async function findAll(tabla) {
  return await new Promise((resolve, reject) => {
    const solicitud = indexedDB.open("MiTienda", 6);

    solicitud.onsuccess = (evento) => {
      const db = evento.target.result;
      const transaccion = db.transaction([tabla], "readonly");
      const almacen = transaccion.objectStore(tabla);
      const peticion = almacen.getAll();

      peticion.onsuccess = () => resolve(peticion.result);
      peticion.onerror = () => reject(peticion.error);
    };

    solicitud.onerror = () => reject(solicitud.error);
  });
}

function renderizarCatalogo(listaDeComidas) {
  const listProducto = document.getElementById("productosTodos");
  listProducto.innerHTML = "";

  for (let product of listaDeComidas) {
    listProducto.innerHTML += `
            <a href="seleccion.html" class="producto seleccionado">
                <div class="foto"><img src="${product.imagen}" data-id="${product.id}"></div>
                <p class="nombre">${product.nombre}</p>
                <p class="precio">S/ ${product.precio}</p>
            </a>
        `;
  }

                                                                          
  configurarEventosClick();
}

export function loadProduct(product, productHtml) {
  productHtml.innerHTML = "";
  productHtml.innerHTML += `
        
        <div class="izquierda" id="producto">
            
            <div class="foto"><img src="${product.imagen}" data-id="${product.id}" alt="${product.nombre}" /></div>
            <a href="carrito.html" class="boton-pedido">Añadir al carrito</a>
        </div>

        
        <div class="derecha">
        
        <h1>${product.nombre}</h1>
        <p class="precio-producto">S/ ${product.precio}</p>
        <p class="descripcion">${product.descripcion}</p>

        <h2>Más información</h2>

        
        <details>
            <summary>Información nutricional</summary>
            <p>${product.informacion_nutricional}</p>
        </details>

        <details>
            <summary>Información sobre alérgenos</summary>
            <p>${product.alergenos}</p>
        </details>
        </div>
        `;
}

function configurarEventosClick() {
  let seleccionados = document.getElementsByClassName("seleccionado");
  console.log(seleccionados);
                                                            
  for (let elemento of seleccionados) {
    elemento.addEventListener("click", (event) => {
                                                                                            
      event.preventDefault();

                                                                      
      const imagen = elemento.querySelector("img");

                                                    
      const idObtenido = imagen.getAttribute("data-id");

      console.log("ID obtenido:", idObtenido);

                                             
      sessionStorage.setItem("idProductoSeleccionado", idObtenido);

                                                  
      window.location.href = "seleccion.html";
    });
  }
}
