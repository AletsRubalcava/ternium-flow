import {customers, consignees, platforms, followUps} from "../shared/db.js";
import { setActiveNav } from "../shared/page_directory.js";

setActiveNav("customers");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const create = params.get("create") == true;

const customer = customers.find(c => c.id === id);
const consignee = consignees.filter(c => c.idCustomer == customer.id);
const platformCustomer = platforms.filter(p => consignee.some(c => c.id == p.idConsignee));
const followUp = followUps.filter(f => consignee.some(c => c.id == f.idConsignee));

//General Info
const upperClientId = document.getElementById("upperClientId");
const idCustomer = document.getElementById("idCustomer");
const customerName = document.getElementById("customerName");
const customerRFC = document.getElementById("customerRFC");
const customerAddress = document.getElementById("customerAddress");
const clientStatus = document.getElementById("clientStatus");

upperClientId.textContent = `ID: ${customer.id}`
idCustomer.textContent = customer.id;
customerName.textContent = customer.name;
customerRFC.textContent = customer.rfc;
customerAddress.textContent = customer.address;
clientStatus.innerHTML = `
    <div id="clientStatus" class="${customer.status == 1 ? "bg-green-100 text-green-800": "bg-red-100 text-red-800"} inline-flex items-start px-2 py-0.5 rounded text-[10px] font-bold uppercase">${customer.status == 1 ? "Activo" : "Inactivo"}</div>`;

//Consignees
const consigneeWidget = document.getElementById("consigneeWidget");
const activeConsignees = document.getElementById("activeConsignees");
const viewAllConsignees = document.getElementById("viewAllConsignees");

activeConsignees.textContent = `(${consignee.length} activos)`;

if(consignee.length == 0){
    consigneeWidget.innerHTML = `
    <div class="py-10 w-full h-full flex items-center justify-center">
        <div class="flex flex-col justify-center items-center gap-2">
            <div class="size-20 rounded-full bg-slate-100 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-5xl text-slate-400">playlist_remove</span>
            </div>
            <p class="text-slate-400">Sin consignatarios</p>
        </div>
    </div>`;
}else{
    consigneeWidget.innerHTML = consignee.map(c => `
        <div class="group cursor-pointer p-3 rounded-lg border border-border-light dark:border-border-dark hover:border-primary/50 transition-all flex justify-between items-center">
            <div>
                <div class="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">${c.name}</div>
                <div class="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">${c.address}</div>
            </div>
            <span class="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-primary">chevron_right</span>
        </div>
    `).join("");
}

viewAllConsignees.onclick = () => window.location.href = `/frontend/src/shared/list_view.html?type=consignees&id=${id}`;

//Platforms
const activePlaforms = document.getElementById("activePlatforms");
const authorizedPlatforms = document.getElementById("platformWidget");

activePlaforms.textContent = `(${platformCustomer.length} activas)`;

if(platformCustomer.length == 0){
    authorizedPlatforms.innerHTML = `
        <div class="py-10 w-full h-full flex items-center justify-center">
            <div class="flex flex-col justify-center items-center gap-2">
                <div class="size-20 rounded-full bg-slate-100 flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-5xl text-slate-400">playlist_remove</span>
                </div>
                <p class="text-slate-400">Sin tarimas</p>
            </div>
        </div>`;
}else{
    authorizedPlatforms.innerHTML = platformCustomer.map(p => `
        <div class="group cursor-pointer p-3 rounded-lg border border-border-light dark:border-border-dark hover:border-primary/50 transition-all flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div>
                    <div class="text-sm font-medium text-text-primary-light">${p.name}</div>
                    <div class="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">${p.description}, ${p.weight}kg</div>
                </div>
            </div>
            <span class="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-primary">chevron_right</span>
        </div>
    `).join("");
}

//Follow ups
const followUpsBody = document.getElementById("followUpsBody");
const followUpsThead = document.getElementById("followUpsThead")
const viewAllPlatforms = document.getElementById("viewAllPlatforms");

if(followUp.length == 0){
    followUpsThead.innerHTML = ``;
    followUpsBody.innerHTML = `
        <div class="py-10 w-full flex items-center justify-center">
            <div class="flex flex-col justify-center items-center gap-2">
                <div class="size-20 rounded-full bg-slate-100 flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-5xl text-slate-400">playlist_remove</span>
                </div>
                <p class="text-slate-400">Sin seguimientos</p>
            </div>
        </div>`;
}else{
    const statusClass = {
        "Entregado": "bg-green-100 text-green-800",
        "En tránsito": "bg-orange-100 text-orange-800",
        "Procesando": "bg-blue-100 text-blue-800",
        "Cancelado": "bg-red-100 text-red-800"
    };

    followUpsBody.innerHTML = followUp.map(f => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-sm font-bold text-text-primary-light dark:text-text-primary-dark">${f.id}</td>
            <td class="px-6 py-4 text-xs text-text-secondary-light dark:text-text-secondary-dark">${f.date}</td>
            <td class="px-6 py-4 text-sm font-medium">${f.weight} kg</td>
            <td class="px-6 py-4 text-xs text-text-secondary-light dark:text-text-secondary-dark">${consignee.find(c => c.id == f.idConsignee).name}</td>
            <td class="px-6 py-4 text-right">
                <span class="${statusClass[f.status]} px-2 py-1 text-[10px] font-bold rounded-full">${f.status}</span>
            </td>
        </tr>
    `).join("");
}

viewAllPlatforms.onclick = () => window.location.href = `/frontend/src/shared/list_view.html?type=platforms&id=${id}`;

`    <div class="group cursor-pointer p-3 rounded-lg border border-orange-200 bg-orange-50 dark:bg-primary/10 dark:border-primary/30 flex justify-between items-center">
        <div>
            <div class="text-sm font-bold text-text-primary-light dark:text-white">${c.name}</div>
                <div class="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">${c.address}</div>
            </div>
        <span class="material-symbols-outlined text-primary">check_circle</span>
    </div>`

    `<div class="flex items-center gap-3">
        <div
            class="w-8 h-8 rounded bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-border-light dark:border-dark">
            <span class="material-symbols-outlined text-gray-400 text-lg">view_in_ar</span>
        </div>
        <div>
            <div
                class="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                Industrial Reforzada</div>
            <div
                class="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                Madera Pino, Doble entrada, 2000kg</div>
        </div>
    </div>
    <span
        class="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-primary">chevron_right</span>`