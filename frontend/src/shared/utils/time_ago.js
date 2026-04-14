export function timeAgo(timestamp) {
    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

    const now = new Date();
    const past = new Date(timestamp);
    const diff = (past - now) / 1000;

    if (Math.abs(diff) < 60) return rtf.format(Math.round(diff), 'second');
    if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour');

    return rtf.format(Math.round(diff / 86400), 'day');
}