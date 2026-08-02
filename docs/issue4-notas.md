# Issue #4 — Validación de dirección con geolocalización

## Contexto
Este issue dependía del Issue #3 (formulario de pedidos a domicilio, implementado
por Zayas), que ya incluía:
- Campos `calle`, `colonia`, `referencia` y campos ocultos `latitud`/`longitud`.
- Función `obtenerUbicacion()` que obtiene el GPS real del dispositivo mediante
  `navigator.geolocation.getCurrentPosition()`.
- Validación previa que solo verificaba que `latitud`/`longitud` tuvieran algún
  valor (permiso de ubicación otorgado), pero nunca confirmaba que la dirección
  escrita (calle/colonia) realmente existiera.

## Qué se implementó
- Se agregó validación de la dirección escrita usando la API gratuita de
  **Nominatim (OpenStreetMap)**.
- Se reutilizó el patrón visual ya existente en el proyecto
  (`input:valid` / `input:invalid` vía `element.setCustomValidity()`), en lugar
  de introducir clases o estilos nuevos.

### Cambios en `frontend/ordenar.html`
- Se agregó un elemento `<p id="estadoDireccion" class="api-order-status"></p>`
  dentro de `#datosDireccion`, después del input `referencia` y antes del input
  oculto `latitud`. Reutiliza la clase CSS `.api-order-status` ya existente en
  el proyecto (no se agregó CSS nuevo).

### Cambios en `frontend/js/orden.js`
- Nuevas constantes: `estadoDireccion`, `direccionValida`.
- Nueva función `validarDireccionEscrita()`, disparada con el evento `blur` en
  los campos `calle` y `colonia`.
- En el `else` del cambio de `tipoPedido` ("Para llevar"): se limpia
  `setCustomValidity` y se resetea `direccionValida`.
- En el `submit`: se agregó validación de `direccionValida` **antes** de la
  validación existente de latitud/longitud (esa lógica no se modificó).
- Al confirmar un pedido exitoso: se resetea `direccionValida` y el texto de
  `estadoDireccion`.
- `obtenerUbicacion()` y toda la lógica de GPS original **no se tocaron**.

## API usada y ajuste de precisión geográfica
Se usó Nominatim (OpenStreetMap), gratuita. Se detectó y corrigió un problema
de ambigüedad:
- Usar `city=Puebla` como texto devolvía resultados de otras zonas del estado
  (ej. Teziutlán) en vez de la capital.
- **Solución:** restringir la búsqueda con `viewbox=-98.30,19.15,-98.05,18.95`
  + `bounded=1` (caja geográfica exacta alrededor de Puebla capital), sin
  depender del texto "Puebla" como filtro de ciudad.

## Limitación conocida (aceptada)
Nominatim ofrece precisión a nivel de **calle/colonia**, no de edificio exacto.
Para precisión de edificio específico se necesitaría un servicio de pago como
Google Maps Geocoding API, lo cual queda fuera del alcance de este issue
(que pide "validar direcciones", no "geocodificar con precisión de edificio")
y del proyecto escolar en general.

## Pruebas realizadas
| # | Prueba | Resultado esperado | Resultado |
|---|--------|---------------------|-----------|
| 1 | Seleccionar "A domicilio" | Aparece bloque de dirección + pide permiso de ubicación | ✅ |
| 2 | Calle y colonia reales, blur en colonia | "Validando dirección..." → "Dirección válida", bordes verdes | ✅ |
| 3 | Dirección inventada | "No se encontró la dirección...", bordes rojos | ✅ |
| 4 | Campos muy cortos | "Completa calle y colonia para validar la dirección" | ✅ |
| 5 | Confirmar con dirección inválida | Alerta, no se envía el pedido | ✅ |
| 6 | Confirmar con dirección válida | Pedido se envía normalmente | ✅ |
| 7 | Cambiar de "A domicilio" a "Para llevar" y volver | Se limpia el estado, hay que re-validar | ✅ |
| 8 | Consola del navegador | Sin errores de red no controlados | ✅ |

**Resultado final confirmado:** con "Mariano Escobedo 73" / "Joaquín Colombres"
(Puebla capital), el sistema devolvió "Dirección válida" con coordenadas
correctas dentro de la ciudad.

## Alcance: 100% frontend
Se comparó `orden.js` contra `PedidoController.cs` y `Pedido.cs` del backend
para confirmar que los campos enviados coinciden con los esperados
(`UsuarioId`, `TipoPedido`, `Direccion`, `Latitud`, `Longitud`, `MetodoPago`,
`Detalles`). Todos coinciden — el backend ya exigía `Direccion`, `Latitud` y
`Longitud` cuando `TipoPedido == "A domicilio"`, así que **no fue necesario
modificar el backend** para este issue.

## Nota para el futuro (fuera del alcance de este issue)
El backend valida que existan latitud/longitud, pero no que correspondan
realmente a la dirección escrita — esa coherencia se resuelve del lado del
cliente con Nominatim. Si el equipo quiere blindar esto también en el
servidor, se recomienda abrirlo como un issue aparte.