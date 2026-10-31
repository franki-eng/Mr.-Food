// Inicio de sesión y registro de usuarios usando la base de datos MiTienda.
document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("loginForm");

  formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const celular = document.getElementById("celular").value.trim();

    // Validaciones
    if (!nombre) {
      alert("El nombre no puede estar vacío.");
      return;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(nombre)) {
      alert("El nombre solo puede contener letras.");
      return;
    }

    if (!/^\d{9}$/.test(celular)) {
      alert("El celular debe tener exactamente 9 dígitos.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.com$/i.test(correo)) {
      alert("El correo debe tener @ y terminar en .com.");
      return;
    }

    if (password.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      const passwordHash = await encriptarPassword(password);
      const db = await abrirBaseDatos();
      const transaccion = db.transaction("usuarios", "readwrite");
      const almacenUsuarios = transaccion.objectStore("usuarios");

      // En createDB.js, "correo" es la clave principal de usuarios.
      const busqueda = almacenUsuarios.get(correo);

      busqueda.onsuccess = () => {
        const usuarioExistente = busqueda.result;

        if (usuarioExistente) {
          if (usuarioExistente.password !== passwordHash) {
            alert("La contraseña es incorrecta.");
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
          password: passwordHash,
        };

        const agregar = almacenUsuarios.add(nuevoUsuario);

        agregar.onsuccess = () => {
          sessionStorage.setItem(
            "usuario",
            JSON.stringify(nuevoUsuario)
          );
          alert("Usuario registrado correctamente. ¡Bienvenido!");
          window.location.href = "index.html";
        };

        agregar.onerror = () => {
          console.error("No se pudo registrar el usuario:", agregar.error);
          alert("No se pudo registrar el usuario. Comprueba si el correo o celular ya están registrados.");
        };
      };

      busqueda.onerror = () => {
        console.error("Error al buscar el usuario:", busqueda.error);
        alert("No se pudo consultar el usuario.");
      };

      transaccion.onerror = () => {
        console.error("Error en la transacción:", transaccion.error);
      };
    } catch (error) {
      console.error("Error en el proceso de registro o inicio de sesión:", error);
      alert("Ocurrió un error al procesar los datos. Revisa la consola para más detalles.");
    }
  });
});

function abrirBaseDatos() {
  return new Promise((resolve, reject) => {
    // Se mantiene la misma base de datos y versión que createDB.js.
    const solicitud = indexedDB.open("MiTienda", 4);

    solicitud.onsuccess = () => {
      const db = solicitud.result;

      if (!db.objectStoreNames.contains("usuarios")) {
        db.close();
        reject(new Error("No existe el almacén 'usuarios'. Abre primero la página principal para inicializar la base de datos."));
        return;
      }

      db.onversionchange = () => db.close();
      resolve(db);
    };

    solicitud.onerror = () => reject(solicitud.error);
    solicitud.onblocked = () => reject(new Error("La base de datos está bloqueada. Cierra otras pestañas de Mr. Food e inténtalo nuevamente."));
  });
}

async function encriptarPassword(password) {
  const datos = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
