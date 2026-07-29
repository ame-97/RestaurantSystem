
/*
   paginas:
   [ rutaHTML, nombreVisible, palabrasClave ]

   - nombreVisible: nombre principal del platillo
   - palabrasClave: sinónimos o variaciones para facilitar búsqueda
*/
let paginas = [
    ["../platillos/ensalada.html", "Ensaladas","ensalada, entrada"],
    ["../platillos/ham.html", "Hamburguesa","hamburguesa, hamburguesas"],
    ["../platillos/helado.html", "Helado","helados, helado"],
    ["../platillos/nachos.html", "Nachos","nacho, nachos"],
    ["../platillos/pastel.html", "Pastel","pastel, pasteles"],
    ["../platillos/pizza.html", "Pizza","pizza, pizzas"],
    ["../platillos/refres.html", "Refresco","refresco, refrescos"],
    ["../platillos/taco.html", "Taco","taco, tacos"],
    ["../platillos/aguasFres.html", "Aguas Frescas","aguas frescas, agua, aguas, frescas"],
];

function buscar() {

    // Obtiene valor ingresado por el usuario
    let input = document.getElementById("search");
    let tema = input.value.toLowerCase().trim();

    // Elemento donde se muestran mensajes de estado
    let mensaje = document.getElementById("mensajeBusqueda");

    // Limpia mensajes previos
    mensaje.textContent = "";
    mensaje.classList.remove("error");

    //  Validación: campo vacío
    if (tema === "") {
        mensaje.textContent = "Por favor escribe algo para buscar.";
        mensaje.classList.add("error");
        return;
    }

    /*
       Recorre el arreglo buscando coincidencias:
       - en el título del platillo
       - en palabras clave asociadas
    */
    for (let i = 0; i < paginas.length; i++) {
        let archivo = paginas[i][0];
        let titulo = paginas[i][1].toLowerCase();
        let palabrasClave = paginas[i][2].toLowerCase();

        if (titulo.includes(tema) || palabrasClave.includes(tema)) {
            // Redirección directa al primer resultado encontrado
            window.location.href = archivo;
            return;
        }
    }

    // Si no encuentra coincidencias
    mensaje.textContent = "No se encontró ningún platillo con ese nombre.";
    mensaje.classList.add("error");
}


