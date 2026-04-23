// home/products_widget.js
import { api } from "../shared/api/api_routes.js";

const attributes = ["Nombre", "No. Parte", "Familia", "Peso Unitario"];

export async function renderProductsWidget({ titleEl, subtitleEl, containerEl }) {
    const { data: products } = await axios.get(api.products.getAll());

    if (titleEl) {
        titleEl.innerHTML = `
            <div class="flex items-center gap-2">
                Productos
                <span class="text-primary material-symbols-outlined">inventory_2</span>
            </div>
        `;
    }

    if (subtitleEl) {
        subtitleEl.innerHTML = `
            <div class="px-6 py-2 flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">category</span>
                    <h3 class="text-slate-900 text-xl font-extrabold tracking-tight">Catálogo de Productos</h3>
                </div>
                <span class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                    ${products.length} productos
                </span>
            </div>
        `;
    }

    containerEl.innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr>
                        ${attributes.map(a => `
                            <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">${a}</th>
                        `).join("")}
                    </tr>
                </thead>
                <tbody id="productsWidgetBody">
                    ${products.map(p => `
                        <tr data-id="${p.id}" class="productData hover:bg-slate-200 transition-colors cursor-pointer">
                            <td class="px-6 py-4 text-sm text-slate-700">${p.name}</td>
                            <td class="px-6 py-4 text-sm font-medium text-slate-700">${p.part_number}</td>
                            <td class="px-6 py-4 text-xs text-slate-500">${p.family ?? "N/A"}</td>
                            <td class="px-6 py-4 text-xs text-slate-500">${p.unit_weight} kg</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;

    containerEl.addEventListener("click", (e) => {
        const row = e.target.closest(".productData");
        if (!row) return;
        window.location.href = `/frontend/src/products/detailed_product.html?id=${row.dataset.id}`;
    });
}