import { emptyWidget } from "../shared/empty_widget.js";

const attributes = ["Nombre", "No. Parte", "Familia", "Peso Unitario", "Estado"];

export async function loadProductos() {
    const { data: products } = await axios.get("http://localhost:3000/api/products")

    const tableContainer = document.getElementById("tableContainer");
    const title = document.getElementById("pageTitle");
    const search = document.getElementById("search");
    const newButton = document.getElementById("newButton");
    const thead = document.getElementById("listViewThead");
    const tbody = document.getElementById("listViewBody");

    title.textContent = "PRODUCTOS";
    search.placeholder = "Buscar Productos";

    newButton.innerHTML = `
        <span class="material-icons text-lg group-hover:scale-110 transition-transform">add</span>
        Nuevo Producto`;

    newButton.classList.remove("hidden");

    newButton.onclick = () => {
        window.location.href = `/frontend/src/products/detailed_product.html?create=true`;
    };

    if ( products.length != 0) {
        thead.innerHTML = attributes.map(a => `
            <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display">
                ${a}
            </th>
        `).join("");


        tbody.innerHTML = products.map(p => `
            <tr data-id="${p.id}" class="product-row bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">
                    ${p.name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">
                    ${p.part_number}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">
                    ${p.family ?? "N/A"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">
                    ${p.unit_weight} kg
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2 py-1 text-xs font-bold rounded-full ${
                        p.status == true
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }">
                        ${p.status ? "Activo" : "Inactivo"}
                    </span>
                </td>
            </tr>
        `).join("");
    } else {
        tableContainer.innerHTML = emptyWidget("No hay productos")
    }

    // 🔹 Click en fila (igual que consignee)
    document.querySelectorAll(".product-row").forEach(row => {
        row.addEventListener("click", () => {
            const id = row.dataset.id;
            window.location.href = `/frontend/src/products/detailed_product.html?id=${id}`;
        });
    });
}