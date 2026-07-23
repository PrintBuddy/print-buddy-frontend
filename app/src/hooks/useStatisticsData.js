function shortLabel(label, maxLen = 14) {
    if (!label) return "";
    return label.length > maxLen ? label.slice(0, maxLen - 1) + "…" : label;
}

function shortLabelMobile(label, maxLen = 9) {
    if (!label) return "";
    return label.length > maxLen ? label.slice(0, maxLen - 1) + "…" : label;
}

// Owns the derived chart/table data and finance breakdown math for
// AdminStatisticsPage, so the page component itself is just fetch + compose.
export default function useStatisticsData(stats, allPrinters, isMobile) {
    const labelFn = isMobile ? shortLabelMobile : shortLabel;

    const statsByPrinterName = Object.fromEntries(
        (stats?.by_printer ?? []).map((p) => [p.printer_name, p])
    );

    const printerChartData = allPrinters.map((p) => {
        const s = statsByPrinterName[p.name];
        return {
            name: labelFn(p.name),
            fullName: p.name,
            "B/W": s?.bw_pages ?? 0,
            Color: s?.color_pages ?? 0,
        };
    });

    const f = stats?.finance ?? {};
    const adjustmentsPositive = (f.total_adjustments ?? 0) >= 0;
    // The only real-world cash flows in this system are recharges (in) and
    // expenses (out) — refunds/print-spend/adjustments only move credit
    // *within* the app's own ledger, they never pull cash back out once a
    // recharge has been received. See Finance Overview's two groups.
    const netCashChange = (f.total_recharged ?? 0) - (f.total_expenses ?? 0);

    const printerRows = (stats?.by_printer ?? []).map((p) => ({
        key: p.printer_name,
        name: p.printer_name,
        total_pages: p.total_pages,
        bw_pages: p.bw_pages,
        color_pages: p.color_pages,
        total_sheets: p.total_sheets,
        total_cost: p.total_cost,
    }));

    const userRows = (stats?.by_user ?? []).map((u) => ({
        key: u.user_id,
        name: u.username,
        total_pages: u.total_pages,
        bw_pages: u.bw_pages,
        color_pages: u.color_pages,
        total_sheets: u.total_sheets,
    }));

    return {
        printerChartData,
        finance: { f, adjustmentsPositive, netCashChange },
        printerRows,
        userRows,
    };
}
