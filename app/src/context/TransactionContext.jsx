import { createContext, useContext } from "react"
import { useQuery } from "@tanstack/react-query"

import { getMyTransactions } from "../api/transaction"
import { useAuth } from "./AuthContext"


const TransactionContext = createContext(null)


export function TransactionProvider({ children }) {
    const { statusLoggedIn } = useAuth();

    const queryTx = useQuery({
        queryKey: ["tx"],
        queryFn: getMyTransactions,
        enabled: statusLoggedIn === "loggedIn",
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
