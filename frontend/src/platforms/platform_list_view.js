import { renderHeader } from "../shared/components/header.js";
import { getAppContext, roles } from "../shared/app_context.js";
import { api } from "../shared/api/api_routes.js";
import { setActiveNav } from "../shared/utils/nav.js";
import { navIds } from "../../../shared/navigation.js";
import { emptyWidget } from "../shared/components/empty_widget.js";
import { platformRequestStatus } from "../shared/api/api_platform_request_constants.js";
import { initSearch } from "../shared/utils/search.js";

const attributes         = ["Nombre", "Cliente", "Consignatario", "Estado"];
const attributesRejected = ["Nombre", "Cliente", "Consignatario", "Motivo de Rechazo"];

const context = getAppContext();
renderHeader(context);

export async function loadPlatforms() {
    (context.role === roles.customer) ? setActiveNav(navIds.platforms) : setActiveNav(navIds.customers);

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const resCustomers = await axios.get(api.customers.getByID(id));
    const customer = resCustomers.data;

    const resConsignees = await axios.get(api.consignees.getAll());
    const consignees = resConsignees.data.filter(c => c.id_customer == customer.id);

    const resPlatforms = await axios.get(api.platforms.getAll());
    const resPlatformRequests = await axios.get(api.platform_request.getAll());

    const activeRequests = resPlatformRequests.data.filter(pr =>
        consignees.some(c => c.id === pr.id_consignee) &&
        (pr.status === platformRequestStatus.approved || pr.status === platformRequestStatus.pending)
    );

    const rejectedRequests = resPlatformRequests.data.filter(pr =>
        consignees.some(c => c.id === pr.id_consignee) &&
        pr.status === platformRequestStatus.rejected
    );

    const title     = document.getElementById("pageTitle");
    const search    = document.getElementById("search");
    const newButton = document.getElementById("newButton");
    let thead = document.getElementById("listViewThead");
    let tbody = document.getElementById("listViewBody");

    title.textContent  = "TARIMAS";
    search.placeholder = "Buscar Tarimas";

    newButton.innerHTML = `
        <span class="material-icons text-lg group-hover:scale-110 transition-transform">add</span>
        Nueva Tarima`;
    newButton.classList.remove("hidden");
    newButton.onclick = () => window.location.href =
        `/frontend/src/platforms/detailed_platform.html?create=true&idCus=${customer.id}&section=${navIds.customers}`;

    let showRejected = false;

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors";
    toggleBtn.innerHTML = `<span class="material-symbols-outlined text-sm">cancel</span> Ver Rechazadas`;
    newButton.insertAdjacentElement("beforebegin", toggleBtn);

    function restoreTable() {
        const tableContainer = document.getElementById("tableContainer");
        if (!tableContainer.querySelector("table")) {
            tableContainer.innerHTML = `
                <div class="w-full bg-white rounded-lg border">
                    <table class="table-auto w-full">
                        <thead class="bg-gray-100 top-0 z-10">
                            <tr id="listViewThead"></tr>
                        </thead>
                        <tbody id="listViewBody" class="bg-white divide-y divide-border-light"></tbody>
                    </table>
                </div>`;
            thead = document.getElementById("listViewThead");
            tbody = document.getElementById("listViewBody");
        }
    }

    function renderTable() {
        const requests = showRejected ? rejectedRequests : activeRequests;

        if (requests.length === 0) {
            document.getElementById("tableContainer").innerHTML = emptyWidget(
                showRejected ? "Sin tarimas rechazadas" : "Sin tarimas"
            );
            return;
        }

        restoreTable();

        thead.innerHTML = (showRejected ? attributesRejected : attributes).map(a => `
            <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
        `).join("");

        tbody.innerHTML = requests.map(pr => {
            const platform  = resPlatforms.data.find(p => p.id === pr.id_platform);
            const consignee = consignees.find(c => c.id === pr.id_consignee);
            if (!platform) return "";

            const lastCol = showRejected
                ? `<td class="px-6 py-4 text-sm text-red-600 dark:text-red-400 max-w-xs break-words whitespace-normal">
                    ${pr.comments ?? "—"}
                   </td>`
                : `<td class="px-6 py-4 whitespace-nowrap">
                    <span class="${
                        pr.status === platformRequestStatus.pending
                            ? "bg-yellow-100 text-yellow-800"
                            : platform.status
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                    } px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        ${pr.status === platformRequestStatus.pending ? "Pendiente" : platform.status ? "Activo" : "Inactivo"}
                    </span>
                   </td>`;

            return `
                <tr data-platform-id="${platform.id}" data-request-id="${pr.id}"
                    class="customer-row bg-gray-50/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors ${showRejected ? "opacity-75" : ""}">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light dark:text-text-primary-dark">${platform.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light dark:text-text-primary-dark">${customer.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">${consignee?.name ?? "—"}</td>
                    ${lastCol}
                </tr>`;
        }).join("");

        document.querySelectorAll(".customer-row").forEach(row => {
            row.addEventListener("click", () => {
                const platformId = row.dataset.platformId;
                const requestId  = row.dataset.requestId;
                window.location.href = `/frontend/src/platforms/detailed_platform.html?id=${platformId}&requestId=${requestId}&section=${navIds.customers}`;
            });
        });
    }

    initSearch("search", ".customer-row", {
        noResultsMsg: "Sin tarimas encontradas",
    });

    toggleBtn.addEventListener("click", () => {
        showRejected = !showRejected;
        toggleBtn.innerHTML = showRejected
            ? `<span class="material-symbols-outlined text-sm">check_circle</span> Ver Activas`
            : `<span class="material-symbols-outlined text-sm">cancel</span> Ver Rechazadas`;
        toggleBtn.classList.toggle("bg-red-50",      showRejected);
        toggleBtn.classList.toggle("text-red-700",   showRejected);
        toggleBtn.classList.toggle("border-red-200", showRejected);
        renderTable();
    });

    renderTable();
}