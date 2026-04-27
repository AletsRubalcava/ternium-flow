/**
 * search_utils.js
 * Utilidad genérica de búsqueda para vistas con tabla.
 *
 * Uso:
 *   import { initSearch } from "../shared/utils/search_utils.js";
 *
 *   // Después de renderizar la tabla:
 *   initSearch("search", ".customer-row");
 *
 * @param {string} inputId       - ID del <input> de búsqueda.
 * @param {string} rowSelector   - Selector CSS de las filas buscables (e.g. ".customer-row").
 * @param {object} [options]
 * @param {string} [options.noResultsMsg]  - Texto del mensaje cuando no hay resultados.
 * @param {string} [options.containerId]   - ID del contenedor donde inyectar el mensaje vacío (default: "tableContainer").
 */
export function initSearch(inputId, rowSelector, options = {}) {
    const {
        noResultsMsg = "Sin resultados",
        containerId  = "tableContainer",
    } = options;

    const input = document.getElementById(inputId);
    if (!input) return;

    // Guarda el estado de "no hay resultados" para no repetir la inyección
    let emptyInjected = false;

    input.addEventListener("input", () => {
        applySearch(input.value, rowSelector, containerId, noResultsMsg, emptyInjected);
    });

    // También activa la búsqueda al presionar Enter
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            applySearch(input.value, rowSelector, containerId, noResultsMsg);
        }
    });

    // Activa el botón de búsqueda (flecha) si existe junto al input
    const btn = input.parentElement?.querySelector("button");
    if (btn) {
        btn.addEventListener("click", () => {
            applySearch(input.value, rowSelector, containerId, noResultsMsg);
        });
    }
}

/**
 * Filtra las filas visibles del DOM según el query.
 * Compara contra el texto de TODAS las celdas de cada fila.
 *
 * @param {string} query
 * @param {string} rowSelector
 * @param {string} containerId
 * @param {string} noResultsMsg
 */
export function applySearch(query, rowSelector, containerId = "tableContainer", noResultsMsg = "Sin resultados") {
    const normalized = query.trim().toLowerCase();
    const rows       = document.querySelectorAll(rowSelector);
    const container  = document.getElementById(containerId);

    // Limpia cualquier mensaje de "sin resultados" previo
    container?.querySelector(".search-empty-msg")?.remove();

    let visibleCount = 0;

    rows.forEach(row => {
        // Toma el texto de todas las celdas <td>
        const cellText = Array.from(row.querySelectorAll("td"))
            .map(td => td.textContent.trim().toLowerCase())
            .join(" ");

        const matches = !normalized || cellText.includes(normalized);
        row.style.display = matches ? "" : "none";
        if (matches) visibleCount++;
    });

    // Muestra mensaje si no hay coincidencias
    if (rows.length > 0 && visibleCount === 0 && container) {
        const msg = document.createElement("p");
        msg.className = "search-empty-msg text-center text-sm text-text-secondary-light py-8";
        msg.textContent = `${noResultsMsg} para "${query}"`;
        container.appendChild(msg);
    }
}