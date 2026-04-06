import { products } from "../shared/db.js";

const attributes = ["ID", "No. Parte", "Nombre", "Familia", "Peso Unitario", "Estado"];

export function loadProductos() {
    const title = document.getElementById("pageTitle");
    const search = document.getElementById("search");
    const newButton = document.getElementById("newButton");
    const thead = document.getElementById("listViewThead");
    const tbody = document.getElementById("listViewBody");

    title.textContent = "PRODUCTOS";
    search.placeholder = "Buscar Productos";

    // 🔹 Nuevo ID
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

    newButton.innerHTML = `
        <span class="material-icons text-lg group-hover:scale-110 transition-transform">add</span>
        Nuevo Producto`;

    newButton.classList.remove("hidden");

    newButton.onclick = () => {
        window.location.href = `/frontend/src/products/detailed_product.html?create=true&id=${newId}`;
    };

    // 🔹 Header
    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display">
            ${a}
        </th>
    `).join("");

    // 🔹 Body
    tbody.innerHTML = products.map(p => `
        <tr data-id="${p.id}" class="product-row bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">
                ${p.id}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">
                ${p.numeroDeParte}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">
                ${p.producto}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">
                ${p.familia}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">
                ${p.pesoUnitario} kg
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 py-1 text-xs font-bold rounded-full ${
                    p.estado === "Activo"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                }">
                    ${p.estado}
                </span>
            </td>
        </tr>
    `).join("");

    // 🔹 Click en fila (igual que consignee)
    document.querySelectorAll(".product-row").forEach(row => {
        row.addEventListener("click", () => {
            const id = row.dataset.id;
            window.location.href = `/frontend/src/products/detailed_product.html?id=${id}`;
        });
    });
}