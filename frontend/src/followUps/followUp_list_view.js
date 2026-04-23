import { api } from "../shared/api/api_index.js";
import { getAppContext, roles } from "../shared/app_context.js";
import { timeAgo } from "../shared/utils/time_ago.js";

const context = getAppContext();

const attributes = [
    "Clave Seguimiento",
    "Tarima",
    "Dirección Envío",
    "Estado",
    "Última Actualización",
];

export async function loadFolllowUps(context) {
    const $ = id => document.getElementById(id);

    const title = $("pageTitle");
    const search = $("search");
    const newButton = $("newButton");
    const thead = $("listViewThead");
    const tbody = $("listViewBody");

    // UI setup
    title.innerHTML = "SEGUIMIENTOS";
    search.placeholder = "Buscar Seguimiento...";

    if (context.role !== roles.customer) {
        newButton.innerHTML = `
            <span class="material-icons text-lg group-hover:scale-110 transition-transform">add</span>
            Nuevo Seguimiento`;
        newButton.classList.remove("hidden");

        newButton.onclick = () => {
            window.location.href = `/frontend/src/followUps/detailed_followUp.html?create=true`;
        };
    }

    try {
        const { data: followUps } = await axios.get(api.followUps.getAll());
        const { data: requests } = await axios.get(api.platform_request.getAll());
        const { data: consignees } = await axios.get(api.consignees.getAll());
        const { data: platforms } = await axios.get(api.platforms.getAll());

        const followUpsEnriched = followUps.map(f => {
            const request = requests.find(r => r.id === f.id_request);
            const consignee = consignees.find(c => c.id === request?.id_consignee);
            const platform = platforms.find(p => p.id === request?.id_platform);

            return {
                ...f,
                consigneeAddress: consignee?.address ?? "N/A",
                platformName: platform?.name ?? "N/A",
                id_cliente: request?.id_customer ?? consignee?.id_customer ?? null  // ← asegúrate que exista este campo
            };
        });

        const filtered = context?.role === roles.customer
        ? followUpsEnriched.filter(f => f.id_cliente === context.customerId)
        : followUpsEnriched;


        const requestMap = new Map(requests.map(r => [r.id, r]));

        // Render headers
        thead.innerHTML = attributes.map(a => `
            <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display">
                ${a}
            </th>
        `).join("");

        const statusMap = {
            pending:       { label: "Pendiente",   cls: "bg-yellow-100 text-yellow-800" },
            inPreparation: { label: "Preparación", cls: "bg-blue-100 text-blue-800"     },
            inTransit:     { label: "En tránsito", cls: "bg-purple-100 text-purple-800" },
            delivered:     { label: "Entregado",   cls: "bg-green-100 text-green-800"   },
            dismantled:    { label: "Desarmada",   cls: "bg-gray-100 text-gray-700"     },
        };

        function statusBadge(value) {
            const s = statusMap[value] ?? { label: value, cls: "bg-gray-100 text-gray-700" };
            return `<span class="${s.cls} px-2 inline-flex text-xs font-semibold rounded-full">${s.label}</span>`;
        }

        tbody.innerHTML = filtered.map(f => `
            <tr data-id="${f.id}"
                class="customer-row bg-gray-50/50 hover:bg-gray-100 transition-colors">

                <td class="px-6 py-4 text-sm font-medium">
                    ${f.tracking_key}
                </td>

                <td class="px-6 py-4 text-sm">
                    ${f.platformName}
                </td>

                <td class="px-6 py-4 text-sm">
                    ${f.consigneeAddress}
                </td>

                <td class="px-6 py-4">
                    ${statusBadge(f.status)}
                </td>

                <td class="px-6 py-4 text-sm">
                    ${timeAgo(f.updated_at)}
                </td>

            </tr>
        `).join("");

        // Click events
        document.querySelectorAll(".customer-row").forEach(row => {
            row.addEventListener("click", () => {
                const id = row.dataset.id;
                window.location.href = `/frontend/src/followUps/detailed_followUp.html?id=${id}`;
            });
        });

    } catch (error) {
        console.error("Error cargando followUps:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-red-500">
                    Error cargando datos
                </td>
            </tr>
        `;
    }
}