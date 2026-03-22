

export function countPagesInRange(pageRanges, totalPages) {
    if (!pageRanges || pageRanges.trim() === "") {
        return totalPages; // todas las páginas
    }

    let pages = new Set();

    pageRanges.split(",").forEach(part => {
        const [startStr, endStr] = part.split("-").map(s => s.trim());
        const start = parseInt(startStr, 10);
        const end = endStr ? parseInt(endStr, 10) : start;

        if (isNaN(start) || start < 1) return;

        const validEnd = isNaN(end) || end > totalPages ? totalPages : end;
        for (let i = start; i <= validEnd; i++) {
            pages.add(i);
        }
    });

    return pages.size;
}


export function calculateTotalCost(selectedFiles, printerOptionsByFile, selectedPrinter) {
    const priceColor = selectedPrinter?.price_per_page_color || 0;
    const priceBW = selectedPrinter?.price_per_page_bw || 0;
    
    let totalColorPages = 0;
    let totalBWPages = 0;

    selectedFiles.forEach(file => {
        const opts = printerOptionsByFile[file.id];
        if (!opts) return;

        // Contar páginas usando la función dedicada
        const pagesCount = countPagesInRange(opts.pageRanges, file.pages);

        // Multiplicar por el número de copias
        const copies = new Number(opts.copies);
        const totalPagesForFile = pagesCount * (copies || 1);

        // Sumar según colorMode
        if (opts.colorMode === "Color") {
            totalColorPages += totalPagesForFile;
        } else {
            totalBWPages += totalPagesForFile;
        }
    });

    // Calcular costo total
    const totalCost = totalColorPages * priceColor + totalBWPages * priceBW;
    return roundCurrency(totalCost);
}
function roundCurrency(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
