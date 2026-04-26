import { api } from "../shared/api/api_routes.js";
import { emptyWidget } from "../shared/components/empty_widget.js";

const attributes = [
    "ID",
    "Razón Social",
    "RFC",
    "CONTACTO",
    "ESTADO",
];

// Loads customers information to the table
export async function loadClientes(){
    // Get components
    const $ = id => document.getElementById(id);
    const title = $("pageTitle");
    const search = $("search");
    const newButton = $("newButton");
    const thead = $("listViewThead");
    const tbody = $("listViewBody");

    // Main title
    title.innerHTML = "CLIENTES";

    // Search bar placeholder
    search.placeholder = "Buscar Clientes...";

    // New Button
    newButton.innerHTML = `
        <span class="material-icons text-lg group-hover:scale-110 transition-transform">add</span>
            Nuevo Cliente`;

    newButton.classList.remove("hidden");

    const response = await axios.get(api.customers.getAll());
    const customers = response.data;
    const { data: contacts } = await axios.get(api.contacts.getAll());

    newButton.onclick = () => window.location.href = `/frontend/src/customers/detailed_customer.html?create=true`;

    //Writes the attributes (thead) into the table
    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
    `).join("");

    if (customers.length === 0) {
        tableContainer.innerHTML = emptyWidget("Sin clientes");
        return;
    }

    // Writes the custome data into the table
    tbody.innerHTML = customers.map(c => 
        `
        <tr data-id="${c.id}"
        class="customer-row bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors">
        <td
            class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light dark:text-text-primary-dark">${c.id_customer}</td>
        <td
            class="px-6 py-4 whitespace-nowrap text-sm text-text-primary-light dark:text-text-primary-dark font-medium">${c.name}</td>
        <td
            class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">${c.rfc ?? "N/A"}</td>
        <td
            class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">${contacts.find(co => co.id_customer === c.id) ? contacts.find(co => co.id_customer === c.id)?.name : "N/A"}</td>
        <td class="px-6 py-4 whitespace-nowrap">
            <span
                class=" ${c.status ? "bg-green-100 text-green-800": "bg-red-100 text-red-800"} px-2 inline-flex text-xs leading-5 font-semibold rounded-full">${c.status ? "Activo" : "Inactivo"}</span>
        </td>
    </tr>
    `).join("");

    // For each row, adds a button which redirects to its detailed view
    document.querySelectorAll(".customer-row").forEach(row => {
        row.addEventListener("click", () => {
            const id = row.dataset.id;
            window.location.href = `/frontend/src/customers/detailed_customer.html?id=${id}`;
        });
    });
}