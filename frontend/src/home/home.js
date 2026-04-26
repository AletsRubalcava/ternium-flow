import { renderHeader } from "../shared/components/header.js";
import { getAppContext, roles } from "../shared/app_context.js";
import { api, platformRequestStatus, platformRequestAction, plaftformType } from "../shared/api/api_index.js"
import { consigneeCard } from "./consignee.card.js";
import { pendingApprovalsCard } from "./comercial_card.js";
import { emptyWidget } from "../shared/components/empty_widget.js"
import { renderRejectModal, openRejectModal } from "../shared/components/reject_modal.js";
import { setActiveNav } from "../shared/utils/nav.js";
import { navIds } from "../../../shared/navigation.js";
import { platformTableRow } from "./platform_row.js";
import { renderCustomersWidget } from "./customer_card.js";
import { renderProductsWidget } from "./products_card.js";

const context = getAppContext();
renderHeader(context);

renderRejectModal();
setActiveNav(navIds.home);

const $ = (el) => document.getElementById(el);
const customerId = context.customerId;

const { data: customers } = await axios.get(api.customers.getAll());
const consignees = await loadConsignees();
const { data: platforms } = await axios.get(api.platforms.getAll());
let pendingPlatformRequests = await loadPendingPlatformRequests();
const { data: platformsRequests } = await axios.get(api.platform_request.getAll());
const { data: followUps } = await axios.get(api.followUps.getAll());

// --- HTML ELEMENTS ---
const asideTitle = $("asideTitle");
const asideSubtitle = $("asideSubtitle");
const asideWidgets = $("asideWidgets");
const platformsTitle = $("platformsTitle");
const platformsSubtitle = $("platformsSubtitle");
const newPlatformButton = $("newPlatformButton");
const platformsTableRow = $("platformsTableRow");
const tableDataContent = $("tableDataContent");

async function loadConsignees() {
    const { data } = await axios.get(api.consignees.getAll());

    if (context.role === roles.customer) {
        return data.filter(c => c.id_customer === customerId);
    }
    return data;
}

async function loadPendingPlatformRequests() {
    const { data } = await axios.get(api.platform_request.getAll());

    if (context.role !== roles.customer) {
        return data.filter(pr => pr.status == platformRequestStatus.pending)
    }
    return data;
}

function renderFollowUpStats() {
    const now  = new Date();
    const ago7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Si es customer, filtra solo sus followUps
    const clientConsigneeIds = new Set(consignees.map(c => c.id));

    const myFollowUps = context.role === roles.customer
        ? followUps.filter(f => {
            const request = platformsRequests.find(r => r.id === f.id_request);
            return request && clientConsigneeIds.has(request.id_consignee);
        })
        : followUps;

    const recent = myFollowUps.filter(f => {
        const d = new Date(f.updated_at ?? f.created_at);
        return d >= ago7;
    });

    const total      = recent.length;
    const delivered  = recent.filter(f => f.status === "delivered").length;
    const dismantled = recent.filter(f => f.status === "dismantled").length;
    const inTransit  = recent.filter(f => f.status === "inTransit").length;

    const base       = delivered + dismantled;
    const efficiency = base > 0 ? ((delivered / base) * 100).toFixed(1) : "—";

    document.querySelector(".bg-light-gray-slate.p-4 p.text-2xl").textContent    = total;
    document.querySelector(".bg-emerald-50.p-4 p.text-2xl").textContent          = delivered;
    document.querySelector(".bg-rose-50.p-4 p.text-2xl").textContent             = dismantled;
    document.querySelector(".bg-primary\\/5.p-4 p.text-2xl").textContent         = inTransit;

    document.querySelector(".text-4xl.font-extrabold").textContent = efficiency !== "—"
        ? `${efficiency}%`
        : "—";
}

function renderAside() {
    if (context.role === roles.customer) {
        // ...bloque customer sin cambios
        asideTitle.innerHTML = `
            <div class="consigneeCard flex items-center gap-2">
                Consignatarios
                <span class="text-primary material-symbols-outlined">corporate_fare</span>
            </div>
        `;
        asideWidgets.innerHTML = consignees.map(c => consigneeCard(c));

    } else if (context.role === roles.operador_logistico) { // 👈 nuevo bloque
        renderProductsWidget({
            titleEl: asideTitle,
            subtitleEl: asideSubtitle,
            containerEl: asideWidgets,
        });

    } else {
        // ...bloque admin/gestion_clientes sin cambios
        asideTitle.innerHTML = "Comercial";
        asideSubtitle.innerHTML = `
            <div class="px-6 py-2 flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">pending_actions</span>
                    <h3 class="text-slate-900 text-xl font-extrabold tracking-tight">Aprobaciones Pendientes</h3>
                </div>
                <span id="pendingApprovals" class="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase"></span>
            </div>
        `;

        const approvals = pendingPlatformRequests.map(a => {
            const consignee = consignees.find(c => c.id === a.id_consignee);
            const customer = customers.find(c => c.id === consignee?.id_customer);
            const platform = platforms.find(p => p.id === a.id_platform);
            return {
                ...a,
                consigneeName: consignee?.name ?? "N/A",
                customerName: customer?.name ?? "N/A",
                platformName: platform?.name ?? "N/A"
            };
        });

        $("pendingApprovals").innerText = `${pendingPlatformRequests.length} Pendientes`;
        asideWidgets.innerHTML = pendingPlatformRequests.length !== 0
            ? approvals.map(a => pendingApprovalsCard(a))
            : emptyWidget("Sin solicitudes pendientes");
    }
}

