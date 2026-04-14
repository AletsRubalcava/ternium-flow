const attributes = ["Tarima", "Consignatario", "Fecha Solicitud", "Acción"];
import { emptyWidget } from "../shared/components/empty_widget.js";

export async function loadComercial() {
    const tableContainer = document.getElementById("tableContainer");
    const title     = document.getElementById("pageTitle");
    const search    = document.getElementById("search");
    const newButton = document.getElementById("newButton");
    const thead     = document.getElementById("listViewThead");
    const tbody     = document.getElementById("listViewBody");

    title.textContent      = "COMERCIAL";
    search.placeholder     = "Buscar Solicitudes";

    const { data: dataPlatformRequest } = await axios.get("http://localhost:3000/api/platform_request");
    const { data: platforms }           = await axios.get("http://localhost:3000/api/platforms");
    const { data: consignees }          = await axios.get("http://localhost:3000/api/consignees");

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

    // ── Render ───────────────────────────────────────────────────────────────
    function renderRows(list) {
        if (list.length === 0) {
            tableContainer.innerHTML = emptyWidget("Sin solicitudes pendientes")
            return;
        }

        tbody.innerHTML = list.map(p => {
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

    // ── Bind eventos ─────────────────────────────────────────────────────────
    function bindEvents() {
        // Click en fila → ir al detalle
        document.querySelectorAll(".customer-row").forEach(row => {
            row.addEventListener("click", () => {
                const requestId  = row.dataset.id;
                const platformId = row.dataset.platformId;
                window.location.href =
                    `/frontend/src/platforms/detailed_platform.html?id=${platformId}&requestId=${requestId}&section=commercial`;
            });
        });

        // Aceptar
        document.querySelectorAll(".accept-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const row       = btn.closest("tr");
                const requestId = row.dataset.id;

                btn.disabled    = true;
                btn.textContent = "Aceptando...";

                try {
                    await axios.patch(`http://localhost:3000/api/platform_request/${requestId}/accept`);
                    row.remove();
                    platformRequests = platformRequests.filter(pr => pr.id !== requestId);
                    if (platformRequests.length === 0) renderRows([]);
                } catch (err) {
                    console.error("Error al aceptar:", err);
                    btn.disabled    = false;
                    btn.textContent = "Aceptar";
                }
            });
        });

        // Rechazar → abrir modal
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

    // ── Modal de rechazo ─────────────────────────────────────────────────────
    let pendingRejectId  = null;
    let pendingRejectRow = null;

    const $ = id => document.getElementById(id);

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
                `http://localhost:3000/api/platform_request/${pendingRejectId}/reject`,
                { comments }
            );
            pendingRejectRow?.remove();
            platformRequests = platformRequests.filter(pr => pr.id !== pendingRejectId);
            if (platformRequests.length === 0) renderRows([]);
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

    // ── Search ───────────────────────────────────────────────────────────────
    search.addEventListener("input", () => {
        const q = search.value.toLowerCase();
        const filtered = platformRequests.filter(p => {
            const platform  = platforms.find(pl => pl.id == p.id_platform);
            const consignee = consignees.find(c => c.id == p.id_consignee);
            return (
                platform?.name?.toLowerCase().includes(q) ||
                consignee?.name?.toLowerCase().includes(q)
            );
        });
        renderRows(filtered);
    });

    // ── Init ─────────────────────────────────────────────────────────────────
    renderRows(platformRequests);
}