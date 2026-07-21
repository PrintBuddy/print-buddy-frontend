import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

export default function ConfirmPayAdminDialog({ admin, onClose, onConfirm }) {
    return (
        <Dialog open={Boolean(admin)} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Pay {admin?.username}?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Confirm you've physically handed over <strong>€{Number(admin ? Math.abs(admin.net_amount) : 0).toFixed(2)}</strong> to{" "}
                    <strong>{admin?.name} {admin?.surname}</strong> from the recollected cash before marking this debt paid — this cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button color="success" variant="contained" onClick={onConfirm}>
                    Confirm Payment
                </Button>
            </DialogActions>
        </Dialog>
    );
}
