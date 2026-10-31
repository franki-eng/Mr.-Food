import { crearCliente } from "./app";

document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("loginForm");

  formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value;
    const celular = document.getElementById("celular").value.trim();

    // Validaciones de entrada
    if (nombre === "") {
      alert("El nombre no puede estar vacío.");
      return;
    }

    const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
    if (!nombreValido.test(nombre)) {
      alert("El nombre solo puede contener letras.");
      return;
    }

    const celularValido = /^\d{9}$/;
    if (!celularValido.test(celular)) {
      alert("El celular debe tener exactamente 9 dígitos.");
      return;
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.com$/i;
    if (!correoValido.test(correo)) {
      alert("El correo debe tener @ y terminar en .com.");
      return;
    }

    if (password.length < 8) {
      // Corregido a menor que 8 para coherencia de alerta
      alert("La contraseña debe tener un mínimo de 8 caracteres.");
      return;
    }

    try {
      const passwordHash = await encriptarPassword(password);
      const db = await abrirBaseDatos();

      

      // Consultamos si el email ya existe utilizando el índice de correo
      const busqueda = usuario.correo;

      busqueda.onsuccess = () => {
        const usuarioExistente = busqueda.result;

        if (usuarioExistente) {
          // Si existe, validamos contraseñas
          if (usuarioExistente.password !== passwordHash) {
            alert("Correo o contraseña incorrectos.");
            return;
          }

          sessionStorage.setItem("usuario", JSON.stringify(usuarioExistente));
          alert("Inicio de sesión exitoso. ¡Bienvenido!");
          window.location.href = "index.html";
          return;
        }

        // Si el correo no existe en la base de datos, lo registramos como nuevo usuario
        const nuevoUsuario = {
          nombre: nombre,
          correo: correo,
          celular: celular,
          password: passwordHash,
        };

        const agregar = usuarios.add(nuevoUsuario);

        agregar.onsuccess = () => {
          sessionStorage.setItem(
            "usuario",
            JSON.stringify({
              id: agregar.result,
              ...nuevoUsuario,
            })
          );

          alert("Usuario registrado e ingresado correctamente.");
          setTimeout(() => {
            window.location.href = "index.html";
          }, 500);
        };

        agregar.onerror = () => {
          alert("No se pudo registrar el usuario.");
        };
      };
    } catch (error) {
      console.error("Error crítico en el proceso de login:", error);
      alert("Ocurrió un error al procesar los datos.");
    }
  });
});

// CORRECCIÓN: Sincronizada la apertura con la versión 3 de la base de datos general
function abrirBaseDatos() {
  return new Promise((resolve, reject) => {
    const solicitud = indexedDB.open("MiTienda", 4);

    solicitud.onupgradeneeded = (event) => {
      const db = event.target.result;

      // La página de login no carga createDB.js, por eso
      // creamos aquí el almacén que necesita el login.
      if (!db.objectStoreNames.contains("usuarios")) {
        const usuarios = db.createObjectStore("usuarios", {
          keyPath: "id",
          autoIncrement: true,
        });

        usuarios.createIndex("correo", "correo", { unique: true });
        usuarios.createIndex("nombre", "nombre", { unique: false });
        usuarios.createIndex("celular", "celular", { unique: false });
        usuarios.createIndex("password", "password", { unique: false });
      }
    };

    solicitud.onsuccess = (event) => {
      const db = event.target.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };

    solicitud.onerror = () => {
      reject(solicitud.error);
    };

    solicitud.onblocked = () => {
      reject(
        new Error(
          "La base de datos está bloqueada. Cierra otras pestañas de la tienda y vuelve a intentarlo."
        )
      );
    };
  });
}

// Encriptación nativa SHA-256
async function encriptarPassword(password) {
  const datos = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
