import {
    Chip,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const STATUS_COLOR = {
    pending: "warning",
    fulfilled: "success",
    rejected: "error",
};

export default function MyPurchasesTable({ purchases, isLoading }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const skeletonRows = Array.from({ length: 3 });

    const sorted = [...(purchases || [])].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    return (
        <TableContainer component={Paper} sx={{ mt: 1, maxHeight: "calc(60vh - 160px)", overflowY: "auto" }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Qty</TableCell>
                        <TableCell>Total (€)</TableCell>
                        <TableCell>Status</TableCell>
                        {!isMobile && <TableCell>Admin note</TableCell>}
                        <TableCell align="right">Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        skeletonRows.map((_, i) => (
                            <TableRow key={i}>
                                <TableCell colSpan={isMobile ? 5 : 6}><Skeleton /></TableCell>
                            </TableRow>
                        ))
                    ) : sorted.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={isMobile ? 5 : 6} align="center">
                                <Typography variant="body2" color="text.secondary">
                                    No purchases yet.
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        sorted.map((purchase) => (
                            <TableRow key={purchase.id} hover>
                                <TableCell>{purchase.product_name}</TableCell>
                                <TableCell>{purchase.quantity}</TableCell>
                                <TableCell>{Number(purchase.total_amount).toFixed(2)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={purchase.status}
                                        color={STATUS_COLOR[purchase.status] ?? "default"}
                                        size="small"
                                    />
                                </TableCell>
                                {!isMobile && (
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }} color="text.secondary">
                                            {purchase.admin_message ?? "—"}
                                        </Typography>
                                    </TableCell>
                                )}
                                <TableCell align="right">
                                    <Typography variant="caption">
                                        {new Date(purchase.created_at).toLocaleString()}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
