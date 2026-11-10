import { productosComidaRapida } from "./data.js";
import { crearProductos } from "./app.js";
export let db;

document.addEventListener("DOMContentLoaded", () => {
  const solicitud = indexedDB.open("MiTienda", 6);

  solicitud.onupgradeneeded = (evento) => {
    db = evento.target.result;

                                     
    if (!db.objectStoreNames.contains("productos")) {
      const almacenProductos = db.createObjectStore("productos", {
        keyPath: "id",
        autoIncrement: true,
      });
      almacenProductos.createIndex("imagen", "imagen", { unique: false });
      almacenProductos.createIndex("nombre", "nombre", { unique: false });
      almacenProductos.createIndex("cantidad", "cantidad", { unique: false });
      almacenProductos.createIndex("precio", "precio", { unique: false });
      almacenProductos.createIndex("descripcion", "descripcion", {
        unique: false,
      });
      almacenProductos.createIndex(
        "informacion_nutricional",
        "informacion_nutricional",
        { unique: false }
      );
      almacenProductos.createIndex("alergenos", "alergenos", { unique: false });
    }

                                    
    if (!db.objectStoreNames.contains("usuarios")) {
      const almacenClientes = db.createObjectStore("usuarios", {
        keyPath: "correo",
        autoIncrement: false,
      });
      almacenClientes.createIndex("nombre", "nombre", { unique: false });
      almacenClientes.createIndex("password", "password", { unique: false });
      almacenClientes.createIndex("celular", "celular", { unique: true });
      console.log("Columnas creadas");
    }

    if (!db.objectStoreNames.contains("carrito")) {
      db.createObjectStore("carrito", {
        keyPath: "id",
      });
    }
  };

  solicitud.onsuccess = (evento) => {
    db = evento.target.result;
    console.log("Base de datos lista con las tablas de productos y clientes.");

                                                                      
    const transaccion = db.transaction(["productos"], "readonly");
    const almacen = transaccion.objectStore("productos");
    const conteo = almacen.count();

    conteo.onsuccess = () => {
                                                                                              
      if (conteo.result === 0) {
        console.log("Insertando las 15 comidas peruanas iniciales...");
        for (let i = 0; i < productosComidaRapida.length; i++) {
          crearProductos(
            productosComidaRapida[i].imagen,
            productosComidaRapida[i].nombre,
            productosComidaRapida[i].precio,
            productosComidaRapida[i].cantidad,
            productosComidaRapida[i].descripcion,
            productosComidaRapida[i].info_nutricional,
            productosComidaRapida[i].info_alergicos
          );
        }
      } else {
        console.log(
          `La base de datos ya contiene ${conteo.result} productos. No se duplicarán.`
        );
      }
    };
  };

  solicitud.onerror = (evento) => {
    console.error("Error al abrir la base de datos:", evento.target.error);
  };
});
