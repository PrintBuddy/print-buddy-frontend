import { useEffect, useState } from "react";

import { calculateTotalCost, countPagesInRange } from "../components/printCoreFunctions/calculateCost";

// Owns the "compute a print job summary from the current selection" concern
// for StepSend — previously a useEffect + inline reduce duplicated across
// the mobile/desktop render branches.
export default function usePrintSummary(files, selectedIds, printerOptionsByFile, selectedPrinter) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [totalCost, setTotalCost] = useState(0);

    useEffect(() => {
        const current = files?.filter(f => selectedIds.includes(f.id)) || [];
        setSelectedFiles(current);
        setTotalCost(calculateTotalCost(current, printerOptionsByFile, selectedPrinter));
    }, [files, selectedIds, printerOptionsByFile, selectedPrinter]);

    const totalPages = selectedFiles.reduce((sum, file) => {
        const opts = printerOptionsByFile[file.id];
        return sum + countPagesInRange(opts?.pageRanges, file.pages) * (opts?.copies || 1);
    }, 0);

    return { selectedFiles, totalCost, totalPages };
}
