$(document).ready(function () {
  const claveResenas = "mrfood_resenas";

  function obtenerResenas() {
    try {
      const datos = JSON.parse(localStorage.getItem(claveResenas) || "[]");

      return Array.isArray(datos) ? datos : [];
    } catch (error) {
      return [];
    }
  }

  function mostrarResenas() {
    const resenas = obtenerResenas();
    const lista = $("#listaResenas");

    lista.empty();

    if (resenas.length === 0) {
      $("<p>")
        .addClass("text-muted")
        .text("Todavía no hay reseñas. ¡Sé el primero en opinar!")
        .appendTo(lista);

      return;
    }

    resenas
      .slice()
      .reverse()
      .forEach(function (resena) {
        const tarjeta = $("<div>").addClass("card shadow-sm mb-3");

        const contenido = $("<div>").addClass("card-body");

        $("<h5>")
          .addClass("card-title")
          .text(resena.nombre)
          .appendTo(contenido);

        $("<p>")
          .addClass("text-warning fs-5 mb-1")
          .text(
            "★".repeat(resena.calificacion) +
              "☆".repeat(5 - resena.calificacion)
          )
          .appendTo(contenido);

        $("<p>")
          .addClass("text-muted small")
          .text(resena.producto + " · " + resena.fecha)
          .appendTo(contenido);

        $("<p>")
          .addClass("card-text")
          .text(resena.comentario)
          .appendTo(contenido);

        tarjeta.append(contenido);
        lista.append(tarjeta);
      });
  }

  $("#formResena").on("submit", function (event) {
    event.preventDefault();

    const nombre = $("#nombreResena").val().trim();
    const producto = $("#productoResena").val();
    const calificacion = Number($("#calificacionResena").val());
    const comentario = $("#comentarioResena").val().trim();

    if (
      !nombre ||
      !producto ||
      !Number.isInteger(calificacion) ||
      calificacion < 1 ||
      calificacion > 5 ||
      !comentario
    ) {
      alert("Completa todos los campos correctamente.");
      return;
    }

    const resenas = obtenerResenas();

    resenas.push({
      nombre: nombre,
      producto: producto,
      calificacion: calificacion,
      comentario: comentario,
      fecha: new Date().toLocaleDateString("es-PE"),
    });

    try {
      localStorage.setItem(claveResenas, JSON.stringify(resenas));
    } catch (error) {
      alert("No se pudo guardar la reseña en este navegador.");
      return;
    }

    this.reset();
    mostrarResenas();

    alert("¡Gracias por compartir tu opinión!");
  });

  mostrarResenas();
});
