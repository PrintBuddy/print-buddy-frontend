import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Box, Button, Grid, Skeleton, Typography } from "@mui/material";
import { useSnackbar } from "notistack";

import { getProducts, purchaseProduct } from "../api/product";
import UserSurface from "../components/userViewComponents/UserSurface";
import { useUser } from "../context/UserContext";

export default function ExtrasPage() {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    const { refreshUser } = useUser();

    const { data: products, isLoading } = useQuery({
        queryKey: ["extras-products"],
        queryFn: getProducts,
        staleTime: 1000 * 60,
        retry: false,
    });

    const purchaseMutation = useMutation({
        mutationFn: (productId) => purchaseProduct(productId),
        onSuccess: () => {
            queryClient.invalidateQueries(["extras-products"]);
            refreshUser();
        },
    });

    const handlePurchase = async (product) => {
        try {
            const result = await purchaseMutation.mutateAsync(product.id);
            enqueueSnackbar(
                `Purchased ${product.name} — new balance €${result.new_balance.toFixed(2)}.`,
                { variant: "success" }
            );
        } catch (err) {
            enqueueSnackbar(err?.response?.data?.detail ?? "Purchase failed.", { variant: "error" });
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            <UserSurface title="Extras" description="Additional items you can buy with your account balance.">
                <Grid container spacing={2}>
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                                <Skeleton variant="rounded" height={120} />
                            </Grid>
                        ))
                    ) : !products?.length ? (
                        <Grid size={12}>
                            <Typography variant="body2" color="text.secondary">
                                No extras available right now.
                            </Typography>
                        </Grid>
                    ) : (
                        products.map((product) => (
                            <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                <Box
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 3,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1.5,
                                        height: "100%",
                                    }}
                                >
                                    <Typography variant="subtitle1" fontWeight={700}>{product.name}</Typography>
                                    <Typography variant="h6" color="primary.main">€{product.price.toFixed(2)}</Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => handlePurchase(product)}
                                        disabled={purchaseMutation.isPending}
                                        sx={{ mt: "auto" }}
                                    >
                                        Buy
                                    </Button>
                                </Box>
                            </Grid>
                        ))
                    )}
                </Grid>
            </UserSurface>
        </Box>
    );
}
