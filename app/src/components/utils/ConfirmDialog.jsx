import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

// Generic "are you sure?" dialog for destructive actions — a styled
// replacement for ad-hoc window.confirm() calls and one-off dialogs, so
// every delete/remove action in the app gets the same look, loading state,
// and two-click confirm flow.
export default function ConfirmDialog({
    open,
    title,
    message,
    onClose,
    onConfirm,
    confirmLabel = "Delete",
    confirmColor = "error",
    loading = false,
}) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button color={confirmColor} variant="contained" onClick={onConfirm} disabled={loading}>
                    {loading ? "Working…" : confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
