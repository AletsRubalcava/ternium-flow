import { timeAgo } from "../shared/utils/time_ago.js"
import { platformRequestAction } from "../shared/api/api_platform_request_constants.js"

export function pendingApprovalsCard(approval) {

    return `
        <div data-id-request="${approval.id}" data-id-platform="${approval.id_platform}" class="approvalCard p-4 rounded-xl border border-slate-100 bg-slate-100 hover:border-primary/30 transition-all group">
            <div class="flex justify-between items-start mb-1">
                <div>
                    <p class="text-[10px] font-mono font-bold text-primary mb-1 uppercase tracking-wider">#${approval.id}</p>
                    <h4 class="font-bold text-slate-900">${approval.consigneeName}</h4>
                </div>
                <span class="text-[10px] font-bold text-slate-400">${timeAgo(approval.created_at)}</span>
            </div>
            <div class="flex items-center gap-3 mb-4 text-xs text-slate-500">
                <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">id_card</span>${approval.customerName}
                </div>
                <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">package_2</span>${approval.platformName}
                </div>    
            </div>
            <div class="grid grid-cols-2 gap-2">
                <button data-action="${platformRequestAction.approve}" data-id="${approval.id}" class="py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <span class="material-symbols-outlined text-sm">check</span> Aceptar
                </button>
                <button data-action="${platformRequestAction.reject}" data-id="${approval.id}" class="py-2 bg-white border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <span class="material-symbols-outlined text-sm">close</span> Rechazar
                </button>
            </div>
        </div>
    `
}