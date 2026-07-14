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

    const printerRevenueChartData = allPrinters.map((p) => {
        const s = statsByPrinterName[p.name];
        return {
            name: labelFn(p.name),
            fullName: p.name,
            Revenue: s?.total_cost ?? 0,
        };
    });

    const topUserChartData = (stats?.by_user ?? []).slice(0, 10).map((u) => ({
        name: labelFn(u.username),
        fullName: u.username,
        "B/W": u.bw_pages,
        Color: u.color_pages,
    }));

    const f = stats?.finance ?? {};
    const adjustmentsPositive = (f.total_adjustments ?? 0) >= 0;
    const computedSum = (f.total_current_balance ?? 0)
        + (f.total_spent_on_print ?? 0)
        - (f.total_refunded ?? 0)
        - (f.total_adjustments ?? 0);
    const discrepancy = Math.abs((f.total_recharged ?? 0) - computedSum) > 0.02;

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
        printerRevenueChartData,
        topUserChartData,
        finance: { f, adjustmentsPositive, discrepancy },
        printerRows,
        userRows,
    };
}
