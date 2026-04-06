import { platformRequest, consignees, platforms } from "../shared/db.js";

const attributes = ["Tarima", "Consignatario", "Fecha Solicitud", "Acción"];

export function loadComercial() {
    const params = new URLSearchParams(window.location.search);

    const title = document.getElementById("pageTitle");
    const search = document.getElementById("search");
    const newButton = document.getElementById("newButton");
    const thead = document.getElementById("listViewThead");
    const tbody = document.getElementById("listViewBody");

    title.textContent = "COMERCIAL";
    search.placeholder = "Buscar Solicitudes";

    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
    `).join("");

    tbody.innerHTML = platformRequest.map(p => `
        <tr data-id="${p.idPlatform}" class="customer-row bg-gray-50/50 hover:bg-gray-100 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">${platforms.find(pl => pl.id == p.idPlatform).name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">${consignees.find(c => c.id == p.idConsignee).name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">${p.createDate}</td>
        </tr>
    `).join("");

    document.querySelectorAll(".customer-row").forEach(row => {
        row.addEventListener("click", () => {
            const id = row.dataset.id;
            window.location.href = `/frontend/src/platforms/detailed_platform.html?id=${id}`;
        });
    });
}