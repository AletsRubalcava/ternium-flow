import { api } from "../shared/api/api_routes.js";
import { emptyWidget } from "../shared/components/empty_widget.js";

const attributes = ["Nombre", "Descripción", "Usos", "Estado"];

export async function loadPresets() {
    const resPlatforms        = await axios.get(api.platforms.getAll());
    const resConsignees       = await axios.get(api.consignees.getAll());
    const resPlatformRequests = await axios.get(api.platform_request.getAll());

    const allConsignees = resConsignees.data;
    const allRequests   = resPlatformRequests.data;

    const platforms = resPlatforms.data.filter(p => p.type === "Preset");

    // 🧠 Mapa de usos (eficiente)
    const usesMap = {};
    allRequests.forEach(r => {
        if (r.status === "Aceptada") {
            usesMap[r.id_platform] = (usesMap[r.id_platform] || 0) + 1;
        }
    });

    const title     = document.getElementById("pageTitle");
    const search    = document.getElementById("search");
    const newButton = document.getElementById("newButton");
    const thead     = document.getElementById("listViewThead");
    const tbody     = document.getElementById("listViewBody");

    title.textContent  = "PAQUETES";
    search.placeholder = "Buscar Paquetes";

    newButton.innerHTML = `
        <span class="material-icons text-lg group-hover:scale-110 transition-transform">add</span>
        Nuevo Paquete`;
    newButton.classList.remove("hidden");
    newButton.onclick = () => window.location.href = `/frontend/src/platforms/detailed_platform.html?create=true&section=presets`;

    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
    `).join("");
    
    if (platforms.length === 0) {
        tableContainer.innerHTML = emptyWidget("Sin preestablecidos");
        return;
    }

    tbody.innerHTML = platforms.map(p => {
        const uses = usesMap[p.id] || 0;

        return `
        <tr data-id="${p.id}" class="customer-row bg-gray-50/50 hover:bg-gray-100 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">
                ${p.name}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">
                ${p.description ?? "—"}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">
                ${uses} usos
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="${p.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    ${p.status ? "Activo" : "Inactivo"}
                </span>
            </td>
        </tr>`;
    }).join("");

    document.querySelectorAll(".customer-row").forEach(row => {
        row.addEventListener("click", () => {
            window.location.href = `/frontend/src/platforms/detailed_platform.html?id=${row.dataset.id}&section=presets`;
        });
    });
}