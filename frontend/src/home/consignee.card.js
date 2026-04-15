export function consigneeCard(consignee) {
    return `
        <div data-id="${consignee.id}" class="consigneeCard p-4 rounded-xl border border-slate-100 bg-slate-100 hover:border-primary/30 transition-all group">
            
            <div class="flex justify-between items-start mb-1">
                <h4 class="font-bold text-slate-900">${consignee.name}</h4>
                <span class="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                    0 Seguimientos Activos
                </span>
            </div>

            <div class="flex items-center gap-3 mb-4 text-xs text-slate-500">
                <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">location_on</span>
                    ${consignee.address}
                </div>
            </div>

            <div class="grid grid-cols-1 gap-2">
                <button data-action="view-more" data-id="${consignee.id}" 
                    class="py-2 bg-primary hover:bg-orange-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
                    Ver más
                    <span class="material-symbols-outlined text-sm">arrow_right_alt</span>
                </button>
            </div>
        </div>
    `
}