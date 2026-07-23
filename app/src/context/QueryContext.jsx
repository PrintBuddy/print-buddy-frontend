import { QueryClient, QueryCache, MutationCache, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { enqueueSnackbar } from '../hooks/useSnackbar'


function reportError(error, query) {
    // 401s are already handled by the auth-expired redirect flow; a toast
    // on top of that is just noise. Callers that already show their own
    // error UI can opt out via `meta: { skipGlobalErrorToast: true }`.
    if (error?.response?.status === 401) return;
    if (query?.meta?.skipGlobalErrorToast || query?.options?.meta?.skipGlobalErrorToast) return;

    const message = !error?.response
        ? "Network error — check your connection"
        : error.response.data?.detail || "Something went wrong";

    enqueueSnackbar(message, { variant: "error" });
}

const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error, query) => reportError(error, query),
    }),
    mutationCache: new MutationCache({
        onError: (error, _variables, _context, mutation) => reportError(error, mutation),
    }),
});


export function QueryContext({ children }) {
    return (
        <QueryClientProvider client={queryClient}>
            { children }
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}