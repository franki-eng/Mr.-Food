// Limpiamos el innerHTML antes de empezar

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
    const solicitud = indexedDB.open("MiTienda", 4);

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

  // Aquí puedes llamar al bucle for..of que creamos antes para los clicks
  configurarEventosClick();
}

export function loadProduct(product, productHtml) {
  productHtml.innerHTML = "";
  productHtml.innerHTML += `
        <!-- Columna izquierda: imagen + botón -->
        <div class="izquierda" id="producto">
            <!-- CORRECCIÓN: Se cerraron bien las comillas del data-id y se cerró la etiqueta img -->
            <div class="foto"><img src="${product.imagen}" data-id="${product.id}" alt="${product.nombre}" /></div>
            <a href="carrito.html" class="boton-pedido">Añadir al carrito</a>
        </div>

        <!-- Columna derecha: textos -->
        <div class="derecha">
        <!-- CORRECCIÓN: Se quitó la 'H' que estaba de más antes del nombre -->
        <h1>${product.nombre}</h1>
        <p class="precio-producto">S/ ${product.precio}</p>
        <p class="descripcion">${product.descripcion}</p>

        <h2>Más información</h2>

        <!-- <details> + <summary> = un desplegable que funciona SIN JavaScript -->
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
  // 2. Recorremos cada tarjeta individualmente con un bucle
  for (let elemento of seleccionados) {
    elemento.addEventListener("click", (event) => {
      // Evitamos que el enlace <a> recargue la página inmediatamente antes de guardar el ID
      event.preventDefault();

      // Buscamos la imagen dentro de la tarjeta actual que se clickeó
      const imagen = elemento.querySelector("img");

      // Obtenemos el atributo data-id de esa imagen
      const idObtenido = imagen.getAttribute("data-id");

      console.log("ID obtenido:", idObtenido);

      // Guardamos el ID en el sessionStorage
      sessionStorage.setItem("idProductoSeleccionado", idObtenido);

      // Ahora sí, cambiamos de página manualmente
      window.location.href = "seleccion.html";
    });
  }
}
