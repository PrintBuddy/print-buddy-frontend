import { ArrowUpward, ArrowDownward, Autorenew } from "@mui/icons-material";

const TYPE_LABELS = {
    product_purchase: "Purchase",
};

export function getIconForType(type) {
    switch (type) {
        case "recharge":
            return <ArrowUpward color="success" />;
        case "refund":
            return <ArrowUpward color="info" />;
        case "adjustment":
            return <Autorenew color="warning" />;
        case "print":
        case "product_purchase":
            return <ArrowDownward color="error" />;
        default:
            return null;
    }
}

export function getLabelForType(type) {
    return (TYPE_LABELS[type] ?? type).toUpperCase();
}
