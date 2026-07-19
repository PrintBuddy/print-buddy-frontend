import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

export default function ConfirmCollectDialog({ admin, onClose, onConfirm }) {
    return (
        <Dialog open={Boolean(admin)} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Collect from {admin?.username}?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Confirm you've physically received <strong>€{Number(admin?.outstanding_amount ?? 0).toFixed(2)}</strong> from{" "}
                    <strong>{admin?.name} {admin?.surname}</strong> before marking it collected — this cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button color="success" variant="contained" onClick={onConfirm}>
                    Confirm Collection
                </Button>
            </DialogActions>
        </Dialog>
    );
}
