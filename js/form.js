import { findAll } from "./loadProducts.js";

// 1. Elementos de control visual
const bloqueTarjeta = document.getElementById("pago-tarjeta");
const bloqueBilletera = document.getElementById("pago-billetera");

const radioTarjeta = document.getElementById("radio-tarjeta");
const radioYape = document.getElementById("radio-yape");
const radioPlin = document.getElementById("radio-plin");
const radioEfectivo = document.getElementById("radio-efectivo");

document.addEventListener("DOMContentLoaded", async()=> {
    const resumen = document.getElementById("resumen");
    
    let carrito = await findAll("carrito");
    const subtotal = parseFloat(sessionStorage.getItem("total")) || 0;
    resumen.innerHTML = "";
    resumen.innerHTML += `
        <h2>Tu pedido</h2>
    `;

    for(let p of carrito){
        resumen.innerHTML += `
            <div class="linea">
                <span>${p.nombre}</span>
                <span>${(p.precio * p.cantidad)}</span>
            </div>
        `;
    }

    resumen.innerHTML += `
        <div class="linea">
            <span>Delivery</span>
            <span>S/ 4.00</span>
        </div>
        <div class="linea total">
            <span>Total</span>
            <span>${subtotal+4}</span>
        </div>
    `
    

});


// 2. Control de visibilidad
function actualizarFormulario() {
  bloqueTarjeta.hidden = true;
  bloqueBilletera.hidden = true;

  if (radioTarjeta.checked) {
    bloqueTarjeta.hidden = false;
  } else if (radioYape.checked || radioPlin.checked) {
    bloqueBilletera.hidden = false;
  }
}

radioTarjeta.addEventListener("change", actualizarFormulario);
radioYape.addEventListener("change", actualizarFormulario);
radioPlin.addEventListener("change", actualizarFormulario);
radioEfectivo.addEventListener("change", actualizarFormulario);

