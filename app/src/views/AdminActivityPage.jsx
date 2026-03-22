import { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    IconButton,
    InputAdornment,
    Paper,
    Skeleton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TuneIcon from "@mui/icons-material/Tune";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getActivityLog } from "../api/settings";
import AdminPageHero from "../components/adminComponents/AdminPageHero";
import AdminSurface from "../components/adminComponents/AdminSurface";


// ─── helpers ──────────────────────────────────────────────────────────────────

const ACTION_META = {
    recharge: {
        label: "Recharge",
        color: "success",
        bgColor: "success.main",
        icon: <AccountBalanceWalletIcon fontSize="small" />,
    },
    adjustment: {
        label: "Balance adjustment",
        color: "info",
        bgColor: "info.main",
        icon: <TuneIcon fontSize="small" />,
    },
    refund_approved: {
        label: "Refund approved",
        color: "success",
        bgColor: "success.main",
        icon: <CheckCircleIcon fontSize="small" />,
    },
    refund_denied: {
        label: "Refund denied",
        color: "error",
        bgColor: "error.main",
        icon: <CancelIcon fontSize="small" />,
    },
};

function formatAmount(amount) {
    if (amount == null) return null;
    const sign = amount >= 0 ? "+" : "";
    return `${sign}€${Math.abs(amount).toFixed(2)}`;
}

function formatDate(iso) {
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}


// ─── Single entry ─────────────────────────────────────────────────────────────

function ActivityEntry({ entry }) {
    const meta = ACTION_META[entry.action] ?? {
        label: entry.action,
        color: "default",
        bgColor: "grey.500",
        icon: null,
    };
    const amountStr = formatAmount(entry.amount);
    const isRefund = entry.action.startsWith("refund");

    return (
        <Paper
            variant="outlined"
            sx={{
                px: { xs: 1.5, sm: 2 },
                py: 1.5,
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
            }}
        >
            {/* Icon avatar */}
            <Avatar
                sx={{
                    bgcolor: `${meta.bgColor}`,
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    mt: 0.25,
                }}
            >
                {meta.icon}
            </Avatar>

            {/* Content */}
            <Box flex={1} minWidth={0}>
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Chip
                        label={meta.label}
                        color={meta.color}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                    />
                    {amountStr && (
                        <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={entry.amount >= 0 ? "success.main" : "error.main"}
                        >
                            {amountStr}
                        </Typography>
                    )}
                </Box>

                <Typography variant="body2" mt={0.5}>
                    <Typography component="span" variant="body2" color="text.secondary">
                        by{" "}
                    </Typography>
                    <strong>@{entry.admin_username ?? "—"}</strong>
                    <Typography component="span" variant="body2" color="text.secondary">
                        {" "}→{" "}
                    </Typography>
                    <strong>@{entry.target_username ?? "—"}</strong>
                </Typography>

                {entry.note && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mt={0.25}
                        sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {isRefund ? `Admin note: "${entry.note}"` : entry.note}
                    </Typography>
                )}
            </Box>

            {/* Timestamp */}
            <Tooltip title={new Date(entry.created_at).toLocaleString()}>
                <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ flexShrink: 0, mt: 0.5, textAlign: "right" }}
                    noWrap
                >
                    {formatDate(entry.created_at)}
                </Typography>
            </Tooltip>
        </Paper>
    );
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminActivityPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");

    const { data: log = [], isLoading } = useQuery({
        queryKey: ["admin-activity-log"],
        queryFn: getActivityLog,
        staleTime: 1000 * 30,
    });

    const filtered = log.filter((entry) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
            entry.admin_username?.toLowerCase().includes(q) ||
            entry.target_username?.toLowerCase().includes(q) ||
            entry.action.toLowerCase().includes(q) ||
            entry.note?.toLowerCase().includes(q)
        );
    });

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            <AdminPageHero
                title="Activity Log"
                description="Track admin-initiated recharges, balance adjustments, and refund resolutions with a cleaner audit view."
                action={(
                    <Button
                        startIcon={<RefreshIcon />}
                        variant="contained"
                        size="medium"
                        onClick={() => queryClient.invalidateQueries(["admin-activity-log"])}
                        color="primary"
                        sx={{ width: { xs: "100%", md: "auto" } }}
                    >
                        Refresh
                    </Button>
                )}
            />

            <AdminSurface title="Recent Admin Actions" description="Filter the audit log by actor, target user, action type, or note.">
                <TextField
                    placeholder="Search by admin, user, action or note…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="small"
                    fullWidth
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                            endAdornment: search ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearch("")}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        },
                    }}
                />

                <Stack spacing={1}>
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={72} />
                    ))
                ) : filtered.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            {search ? "No entries match your search." : "No activity recorded yet."}
                        </Typography>
                    </Paper>
                ) : (
                    filtered.map((entry) => (
                        <ActivityEntry key={entry.id} entry={entry} />
                    ))
                )}
                </Stack>
            </AdminSurface>
        </Box>
    );
}