asideWidgets.addEventListener("click", async (e) => {

    // --- CONSIGNEES ---
    const consigneeCard = e.target.closest(".consigneeCard");
    if (consigneeCard) {
        const id = consigneeCard.dataset.id;

        const btn = e.target.closest("button");
        if (!btn) return;

        window.location.href = `/frontend/src/consignees/detailed_consignee.html?id=${id}`;
        return;
    }

    // --- APPROVALS ---
    const approvalCard = e.target.closest(".approvalCard");
    if (approvalCard) {
        const btn = e.target.closest("button");
        const idRequest = approvalCard.dataset.idRequest;
        const idPlatform = approvalCard.dataset.idPlatform;
        const requestId = approvalCard.dataset.idRequest;

        if (btn) {
            const { action } = btn.dataset;

            if (action === platformRequestAction.approve) {
                await axios.patch(api.platform_request.approve(idRequest));
                pendingPlatformRequests = await loadPendingPlatformRequests();
                renderAside();
                return;
            }

            if (action === platformRequestAction.reject) {
                const comments = await openRejectModal();
                if (comments === null) return;

                await axios.patch(api.platform_request.reject(idRequest), { comments });
                pendingPlatformRequests = await loadPendingPlatformRequests();
                renderAside();
                return;
            }

            return;
        }

        window.location.href = `/frontend/src/platforms/detailed_platform.html?id=${idPlatform}&requestId=${requestId}&section=commercial`;
    }
});

function renderPlatforms() {
    if (context.role === roles.customer) {
        // ...bloque customer sin cambios
        platformsTitle.innerText = "Tarimas Autorizadas";
        newPlatformButton.innerHTML = `<span class="material-symbols-outlined text-sm">add_circle</span>Nueva Tarima`;

        const rows = ["Tarima", "Descripción", "Consignatario", "Peso de Carga"];
        platformsTableRow.innerHTML = rows.map(tr => `
            <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">${tr}</th>
        `).join("");

        const clientConsigneeIds = new Set(consignees.map(c => c.id));
        const approvedRequests = platformsRequests.filter(r =>
            r.status === platformRequestStatus.approved &&
            clientConsigneeIds.has(r.id_consignee)
        );
        const approvedPlatforms = approvedRequests.map(r => {
            const platform  = platforms.find(p => p.id === r.id_platform);
            const consignee = consignees.find(c => c.id === r.id_consignee);
            return {
                ...platform,
                requestId:     r.id,
                consigneeName: consignee?.name ?? "N/A",
            };
        }).filter(p => p.id);

        tableDataContent.innerHTML = approvedPlatforms.map(p => platformTableRow(p)).join("");

    } else if (context.role === roles.gestion_clientes) { // 👈 nuevo bloque
        platformsTitle.innerText = "Clientes";
        platformsSubtitle.classList.add("hidden");

        renderCustomersWidget({
            tableHeaderEl: platformsTableRow,
            tableBodyEl: tableDataContent,
            newButtonEl: newPlatformButton,
        });

    } else {
        // ...bloque admin/operador sin cambios
        platformsTitle.innerText = "Paquetes";
        platformsSubtitle.classList.remove("hidden");
        newPlatformButton.innerHTML = `<span class="material-symbols-outlined text-sm">add_circle</span>Nuevo Paquete`;

        const rows = ["Tarima", "Descripción", "Usos Actuales", "Peso de Carga"];
        platformsTableRow.innerHTML = rows.map(tr => `
            <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">${tr}</th>
        `).join("");

        const presets = platforms
            .filter(p => p.type === plaftformType.preset)
            .map(p => {
                const uses = platformsRequests.filter(r =>
                    r.id_platform === p.id &&
                    r.status === platformRequestStatus.approved
                ).length;
                return { ...p, uses };
            });

        tableDataContent.innerHTML = presets.map(p => platformTableRow(p)).join("");
    }
}

newPlatformButton.addEventListener("click", () => {
    if (context.role === roles.customer) {
        window.location.href = `/frontend/src/platforms/detailed_platform.html?create=true&idCus=${customerId}&section=${navIds.customers}`;
    } else {
        window.location.href = `/frontend/src/platforms/detailed_platform.html?create=true&idCus=${customerId}&section=${navIds.presets}`;
    }
});

tableDataContent.addEventListener("click", (e) => {
    const row = e.target.closest(".platformData");
    if (!row) return;

    const id = row.dataset.id;

    window.location.href = `/frontend/src/platforms/detailed_platform.html?id=${id}&section=${context.role !== roles.customer ? `${navIds.presets}` : `${navIds.customers}`}`;
});

renderAside();
renderPlatforms();
renderFollowUpStats();