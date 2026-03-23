import { consignees, customers, platforms } from "../shared/db.js";

const attributes = ["Clave", "Nombre", "Consignatario", "Descripción", "Peso" , "Acciones"];

export function loadPlatforms() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const customer = customers.find(c => c.id === id);
    const consignee = consignees.filter(c => c.idCustomer == customer.id);
    const platformCustomer = platforms.filter(p => consignee.some(c => c.id == p.idConsignee));

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

    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
    `).join("");

tbody.innerHTML = platformCustomer.map(p => `
    <tr data-id="${p.id}" class="customer-row bg-gray-50/50 hover:bg-gray-100 transition-colors">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">${p.id}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">${p.name}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${consignee.find(c => c.id == p.idConsignee)?.name ?? "—"}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${p.description}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${p.weight} kg</td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button class="text-text-secondary-light hover:text-primary mx-2"><span class="material-icons text-lg">edit</span></button>
            <button class="text-text-secondary-light hover:text-red-600 mx-2"><span class="material-icons text-lg">delete</span></button>
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