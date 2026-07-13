import { createContext, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getPrinters } from "../api/printer";


const PrinterContext = createContext(null);


export function PrinterProvider({ children }) {

    const queryPrinters = useQuery({
        queryKey: ['printers'],
        queryFn: getPrinters,
        staleTime: 1000 * 60 * 5,
        retry: false
    })

    const {data: printers, isError, isLoading} = queryPrinters;

    const [ selectedPrinter, setSelectedPrinter ] = useState(() => {
        const saved = sessionStorage.getItem("selectedPrinter");
        return saved ? JSON.parse(saved) : null;
    });

    const selectPrinter = (printer) => {
        sessionStorage.setItem("selectedPrinter", JSON.stringify(printer));
        setSelectedPrinter(printer)
    }

    const resetState = () => {
        setSelectedPrinter(null);
        sessionStorage.removeItem("selectedPrinter");
    }

    return (
        <PrinterContext.Provider value={{
            printers, isLoading, isError,
            selectPrinter, selectedPrinter,
            resetState
        }}>
            { children }
        </PrinterContext.Provider>
    )
}

export function usePrinter() {
    return useContext(PrinterContext);
}