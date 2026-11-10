document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("loginForm");

  if (!formulario) return;

  formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const celular = document.getElementById("celular").value.trim();

    const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
    const celularValido = /^\d{9}$/;
    const correoValido = /^[^\s@]+@[^\s@]+\.com$/i;

    if (!nombre || !nombreValido.test(nombre)) {
      alert("Ingresa un nombre válido. Solo se permiten letras.");
      return;
    }

    if (!celularValido.test(celular)) {
      alert("El celular debe tener exactamente 9 dígitos.");
      return;
    }

    if (!correoValido.test(correo)) {
      alert("Ingresa un correo válido que termine en .com.");
      return;
    }

    if (password.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      const db = await abrirBaseDatos();
      const passwordHash = await encriptarPassword(password);
      const transaccion = db.transaction("usuarios", "readwrite");
      const almacen = transaccion.objectStore("usuarios");
      const solicitudUsuario = buscarUsuario(almacen, correo);

      solicitudUsuario.onsuccess = () => {
        const usuarioExistente = solicitudUsuario.result;

        if (usuarioExistente) {
          if (usuarioExistente.password !== passwordHash) {
            alert("Correo o contraseña incorrectos.");
            return;
          }

          sessionStorage.setItem("usuario", JSON.stringify(usuarioExistente));
          alert("Inicio de sesión exitoso. ¡Bienvenido!");
          window.location.href = "index.html";
          return;
        }

        const nuevoUsuario = {
          nombre,
          correo,
          celular,
          password: passwordHash
        };

        const solicitudAgregar = almacen.add(nuevoUsuario);

        solicitudAgregar.onsuccess = () => {
          const usuarioGuardado = {
            ...nuevoUsuario,
            id: solicitudAgregar.result
          };
          sessionStorage.setItem("usuario", JSON.stringify(usuarioGuardado));
          alert("Usuario registrado e ingresado correctamente.");
          window.location.href = "index.html";
        };

        solicitudAgregar.onerror = () => {
          console.error("Error al registrar usuario:", solicitudAgregar.error);
          alert("No se pudo registrar el usuario. Comprueba que el correo y celular no estén registrados.");
        };
      };

      solicitudUsuario.onerror = () => {
        console.error("Error al buscar usuario:", solicitudUsuario.error);
        alert("No se pudo consultar el usuario.");
      };

      transaccion.onabort = () => {
        console.error("Transacción cancelada:", transaccion.error);
      };
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      alert("Ocurrió un error al procesar los datos.");
    }
  });
});

function abrirBaseDatos() {
  return new Promise((resolve, reject) => {
    const solicitud = indexedDB.open("MiTienda", 6);

    solicitud.onupgradeneeded = (event) => {
      const db = event.target.result;
      const transaccion = event.target.transaction;

                                                               
                                                                                           
      if (!db.objectStoreNames.contains("productos")) {
        const productos = db.createObjectStore("productos", {
          keyPath: "id",
          autoIncrement: true
        });
        productos.createIndex("imagen", "imagen", { unique: false });
        productos.createIndex("nombre", "nombre", { unique: false });
        productos.createIndex("cantidad", "cantidad", { unique: false });
        productos.createIndex("precio", "precio", { unique: false });
        productos.createIndex("descripcion", "descripcion", { unique: false });
        productos.createIndex("informacion_nutricional", "informacion_nutricional", { unique: false });
        productos.createIndex("alergenos", "alergenos", { unique: false });
      }

      if (!db.objectStoreNames.contains("usuarios")) {
        const usuarios = db.createObjectStore("usuarios", {
          keyPath: "correo",
          autoIncrement: false
        });
        usuarios.createIndex("nombre", "nombre", { unique: false });
        usuarios.createIndex("password", "password", { unique: false });
        usuarios.createIndex("celular", "celular", { unique: true });
      }

      if (!db.objectStoreNames.contains("carrito")) {
        db.createObjectStore("carrito", { keyPath: "id" });
      }
    };

    solicitud.onsuccess = () => {
      const db = solicitud.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };

    solicitud.onerror = () => reject(solicitud.error);
    solicitud.onblocked = () => reject(
      new Error("Cierra las otras pestañas de Mr. Food y vuelve a intentarlo.")
    );
  });
}

function buscarUsuario(almacen, correo) {
  if (almacen.keyPath === "correo") {
    return almacen.get(correo);
  }

  if (almacen.indexNames.contains("correo")) {
    return almacen.index("correo").get(correo);
  }

  throw new Error("La tabla de usuarios no tiene un índice para buscar el correo.");
}

async function encriptarPassword(password) {
  if (!window.crypto?.subtle) {
    throw new Error("Abre el proyecto con Live Server o mediante HTTPS para proteger la contraseña.");
  }

  const datos = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", datos);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
