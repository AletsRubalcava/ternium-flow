export function emptyWidget(mensaje) {
    return `
        <div class="py-10 w-full h-full flex items-center justify-center">
            <div class="flex flex-col justify-center items-center gap-2">
                <div class="size-20 rounded-full bg-slate-100 flex items-center justify-center">
                    <span class="material-symbols-outlined text-5xl text-slate-400">playlist_remove</span>
                </div>
                <p class="text-slate-400">${mensaje}</p>
            </div>
        </div>`;
}