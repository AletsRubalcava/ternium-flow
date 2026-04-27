import { emptyWidget } from "../shared/components/empty_widget.js";
import { api } from "../shared/api/api_routes.js";
import { initSearch } from "../shared/utils/search.js";

const attributes = ["Tarima", "Consignatario", "Fecha Solicitud", "Acción"];

export async function loadComercial() {
    const tableContainer = document.getElementById("tableContainer");
    const title     = document.getElementById("pageTitle");
    const search    = document.getElementById("search");
    const newButton = document.getElementById("newButton");
    const thead     = document.getElementById("listViewThead");
    const tbody     = document.getElementById("listViewBody");

    title.textContent      = "COMERCIAL";
    search.placeholder     = "Buscar Solicitudes";

    const { data: dataPlatformRequest } = await axios.get(api.platform_request.getAll());
    const { data: platforms }           = await axios.get(api.platforms.getAll());
    const { data: consignees }          = await axios.get(api.consignees.getAll());

    let platformRequests = dataPlatformRequest.filter(pr => pr.status === "Pendiente");

    newButton.classList.remove("hidden");
    newButton.innerHTML = `
        <span class="material-icons text-lg group-hover:scale-110 transition-transform">add</span>
        Nueva Asignación`;
    newButton.onclick = () =>
        window.location.href = `/frontend/src/platforms/detailed_platform.html?create=true&section=commercial`;

    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
    `).join("");

    // ── Helpers ───────────────────────────────────────────────────────────────
    const $ = id => document.getElementById(id);

    // ── Render ────────────────────────────────────────────────────────────────
    function renderRows(list) {
        if (list.length === 0) {
            tableContainer.innerHTML = emptyWidget(
                platformRequests.length === 0
                    ? "Sin solicitudes pendientes"
                    : `Sin resultados para "${search.value}"`
            );
            return;
        }

        // Restaura la tabla si emptyWidget la reemplazó
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
            // Re-render thead ya que el DOM fue reemplazado
            document.getElementById("listViewThead").innerHTML = attributes.map(a => `
                <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
            `).join("");
        }

        document.getElementById("listViewBody").innerHTML = list.map(p => {
            const platform  = platforms.find(pl => pl.id == p.id_platform);
            const consignee = consignees.find(c => c.id == p.id_consignee);
            const date      = new Date(p.created_at).toLocaleDateString("es-MX", {
                day: "2-digit", month: "short", year: "numeric"
            });

            return `
            <tr data-id="${p.id}" data-platform-id="${p.id_platform}"
                class="customer-row bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">
                    ${platform?.name ?? "—"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">
                    ${consignee?.name ?? "—"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">
                    ${date}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="accept-btn
                        bg-green-600 text-white
                        px-4 py-1.5 rounded-lg mr-2 font-medium
                        transition-all duration-200
                        hover:bg-green-700 hover:shadow-md
                        active:bg-green-800">
                        Aceptar
                    </button>
                    <button class="reject-btn
                        bg-transparent border-2 border-red-500 text-red-500
                        px-4 py-1.5 rounded-lg font-medium
                        transition-all duration-200
                        hover:bg-red-50 hover:border-red-600 hover:text-red-600
                        active:bg-red-100">
                        Rechazar
                    </button>
                </td>
            </tr>`;
        }).join("");

        bindEvents();
    }

    // ── Bind eventos ──────────────────────────────────────────────────────────
    function bindEvents() {
        document.querySelectorAll(".customer-row").forEach(row => {
            row.addEventListener("click", () => {
                const requestId  = row.dataset.id;
                const platformId = row.dataset.platformId;
                window.location.href =
                    `/frontend/src/platforms/detailed_platform.html?id=${platformId}&requestId=${requestId}&section=commercial`;
            });
        });

        document.querySelectorAll(".accept-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const row       = btn.closest("tr");
                const requestId = row.dataset.id;

                btn.disabled    = true;
                btn.textContent = "Aceptando...";

                try {
                    await axios.patch(api.platform_request.approve(requestId));
                    platformRequests = platformRequests.filter(pr => pr.id != requestId);
                    renderRows(platformRequests);
                } catch (err) {
                    console.error("Error al aceptar:", err);
                    btn.disabled    = false;
                    btn.textContent = "Aceptar";
                }
            });
        });

        document.querySelectorAll(".reject-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                pendingRejectId  = btn.closest("tr").dataset.id;
                pendingRejectRow = btn.closest("tr");
                $("rejectComments").value = "";
                $("rejectError").classList.add("hidden");
                $("rejectModal").classList.remove("hidden");
            });
        });
    }

    // ── Modal de rechazo ──────────────────────────────────────────────────────
    let pendingRejectId  = null;
    let pendingRejectRow = null;

    $("cancelReject").addEventListener("click", () => {
        $("rejectModal").classList.add("hidden");
        pendingRejectId  = null;
        pendingRejectRow = null;
    });

    $("confirmReject").addEventListener("click", async () => {
        const comments = $("rejectComments").value.trim();
        if (!comments) {
            $("rejectError").classList.remove("hidden");
            return;
        }

        $("rejectError").classList.add("hidden");
        $("confirmReject").disabled    = true;
        $("confirmReject").textContent = "Rechazando...";

        try {
            await axios.patch(
                api.platform_request.reject(pendingRejectId),
                { comments }
            );
            platformRequests = platformRequests.filter(pr => pr.id != pendingRejectId);
            renderRows(platformRequests);
        } catch (err) {
            console.error("Error al rechazar:", err);
        } finally {
            $("rejectModal").classList.add("hidden");
            $("confirmReject").disabled    = false;
            $("confirmReject").textContent = "Confirmar rechazo";
            pendingRejectId  = null;
            pendingRejectRow = null;
        }
    });

    initSearch("search", ".customer-row", {
        noResultsMsg: "Sin solicitudes encontradas",
    });

    // ── Init ──────────────────────────────────────────────────────────────────
    renderRows(platformRequests);
}