import { createContext, useContext } from "react"
import { useQuery } from "@tanstack/react-query"

import { getMyTransactions } from "../api/transaction"


const TransactionContext = createContext(null)


export function TransactionProvider({ children }) {
    const queryTx = useQuery({
        queryKey: ["tx"],
        queryFn: getMyTransactions,
        staleTime: 1000 * 60 * 5,
        retry: false
    })

    const { data: txs, isLoading, isError } = queryTx;

    return (
        <TransactionContext.Provider value={{ txs, isLoading, isError }}>
            { children }
        </ TransactionContext.Provider>
    )
}

export function useTxs() {
    return useContext(TransactionContext)
}
