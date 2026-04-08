const attributes = ["Nombre", "Cliente", "Consignatario", "Estado"];

export async function loadPlatforms() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const resCustomers = await axios.get(`http://localhost:3000/api/customers/${id}`);
    const customer = resCustomers.data;

    const resConsignees = await axios.get("http://localhost:3000/api/consignees");
    const consignees = resConsignees.data.filter(c => c.id_customer == customer.id);

    const resPlatforms = await axios.get("http://localhost:3000/api/platforms");
    const resPlatformRequests = await axios.get("http://localhost:3000/api/platform_request");

    const platformRequests = resPlatformRequests.data.filter(pr =>
        consignees.some(c => c.id === pr.id_consignee)
    );

    const platforms = resPlatforms.data.filter(p =>
        platformRequests.some(pr =>
            pr.id_platform === p.id && pr.status === 'Aceptada'
        )
    );

    const title = document.getElementById("pageTitle");
    const search = document.getElementById("search");
    const newButton = document.getElementById("newButton");
    const thead = document.getElementById("listViewThead");
    const tbody = document.getElementById("listViewBody");

    title.textContent = "TARIMAS";
    search.placeholder = "Buscar Tarimas";

    newButton.innerHTML = `
        <span class="material-icons text-lg group-hover:scale-110 transition-transform">add</span>
            Nueva Tarima`;

    newButton.classList.remove("hidden");

    newButton.onclick = () => window.location.href = `/frontend/src/platforms/detailed_platform.html?create=true&idCus=${customer.id}`;

    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
    `).join("");

    console.log(consignees);
    console.log(platforms);

    tbody.innerHTML = platforms.map(p => `
        <tr data-id="${p.id}" class="customer-row bg-gray-50/50 hover:bg-gray-100 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">${p.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">${customer.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">
                ${consignees.find(c => c.id == platformRequests.find(pr => pr.id_platform === p.id)?.id_consignee)?.name || "—"}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span
                    class=" ${p.status ? "bg-green-100 text-green-800": "bg-red-100 text-red-800"} px-2 inline-flex text-xs leading-5 font-semibold rounded-full">${p.status ? "Activo" : "Inactivo"}</span>
            </td>
        </tr>
    `).join("");

    document.querySelectorAll(".customer-row").forEach(row => {
        row.addEventListener("click", () => {
            const id = row.dataset.id;
            window.location.href = `/frontend/src/platforms/detailed_platform.html?id=${id}`;
        });
    });
}