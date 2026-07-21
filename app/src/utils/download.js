// Triggers a browser download for an already-fetched Blob (e.g. from an
// axios `responseType: "blob"` response) — there's no <a href> to point at
// since the data only exists in memory, so a temporary object URL stands in.
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
