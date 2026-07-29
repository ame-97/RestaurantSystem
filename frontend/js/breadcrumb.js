/* ============================================
   breadcrumb.js
   Genera dinámicamente la ruta de navegación
   usando un mapa jerárquico basado en IDs.
============================================ */

/*
   mapaRutas:
   Estructura tipo árbol donde cada elemento contiene:
   [ idPagina, nombreVisible, rutaHTML ]

   La lógica usa IDs progresivos (pag → pag1 → pag11…)
   para construir el breadcrumb automáticamente.
*/
let mapaRutas = [
    ["pag", "Inicio", "../index.html"],
    ["pag1", "Menú", "../menu.html"],

    ["pag11", "Entradas", "../platillos/entradas.html"],
    ["pag12", "Platillos Fuertes", "../platillos/platosFuertes.html"],
    ["pag13", "Bebidas", "../platillos/bebidas.html"],
    ["pag14", "Postres", "../platillos/postres.html"],

    ["pag111", "Nachos", "../platillos/nachos.html"],
    ["pag112", "Ensalada", "../platillos/ensalada.html"],

    ["pag121", "Hamburguesa", "../platillos/ham.html"],
    ["pag122", "Pizza", "../platillos/pizza.html"],
    ["pag123", "Tacos", "../platillos/tacos.html"],

    ["pag131", "Refresco", "../platillos/refres.html"],
    ["pag132", "Agua Fresca", "../platillos/aguasFres.html"],

    ["pag141", "Pastel", "../platillos/pastel.html"],
    ["pag142", "Helado", "../platillos/helado.html"]
];

/*
   Al cargar la página se construye automáticamente
   el breadcrumb según el id del contenedor.
*/
window.onload = function () {
    crearBreadCrumbs();
};

function crearBreadCrumbs() {

    // Obtiene el primer elemento con clase bread
    let archiv = document.getElementsByClassName("bread")[0];

    // ID actual (ej: pag123)
    let buscar = archiv.getAttribute("id");

    let camino = "";

    /*
       Va recortando el ID poco a poco para generar
       la jerarquía completa:
       pag123 → pag12 → pag1 → pag
    */
    while (buscar.length >= 3) {
        camino = buscaId(buscar) + camino;
        buscar = buscar.substring(0, buscar.length - 1);
    }

    // Construye el HTML final del breadcrumb
    let ruta = "<ul class='breadcrumb'>" + camino + "</ul>";
    archiv.innerHTML = ruta;
}

function buscaId(idBuscado) {

    /*
       Busca dentro del mapa la coincidencia del id
       y devuelve el elemento <li> correspondiente.
    */
    for (let i = 0; i < mapaRutas.length; i++) {

        if (mapaRutas[i][0] == idBuscado) {
            return "<li><a href='" + mapaRutas[i][2] + "'>" + mapaRutas[i][1] + "</a></li>";
        }

    }

    // Si no encuentra coincidencia, no agrega nada
    return "";
}