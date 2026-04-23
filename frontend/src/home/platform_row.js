import { roles } from "../../../shared/roles.js";
import { plaftformType } from "../shared/api/api_platform_constants.js"
import { getAppContext } from "../shared/app_context.js"

export function platformTableRow(platform){
    const context = getAppContext();
    return `
        <tr data-id="${platform.id}" class="platformData hover:bg-slate-200 transition-colors group">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-slate-700 dark:text-slate-300">${platform.name}</span>
                </div>
            </td>
            <td class="px-6 py-4 text-xs text-slate-500">${platform.description ?? "—"}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold">
                    ${platform.type === plaftformType.preset && context.role !== roles.customer
                        ? `${platform.uses ?? 0} usos` 
                        : platform.consigneeName ?? "N/A"}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-1.5">
                    <span class="text-[12px] font-bold text-slate-400">
                        ${platform.weight ? `${platform.weight} kg` : "—"}
                    </span>
                </div>
            </td>
        </tr>
    `
}