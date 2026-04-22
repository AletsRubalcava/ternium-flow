import { renderHeader } from "../shared/components/header.js";
import { getAppContext, roles } from "../shared/app_context.js";
import { api } from "../shared/api/api_routes.js";
import { setActiveNav } from "../shared/utils/nav.js";
import { navIds } from "../../../shared/navigation.js";
import { emptyWidget } from "../shared/components/empty_widget.js"

const attributes = ["Consignatario", "Cliente", "Dirección", "Estado"];

const context = getAppContext();
renderHeader(context);

export async function loadConsignees() {
    (context.role === roles.customer) ? setActiveNav(navIds.consignees) : setActiveNav(navIds.customers);

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

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

    newButton.classList.remove("hidden");

    const resCustomers = await axios.get(api.customers.getByID(id));
    const customer = resCustomers.data;

    const resConsignee = await axios.get(api.consignees.getAll());
    const consignees = resConsignee.data.filter(c => c.id_customer == id);

    newButton.onclick = () => window.location.href = `/frontend/src/consignees/detailed_consignee.html?create=true&idCus=${customer.id}`;

    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
    `).join("");

    if(consignees.length === 0) {
        tableContainer.innerHTML = emptyWidget("Sin consignatarios")
        return;
    }
    
    tbody.innerHTML = consignees.map(c => `
        <tr data-id="${c.id}" class="customer-row bg-gray-50/50 hover:bg-gray-100 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">${c.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${customer.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${c.address}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span
                    class=" ${c.status ? "bg-green-100 text-green-800": "bg-red-100 text-red-800"} px-2 inline-flex text-xs leading-5 font-semibold rounded-full">${c.status ? "Activo" : "Inactivo"}</span>
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