// --- FORMULARIO Y VALIDACIONES ---
const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", (e) => {
    e.preventDefault(); // Detiene el envío automático

    // Capturar datos personales
    const nombreInput = document.getElementById("nombre");
    const dniInput = document.getElementById("dni");
    const celularInput = document.getElementById("celular");
    const correoInput = document.getElementById("correo");
    const direccionInput = document.getElementById("direccion");
    const distritoInput = document.getElementById("distrito");
    const referenciaInput = document.getElementById("referencia");

    const nombre = nombreInput.value.trim();
    const dni = dniInput.value.trim();
    const celular = celularInput.value.trim();
    const correo = correoInput.value.trim();
    const direccion = direccionInput.value.trim();
    const distrito = distritoInput.value.trim();
    const referencia = referenciaInput.value.trim();

    // 1. Validaciones Personales Estándar
    if (nombre.length < 3) {
        alert("Por favor, ingresa tu nombre completo (mínimo 3 letras).");
        nombreInput.focus();
        return;
    }

    const regexDni = /^[0-9]{8}$/; 
    if (!regexDni.test(dni)) {
        alert("El DNI debe tener exactamente 8 dígitos numéricos.");
        dniInput.focus();
        return;
    }

    const regexCelular = /^9[0-9]{8}$/;
    if (!regexCelular.test(celular)) {
        alert("El número de celular debe ser válido en Perú (9 dígitos y empezar con 9).");
        celularInput.focus();
        return;
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
        alert("Por favor, ingresa un correo electrónico válido.");
        correoInput.focus();
        return;
    }

    if (direccion.length < 5) {
        alert("Por favor, ingresa una dirección de entrega válida.");
        direccionInput.focus();
        return;
    }

    if (distrito === "" || distrito === "seleccionar") {
        alert("Por favor, selecciona o ingresa tu distrito.");
        distritoInput.focus();
        return;
    }

    // 2. VARIABLES DE PAGO VACÍAS (Se llenarán según el caso)
    let metodoSeleccionado = "";
    let detallePago = "Efectivo contra entrega";

    // 🎯 3. VALIDACIÓN CONDICIONAL DE MÉTODOS DE PAGO

    if (radioTarjeta.checked) {
        metodoSeleccionado = "Tarjeta";
        
        const tarjetaInput = document.getElementById("tarjeta");
        const venceInput = document.getElementById("vence");
        const cvvInput = document.getElementById("cvv");

        const tarjeta = tarjetaInput.value.replace(/\s+/g, ''); // Quita espacios si los hay
        const vence = venceInput.value.trim();
        const cvv = cvvInput.value.trim();

        // Validar tarjeta (Entre 13 y 19 dígitos)
        const regexTarjeta = /^[0-9]{13,19}$/;
        if (!regexTarjeta.test(tarjeta)) {
            alert("Por favor, ingresa un número de tarjeta válido (solo dígitos).");
            tarjetaInput.focus();
            return;
        }
        

        // Validar Vencimiento (Formato MM/AA)
        const regexVence = /^(0[1-9]|1[0-2])\/[0-9]{2}$/;
        if (!regexVence.test(vence)) {
            alert("El formato de vencimiento debe ser MM/AA (Ej: 12/28).");
            venceInput.focus();
            return;
        }

        // Validar CVV (3 o 4 números)
        const regexCvv = /^[0-9]{3,4}$/;
        if (!regexCvv.test(cvv)) {
            alert("El código CVV debe tener 3 o 4 dígitos numéricos.");
            cvvInput.focus();
            return;
        }


        // Si pasa, guardamos la máscara de la tarjeta de forma segura en el detalle
        detallePago = `Tarjeta terminada en: **** ${tarjeta.slice(-4)}`;

    } else if (radioYape.checked || radioPlin.checked) {
        metodoSeleccionado = radioYape.checked ? "Yape" : "Plin";

        const celularBilleteraInput = document.getElementById("celular-billetera");
        const codigoInput = document.getElementById("celular-codigo");

        const celularBilletera = celularBilleteraInput.value.trim();
        const codigo = codigoInput.value.trim();

        // Validar el celular de la billetera (Igual al de arriba)
        if (!regexCelular.test(celularBilletera)) {
            alert(`Ingresa el número de celular asociado a tu cuenta de ${metodoSeleccionado}.`);
            celularBilleteraInput.focus();
            return;
        }

        // Validar código de aprobación (Estrictamente 6 números)
        const regexCodigo = /^[0-9]{6}$/;
        if (!regexCodigo.test(codigo)) {
            alert(`El código de aprobación de ${metodoSeleccionado} debe tener exactamente 6 números.`);
            codigoInput.focus();
            return;
        }

        detallePago = `${metodoSeleccionado} - Código: ${codigo}`;

    } else if (radioEfectivo.checked) {
        metodoSeleccionado = "Efectivo";
        detallePago = "Pago en efectivo contra entrega";
    }

    // la fecha
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = ahora.getMonth() + 1;
    const dia = ahora.getDate();
    const hora = ahora.getHours();
    const minutos = ahora.getMinutes().toString().padStart(2, '0');

    const fecha = `${dia} de ${mes} del ${anio} a las ${hora}:${minutos}`;


    // --- TODO VALIDADO CON ÉXITO ---
    console.log("¡Todo perfecto! Guardando datos de la compra...");

    // 4. Empaquetar el objeto final con los datos correspondientes

    const numeroFacturaAleatorio = Math.floor(10000 + Math.random() * 90000);
    const numeroPedidoAleatorio = Math.random().toString(36).substring(2, 8).toUpperCase();
    const datosComprador = {
        nombre,
        dni,
        celular,
        correo,
        direccion,
        distrito,
        referencia,
        metodo_pago: metodoSeleccionado,
        informacion_pago: detallePago,
        estado: "pagado",
        fecha: fecha,
        pedido_N: numeroPedidoAleatorio,
        n_factura: numeroFacturaAleatorio,
    }

    // 5. Guardar en el sessionStorage
    sessionStorage.setItem("datosComprador", JSON.stringify(datosComprador));

    // 6. Viajar con seguridad a la factura
    window.location.href = "factura.html"; 
});
