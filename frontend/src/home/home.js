import { renderHeader } from "../shared/components/header.js";
import { getAppContext, roles } from "../shared/app_context.js";
import { api, platformRequestStatus, platformRequestAction } from "../shared/api/api_index.js"
import { consigneeCard } from "./consignee.card.js";
import { pendingApprovalsCard } from "./comercial_card.js";
import { emptyWidget } from "../shared/components/empty_widget.js"
import { renderRejectModal, openRejectModal } from "../shared/components/reject_modal.js";
import { setActiveNav } from "../shared/page_directory.js";
import { navIds } from "../shared/constants/navigation.js";

const context = getAppContext();
renderHeader(context);
renderRejectModal();
setActiveNav(navIds.home);


const $ = (el) => document.getElementById(el);
const endityId = context.entityId;

const { data: customers } = await axios.get(api.customers.getAll());
const consignees = await loadConsignees();
const { data: plaftforms } = await axios.get(api.platforms.getAll());
let pendingPlatformRequests = await loadPendingPlatformRequests();

// --- HTML ELEMENTS ---
const asideTitle = $("asideTitle");
const asideSubtitle = $("asideSubtitle");
const asideWidgets = $("asideWidgets");
const rejectModal = $("rejectModal");

async function loadConsignees() {
    const { data } = await axios.get(api.consignees.getAll());

    if (context.role === roles.customer) {
        return data.filter(c => c.id_customer === endityId);
    }
    return data;
}

async function loadPendingPlatformRequests() {
    const { data } = await axios.get(api.platform_request.getAll());

    if (context.role === roles.admin) {
        return data.filter(pr => pr.status == platformRequestStatus.pending)
    }
    return data;
}

function renderAside() {
    if (context.role === roles.customer) {
        asideTitle.innerHTML = `
            <div class="flex items-center gap-2">
                Consignatarios
                <span class="text-primary material-symbols-outlined">corporate_fare</span>
            </div>
        `
        asideWidgets.innerHTML = consignees.map(c => consigneeCard(c));
    } else if (context.role === roles.admin) {
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
            const platform = plaftforms.find(p => p.id === a.id_platform);

            return {
                ...a,
                consigneeName: consignee?.name ?? "N/A",
                customerName: customer?.name ?? "N/A",
                platformName: platform?.name ?? "N/A"
            };
        });

        $("pendingApprovals").innerText = `${pendingPlatformRequests.length} Pendientes`;
        (pendingPlatformRequests.length !== 0) ? asideWidgets.innerHTML = approvals.map(a => pendingApprovalsCard(a)) : asideWidgets.innerHTML = emptyWidget("Sin solicitudes pendientes");
        
        asideWidgets.addEventListener("click", async (e) => {
            const card = e.target.closest(".approvalCard");
            if (!card) return;

            const btn = e.target.closest("button");
            const idRequest = card.dataset.idRequest;
            const idPlatform = card.dataset.idPlatform;

            if (btn) {
                const { action } = btn.dataset;
                if (action === platformRequestAction.approve) {
                    console.log(idRequest);
                    await axios.patch(api.platform_request.approve(idRequest));
                    pendingPlatformRequests = await loadPendingPlatformRequests();
                    renderAside();
                    return
                }
                if (action === platformRequestAction.reject) {
                    const comments = await openRejectModal();
                    if (comments === null) return; // canceló

                    await axios.patch(api.platform_request.reject(idRequest), { comments });
                    pendingPlatformRequests = await loadPendingPlatformRequests();
                    renderAside();
                    return;
                }
                return;
            }
            window.location.href = `/frontend/src/platforms/detailed_platform.html?id=${idPlatform}&type=commercial`;
        });
    }
}

renderAside();