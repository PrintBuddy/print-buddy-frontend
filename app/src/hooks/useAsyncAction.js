import { useState } from "react";

// Factors out the "run an async action, track a loading flag, notify on
// success/error" pattern that was duplicated across several admin handlers
// (add/remove member, add/update/remove printer permit). Generic enough to
// reuse anywhere else the same shape shows up.
export default function useAsyncAction(fn, { onSuccess, onError } = {}) {
    const [loading, setLoading] = useState(false);

    const run = async (...args) => {
        setLoading(true);
        try {
            const result = await fn(...args);
            onSuccess?.(result, ...args);
            return result;
        } catch (err) {
            onError?.(err, ...args);
        } finally {
            setLoading(false);
        }
    };

    return [run, loading];
}
