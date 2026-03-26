import { consignees, customers } from "../shared/db.js";

const attributes = ["Clave", "Consignatario", "Cliente", "Dirección", "Acciones"];

export function loadConsignees() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const customer = customers.find(c => c.id == id);

    const consignee = consignees.filter(c => c.idCustomer == customer.id);

    const title = document.getElementById("pageTitle");
    const search = document.getElementById("search");
    const newButton = document.getElementById("newButton");
    const thead = document.getElementById("listViewThead");
    const tbody = document.getElementById("listViewBody");

    title.textContent = "CONSIGNATARIOS";
    search.placeholder = "Buscar Consignatarios";
    newButton.innerHTML = `
        <span class="material-icons text-lg group-hover:scale-110 transition-transform">add</span>
        Nuevo Consignatario`;

    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
    `).join("");

    tbody.innerHTML = consignee.map(c => `
        <tr data-id="${c.id}" class="customer-row bg-gray-50/50 hover:bg-gray-100 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">${c.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">${c.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${customers.find(cu => cu.id == c.idCustomer).name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${c.address}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-text-secondary-light hover:text-primary mx-2"><span class="material-icons text-lg">edit</span></button>
                <button class="text-text-secondary-light hover:text-red-600 mx-2"><span class="material-icons text-lg">delete</span></button>
            </td>
        </tr>
    `).join("");

    document.querySelectorAll(".customer-row").forEach(row => {
        row.addEventListener("click", () => {
            const id = row.dataset.id;
            window.location.href = `/frontend/src/consignees/detailed_consignee.html?id=${id}`;
        });
    });
}