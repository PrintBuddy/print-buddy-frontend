import {
    useSnackbar as useNotistackSnackbar,
    enqueueSnackbar as notistackEnqueueSnackbar,
} from "notistack";

// Unrelated failures can legitimately produce the exact same error message
// at almost the exact same moment (e.g. several queries all rejecting with
// "Not authenticated" right after landing on a page). Showing each one is
// just noise, so any *error* toast is deduped by message text within a
// short window app-wide, regardless of which component or query triggered
// it. Other variants (success/info/warning) are left untouched since
// repeats there are almost always distinct, intentional events.
const DEDUPE_WINDOW_MS = 5000;
const recentErrors = new Map();

function isDuplicateError(message, variant) {
    if (variant !== "error") return false;

    const now = Date.now();
    for (const [msg, timestamp] of recentErrors) {
        if (now - timestamp > DEDUPE_WINDOW_MS) recentErrors.delete(msg);
    }

    if (recentErrors.has(message)) return true;
    recentErrors.set(message, now);
    return false;
}

export function enqueueSnackbar(message, options) {
    if (isDuplicateError(message, options?.variant)) return;
    return notistackEnqueueSnackbar(message, options);
}

export function useSnackbar() {
    const { enqueueSnackbar: rawEnqueue, closeSnackbar } = useNotistackSnackbar();

    const enqueue = (message, options) => {
        if (isDuplicateError(message, options?.variant)) return;
        return rawEnqueue(message, options);
    };

    return { enqueueSnackbar: enqueue, closeSnackbar };
}
