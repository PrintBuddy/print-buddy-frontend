import { Box, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";
import { getIconForType, getLabelForType } from "./transactionDisplay";

export default function TransactionDetailsModal({ transaction, onClose }) {
    if (!transaction) return null;

    return (
        <CustomModal
        open={!!transaction}
        onClose={onClose}
        title="Transaction Details"
        content={
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {getIconForType(transaction.type)}
                <Typography variant="body1" fontWeight="600">
                {getLabelForType(transaction.type)}
                </Typography>
            </Box>

            <Typography>
                <strong>Amount:</strong>{" "}
                {transaction.amount > 0 ? "+" : ""}
                {transaction.amount.toFixed(2)} €
            </Typography>

            <Typography>
                <strong>Details:</strong>{" "}
                {transaction.note || ""}
            </Typography>

            <Typography>
                <strong>Balance after:</strong> €{transaction.balance_after.toFixed(2) || "—"}
            </Typography>

            <Typography>
                <strong>Date:</strong>{" "}
                {transaction.created_at
                ? new Date(transaction.created_at).toLocaleString()
                : "—"}
            </Typography>
            </Box>
        }
        />
    );
}
