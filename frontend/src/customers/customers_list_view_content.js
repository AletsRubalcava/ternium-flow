import {customers} from "../shared/db.js"

// Table attributes
const attributes = [
    "ID",
    "Razón Social",
    "RFC",
    "CONTACTO",
    "ESTADO",
    "ACCIONES"
];

// Loads customers information to the table
export function loadClientes(){
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
    const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    newButton.onclick = () => window.location.href = `/frontend/src/customers/detailed_customer.html?create=true&id=${newId}`;

    //Writes the attributes (thead) into the table
    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
    `).join("");

    // Writes the custome data into the table
    tbody.innerHTML = customers.map(c => `
        <tr data-id="${c.id}"
        class="customer-row bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors">
        <td
            class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light dark:text-text-primary-dark">${c.id}</td>
        <td
            class="px-6 py-4 whitespace-nowrap text-sm text-text-primary-light dark:text-text-primary-dark font-medium">${c.name}</td>
        <td
            class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">${c.rfc}</td>
        <td
            class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">${c.contact}</td>
        <td class="px-6 py-4 whitespace-nowrap">
            <span
                class=" ${c.status == 1 ? "bg-green-100 text-green-800": "bg-red-100 text-red-800"} px-2 inline-flex text-xs leading-5 font-semibold rounded-full">${c.status == 1 ? "Activo" : "Inactivo"}</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
                class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary mx-2"><span
                    class="material-icons text-lg">edit</span></button>
            <button
                class="text-text-secondary-light dark:text-text-secondary-dark hover:text-red-600 dark:hover:text-red-400 mx-2"><span
                    class="material-icons text-lg">delete</span></button>
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