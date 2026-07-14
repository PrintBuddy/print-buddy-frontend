import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { print } from "../api/print";

// Owns the sequential submit-with-per-file-snackbars flow for StepSend,
// decoupled from rendering.
export default function useSubmitPrint({ selectedIds, selectedPrinter, printerOptionsByFile, selectedFiles }) {
    const [isPrinting, setIsPrinting] = useState(false);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const handlePrint = async () => {
        setIsPrinting(true);

        const printStatus = {};

        for (let i = 0; i < selectedIds.length; i++) {
            const id = selectedIds[i];
            printStatus[id] = { status: false, message: "" };

            try {
                await print(selectedPrinter.name, id, printerOptionsByFile[id]);
                printStatus[id].status = true;
            } catch (err) {
                printStatus[id].message = err.message;
            }
        }

        const filesMap = Object.fromEntries(selectedFiles.map(obj => [obj.id, obj]));
        setTimeout(() => {
            setIsPrinting(false);

            for (const key in printStatus) {
                const status = printStatus[key].status;
                if (status) {
                    enqueueSnackbar(`File ${filesMap[key].filename} queued`, { variant: "success" });
                } else {
                    enqueueSnackbar(`Could not print ${filesMap[key].filename}. Try again later.`, { variant: "error" });
                }
            }

            navigate("/");
        }, 800);
    };

    return { isPrinting, handlePrint };
}
