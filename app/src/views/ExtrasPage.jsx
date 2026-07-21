import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Box, Button, Grid, Skeleton, Typography } from "@mui/material";
import { useSnackbar } from "../hooks/useSnackbar";

import { getProducts, purchaseProduct, getMyPurchases } from "../api/product";
import UserSurface from "../components/userViewComponents/UserSurface";
import UserPageHero from "../components/userViewComponents/UserPageHero";
import BalanceIndicator from "../components/balanceComponents/BalanceIndicator";
import PurchaseProductModal from "../components/extrasComponents/PurchaseProductModal";
import MyPurchasesTable from "../components/extrasComponents/MyPurchasesTable";
import { useUser } from "../context/UserContext";

export default function ExtrasPage() {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    const { user, isLoading: userLoading, isError: userError, refreshUser } = useUser();
    const [selectedProduct, setSelectedProduct] = useState(null);

    const { data: products, isLoading } = useQuery({
        queryKey: ["extras-products"],
        queryFn: getProducts,
        staleTime: 1000 * 60,
        retry: false,
    });

    // Short staleTime + refetch-on-focus: an admin resolving this from
    // Telegram (or the web queue) should show up here without the user
    // having to guess that a refresh is needed.
    const { data: myPurchases, isLoading: purchasesLoading } = useQuery({
        queryKey: ["my-product-purchases"],
        queryFn: getMyPurchases,
        staleTime: 1000 * 15,
        refetchOnWindowFocus: true,
        retry: false,
    });

    const purchaseMutation = useMutation({
        mutationFn: ({ productId, quantity, message }) => purchaseProduct(productId, quantity, message),
        onSuccess: () => {
            queryClient.invalidateQueries(["my-product-purchases"]);
            refreshUser();
        },
    });

    const handlePurchase = async (productId, quantity, message) => {
        await purchaseMutation.mutateAsync({ productId, quantity, message });
        enqueueSnackbar("Purchase requested — waiting for an admin to confirm.", { variant: "success" });
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            <UserPageHero
                title="Extras"
                description="Additional items you can buy with your account balance."
            >
                <BalanceIndicator user={user} isLoading={userLoading} isError={userError} />
            </UserPageHero>

            <UserSurface title="Available Items" description="Pick a quantity and leave a note for the admin if needed.">
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
                                        onClick={() => setSelectedProduct(product)}
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

            <UserSurface
                title="My Purchases"
                description="Track what you've bought and whether an admin has given you the item yet."
            >
                <MyPurchasesTable purchases={myPurchases} isLoading={purchasesLoading} />
            </UserSurface>

            <PurchaseProductModal
                open={Boolean(selectedProduct)}
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onSubmit={handlePurchase}
            />
        </Box>
    );
}
