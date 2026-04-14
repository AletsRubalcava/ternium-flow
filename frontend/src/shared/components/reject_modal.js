export function renderRejectModal() {
    const element = document.getElementById("rejectModal");
    if (!element) return;

    element.innerHTML = `
        <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-surface-dark rounded-2xl p-6 w-96 shadow-xl">
                <div class="flex items-center gap-3 mb-4">
                    <span class="material-symbols-outlined text-red-500 text-2xl">cancel</span>
                    <h2 class="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">Rechazar tarima</h2>
                </div>
                <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-3">
                    Indica el motivo del rechazo. Este comentario será visible para el solicitante.
                </p>
                <textarea id="rejectComments" rows="4" placeholder="Escribe el motivo del rechazo..."
                    class="w-full border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-sm bg-white dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"></textarea>
                <p id="rejectError" class="hidden text-xs text-red-500 mt-1">Debes escribir un motivo.</p>
                <div class="flex justify-end gap-3 mt-5">
                    <button id="cancelReject"
                        class="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition text-sm font-medium">Cancelar</button>
                    <button id="confirmReject"
                        class="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition text-sm font-bold">Confirmar rechazo</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById("cancelReject").addEventListener("click", () => {
        closeRejectModal();
    });
}

// Abre el modal y devuelve una Promise que resuelve con los comments o null si cancela
export function openRejectModal() {
    const modal = document.getElementById("rejectModal");
    if (!modal) return Promise.resolve(null);

    modal.classList.remove("hidden");
    document.getElementById("rejectComments").value = "";
    document.getElementById("rejectError").classList.add("hidden");

    return new Promise((resolve) => {
        const confirmBtn = document.getElementById("confirmReject");
        const cancelBtn  = document.getElementById("cancelReject");

        function onConfirm() {
            const comments = document.getElementById("rejectComments").value.trim();
            if (!comments) {
                document.getElementById("rejectError").classList.remove("hidden");
                return;
            }
            cleanup();
            closeRejectModal();
            resolve(comments);
        }

        function onCancel() {
            cleanup();
            closeRejectModal();
            resolve(null);
        }

        function cleanup() {
            confirmBtn.removeEventListener("click", onConfirm);
            cancelBtn.removeEventListener("click",  onCancel);
        }

        confirmBtn.addEventListener("click", onConfirm);
        cancelBtn.addEventListener("click",  onCancel);
    });
}

function closeRejectModal() {
    document.getElementById("rejectModal").classList.add("hidden");
}