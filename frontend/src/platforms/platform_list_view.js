import { renderHeader } from "../shared/components/header.js";
import { getAppContext, roles } from "../shared/app_context.js";
import { api } from "../shared/api/api_routes.js";
import { setActiveNav } from "../shared/page_directory.js";
import { navIds } from "../shared/constants/navigation.js";

const attributes = ["Nombre", "Cliente", "Consignatario", "Estado"];

const context = getAppContext();
renderHeader(context);

export async function loadPlatforms() {
    (context.role === roles.customer) ? setActiveNav(navIds.platforms) : setActiveNav(navIds.customers);

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const resCustomers = await axios.get(`http://localhost:3000/api/customers/${id}`);
    const customer = resCustomers.data;

    const resConsignees = await axios.get("http://localhost:3000/api/consignees");
    const consignees = resConsignees.data.filter(c => c.id_customer == customer.id);

    const resPlatforms = await axios.get("http://localhost:3000/api/platforms");
    const resPlatformRequests = await axios.get("http://localhost:3000/api/platform_request");

    const platformRequests = resPlatformRequests.data.filter(pr =>
        consignees.some(c => c.id === pr.id_consignee) && pr.status === "Aceptada"
    );

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

    newButton.classList.remove("hidden");

    newButton.onclick = () => window.location.href = `/frontend/src/platforms/detailed_platform.html?create=true&idCus=${customer.id}`;

    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
    `).join("");

    tbody.innerHTML = platformRequests.map(pr => {
        const platform  = resPlatforms.data.find(p => p.id === pr.id_platform);
        const consignee = consignees.find(c => c.id === pr.id_consignee);
        if (!platform) return "";

        return `
            <tr data-platform-id="${platform.id}" data-request-id="${pr.id}" class="customer-row bg-gray-50/50 hover:bg-gray-100 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">${platform.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">${customer.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">
                    ${consignee?.name ?? "—"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="${platform.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        ${platform.status ? "Activo" : "Inactivo"}
                    </span>
                </td>
            </tr>`;
    }).join("");

    document.querySelectorAll(".customer-row").forEach(row => {
        row.addEventListener("click", () => {
            const platformId = row.dataset.platformId;
            const requestId  = row.dataset.requestId;
            window.location.href = `/frontend/src/platforms/detailed_platform.html?id=${platformId}&requestId=${requestId}&section=customers`;
        });
    });
}