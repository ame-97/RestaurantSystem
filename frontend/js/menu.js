document.addEventListener("DOMContentLoaded", function () {
  const API_BASE = "http://localhost:61828/api";
  const IMG_BASE = "http://localhost:61828/img/";

  const searchInput = document.getElementById("search");
  const mensajeBusqueda = document.getElementById("mensajeBusqueda");
  const estadoApiMenu = document.getElementById("estadoApiMenu");
  const contenedorProductos = document.getElementById("productosApi");
  const categoryFilters = document.getElementById("categoryFilters");

  let productosCompletos = [];
  let categoriaActiva = "all";

  async function request(url) {
    const response = await fetch(url);
    const text = await response.text();

    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (error) {
        data = text;
      }
    }

    if (!response.ok) {
      throw new Error(typeof data === "string" ? data : `Error HTTP ${response.status}`);
    }

    return data;
  }

  async function getAll(resource) {
    return request(`${API_BASE}/${resource}`);
  }

  async function cargarMenu() {
    try {
      estadoApiMenu.textContent = "Cargando productos desde la API...";

      const [productos, detalles, imagenes, categorias] = await Promise.all([
        getAll("producto"),
        getAll("detalleproducto"),
        getAll("imagen"),
        getAll("categorias")
      ]);

      productosCompletos = productos.map(function (producto) {
        const detalle = detalles.find(item => item.ProductoId === producto.Id);
        const imagen = imagenes.find(item => item.ProductoId === producto.Id);
        const categoriaObj = categorias.find(c => c.Id === producto.CategoriaId);

        return {
          id: producto.Id,
          nombre: producto.Nombre,
          categoria: categoriaObj ? categoriaObj.Nombre : "Sin categoría",
          descripcion: detalle ? detalle.Descripcion : "Sin descripcion disponible",
          precio: detalle ? detalle.Precio : "Precio pendiente",
          imagen: imagen
            ? `${IMG_BASE}${imagen.Url}`
            : "img/entrada.png"
        };
      });

      pintarBotonesCategorias(productosCompletos);
      pintarProductos(productosCompletos);
      estadoApiMenu.textContent = `Se cargaron ${productosCompletos.length} productos desde la API.`;
    } catch (error) {
      estadoApiMenu.textContent = "No se pudo conectar con la API.";
      console.error(error);
    }
  }

  function pintarProductos(lista) {
    if (!lista.length) {
      contenedorProductos.innerHTML = `
        <article class="card">
          <div class="card-body">
            <h3>Sin productos</h3>
            <p class="api-text">No hay datos para mostrar.</p>
          </div>
        </article>
      `;
      return;
    }

    contenedorProductos.innerHTML = lista.map(function (producto) {
      return `
        <article class="card">
          <img src="${producto.imagen}" alt="${producto.nombre}">
          <div class="card-body">
            <h3>${producto.nombre}</h3>
            <p class="api-text">${producto.descripcion}</p>
            <p class="api-category">${producto.categoria}</p>
            <span class="price">$${producto.precio}</span>
          </div>
        </article>
      `;
    }).join("");
  }

  function filtrarProductos() {
    const texto = searchInput.value.toLowerCase().trim();

    const filtrados = productosCompletos.filter(function (producto) {
      const coincideCategoria =
        categoriaActiva === "all" ||
        producto.categoria.toLowerCase() === categoriaActiva;

      return (
        coincideCategoria &&
        (
          producto.nombre.toLowerCase().includes(texto) ||
          producto.categoria.toLowerCase().includes(texto) ||
          producto.descripcion.toLowerCase().includes(texto)
        )
      );
    });

    pintarProductos(filtrados);

    if (texto === "") {
      mensajeBusqueda.textContent = categoriaActiva === "all"
        ? ""
        : `Categoria seleccionada: ${categoriaActiva}`;
    } else {
      mensajeBusqueda.textContent = `Resultados encontrados: ${filtrados.length}`;
    }
  }

  function pintarBotonesCategorias(lista) {
    const categoriasUnicas = [];

    lista.forEach(function (producto) {
      const categoria = producto.categoria.trim();

      if (!categoriasUnicas.includes(categoria)) {
        categoriasUnicas.push(categoria);
      }
    });

    categoryFilters.innerHTML = `
      <button type="button" class="filter-btn active" data-category="all">Todos</button>
      ${categoriasUnicas.map(function (categoria) {
        return `<button type="button" class="filter-btn" data-category="${categoria.toLowerCase()}">${categoria}</button>`;
      }).join("")}
    `;

    categoryFilters.querySelectorAll(".filter-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        categoryFilters.querySelectorAll(".filter-btn").forEach(function (item) {
          item.classList.remove("active");
        });

        button.classList.add("active");
        categoriaActiva = button.dataset.category;
        filtrarProductos();
      });
    });
  }

  searchInput.addEventListener("input", filtrarProductos);

  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get("search");
  const categoryQuery = params.get("category");

  if (searchQuery) {
    searchInput.value = searchQuery;
  }

  cargarMenu().then(function () {
    if (categoryQuery) {
      categoriaActiva = categoryQuery.toLowerCase();

      const botonActivo = categoryFilters.querySelector(`[data-category="${categoriaActiva}"]`);

      if (botonActivo) {
        categoryFilters.querySelectorAll(".filter-btn").forEach(function (item) {
          item.classList.remove("active");
        });

        botonActivo.classList.add("active");
      } else {
        categoriaActiva = "all";
      }
    }

    filtrarProductos();
  });
});