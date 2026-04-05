import { platforms, consignees, customers } from "../shared/db.js";

const attributes = ["Clave", "Nombre", "Consignatario", "Estado"];

export function loadPlatforms() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const customer = customers.find(c => c.id == id);

    const consigneeIds = consignees
        .filter(c => c.idCustomer == customer.id)
        .map(c => c.id);

    const platform = platforms.filter(p => consigneeIds.includes(p.idConsignee));

    const title = document.getElementById("pageTitle");
    const search = document.getElementById("search");
    const newButton = document.getElementById("newButton");
    const thead = document.getElementById("listViewThead");
    const tbody = document.getElementById("listViewBody");

    title.textContent = "TARIMAS";
    search.placeholder = "Buscar Tarimas";

    newButton.innerHTML = `
        <span class="material-icons text-lg group-hover:scale-110 transition-transform">add</span>
            Nueva Tarima`;
    const newId = platforms.length > 0 ? Math.max(...platform.map(p => p.id)) + 1 : 1;
    newButton.onclick = () => window.location.href = `/frontend/src/platforms/detailed_platform.html?create=true&id=${newId}&idCus=${customer.id}`;

    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
    `).join("");

    tbody.innerHTML = platform.map(p => `
        <tr data-id="${p.id}" class="customer-row bg-gray-50/50 hover:bg-gray-100 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">${p.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">${p.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${consignees.find(c => c.id == p.idConsignee).name || "—"}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span
                    class=" ${p.status ? "bg-green-100 text-green-800": "bg-red-100 text-red-800"} px-2 inline-flex text-xs leading-5 font-semibold rounded-full">${p.status ? "Activo" : "Inactivo"}</span>
            </td>
        </tr>
    `).join("");

    document.querySelectorAll(".customer-row").forEach(row => {
        row.addEventListener("click", () => {
            const id = row.dataset.id;
            window.location.href = `/frontend/src/platforms/detailed_platform.html?id=${id}`;
        });
    });
}