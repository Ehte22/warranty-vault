import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, Typography, Button, Box, Divider, ToggleButtonGroup, ToggleButton, Paper, Badge, Grid2, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useGetPlansQuery, useSelectPlanMutation } from "../../redux/apis/plan.api";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";
import { useInitiatePaymentMutation, useVerifyPaymentMutation } from "../../redux/apis/payment.api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useApplyCouponMutation } from "../../redux/apis/coupon.api";

const SelectPlan = React.memo(() => {
    const [selectedPlan, setSelectedPlan] = useState<string>("");
    const [selectedPlanPrice, setSelectedPlanPrice] = useState<string>("");
    const [billingCycle, setBillingCycle] = useState<{ [key: string]: "monthly" | "yearly" }>({
        Free: "monthly",
        Pro: "monthly",
        Family: "monthly",
    });
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [coupon, setCoupon] = useState<string>("");
    const [discountedPrice, setDiscountedPrice] = useState<string>("");

    const navigate = useNavigate()
    const { user } = useSelector((state: RootState) => state.auth)

    const { data } = useGetPlansQuery({ isFetchAll: true })
    const [selectPlan, { isSuccess }] = useSelectPlanMutation()
    const [applyCoupon, { data: couponData, isSuccess: isApplyCouponSuccess, isError: isApplyCouponError, error: applyCouponError }] = useApplyCouponMutation()
    const [initiatePayment] = useInitiatePaymentMutation()
    const [verifyPayment, { data: paymentData, isSuccess: paymentSuccess, error: paymentErrorData, isError: paymentError }] = useVerifyPaymentMutation()

    const handleCloseModal = useCallback(() => {
        setCoupon("")
        setSelectedPlanPrice("")
        setDiscountedPrice("")
        setOpenModal(false)
    }, [])

    const handleBillingChange = useCallback((plan: string, newCycle: "monthly" | "yearly") => {
        if (newCycle) {
            setBillingCycle((prev) => ({ ...prev, [plan]: newCycle }));
        }
    }, [])

    const handleApplyCoupon = useCallback((plan: string) => {
        if (coupon && plan === "Pro" || plan === "Family") {
            applyCoupon({ code: coupon, selectedPlan: plan, billingCycle: billingCycle[plan] })
        }
    }, [coupon, billingCycle, applyCoupon])

    const handlePay = useCallback(async (plan: string, billingCycle: string) => {
        setOpenModal(true)
        setSelectedPlan(plan);
        if (plan === "Free") {
            selectPlan({ selectedPlan: plan })
        } else {

            const response = await initiatePayment({ selectedPlan: plan, billingCycle, code: coupon }).unwrap()

            const options: any = {
                key: `${import.meta.env.VITE_RAZORPAY_API_KEY}`,
                amount: response.amount,
                currency: "INR",
                name: "Subscription",
                description: "Payment for plan subscription",
                order_id: response.orderId,
                handler: async function (paymentResponse: any) {
                    const verifyRes = await verifyPayment(paymentResponse).unwrap();

                    if (verifyRes.success) {
                        await selectPlan({ selectedPlan: plan, billingCycle })
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const razor = new (window as any).Razorpay(options);
            razor.open();

        }
    }, [coupon, selectPlan, initiatePayment, verifyPayment, user])

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const result = params.get('result');

        if (result) {
            try {
                const parsedResult = JSON.parse(decodeURIComponent(result));
                localStorage.setItem("user", JSON.stringify(parsedResult));
                window.history.replaceState(null, "", window.location.pathname);
                window.location.reload();
            } catch (error) {
                console.error("Error parsing result:", error);
            }
        }
    }, [])

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                navigate("/")
            }, 2000);
        }
    }, [isSuccess, navigate])

    useEffect(() => {
        if (isApplyCouponSuccess && couponData) {
            setDiscountedPrice(couponData.finalAmount.toString());
        }
    }, [isApplyCouponSuccess, couponData])

    return <>
        {paymentSuccess && <Toast type="success" message={paymentData.message} />}
        {paymentError && <Toast type="error" message={String(paymentErrorData)} />}
        {isApplyCouponSuccess && <Toast type="success" message={couponData.message} />}
        {isApplyCouponError && <Toast type="error" message={String(applyCouponError)} />}

        <Box sx={{ height: "100vh", px: { xs: 3, md: 4, lg: 12, xl: 28, } }} >
            <Grid2 container spacing={3} sx={{ minHeight: "100%", alignItems: "center", py: 8 }}>
                {data?.result.map((plan) => {
                    const discount = (+plan.price.monthly * 12) - +plan.price.yearly
                    return <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={plan._id} >
                        <Paper>
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    boxShadow: selectedPlan === plan.name ? "0px 4px 15px rgba(0, 0, 0, 0.2)" : "0px 2px 8px rgba(0, 0, 0, 0.1)",
                                    transition: "0.3s",
                                    textAlign: "center",
                                    p: 2,
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                                        {plan.title}
                                    </Typography>

                                    <ToggleButtonGroup
                                        value={billingCycle[plan.name]}
                                        exclusive
                                        onChange={(_, newCycle) => handleBillingChange(plan.name, newCycle)}
                                        sx={{ mb: 2 }}
                                        disabled={plan.name === "Free"}
                                    >
                                        <ToggleButton value="monthly"
                                            sx={{
                                                bgcolor: plan.name === "Free" ? "white" : "inherit",
                                                "&.Mui-disabled": {
                                                    bgcolor: "inherit",
                                                    color: "grey",
                                                    borderRight: "1px solid lightgrey"
                                                },
                                            }}>
                                            Monthly
                                        </ToggleButton>
                                        <ToggleButton value="yearly"
                                            sx={{
                                                bgcolor: plan.name === "Free" ? "white" : "inherit",
                                                "&.Mui-disabled": {
                                                    bgcolor: "inherit",
                                                    color: "grey",
                                                },
                                            }}>
                                            Yearly
                                        </ToggleButton>
                                    </ToggleButtonGroup>

                                    {
                                        billingCycle[plan.name] === "yearly"
                                            ? <Box sx={{ height: "40px" }}>
                                                <Badge badgeContent={`₹${discount}`}
                                                    sx={{
                                                        my: 1,
                                                        "& .MuiBadge-badge": {
                                                            backgroundColor: "#00c979",
                                                            color: "white",
                                                            borderRadius: "4px"
                                                        }
                                                    }}>
                                                    <Typography variant="h5" fontWeight="bold" sx={{ color: "black" }}>
                                                        ₹{plan.price[billingCycle[plan.name] || "monthly"]}
                                                    </Typography>
                                                </Badge>
                                            </Box>
                                            : <Typography variant="h5" fontWeight="bold" sx={{ color: "black", height: "40px" }}>
                                                ₹{plan.price[billingCycle[plan.name] || "monthly"]}
                                            </Typography>
                                    }

                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ textAlign: "left", px: 2 }}>
                                        {plan?.includes?.map((feature, index) => (
                                            <Typography key={index} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                                <CheckIcon color="secondary" sx={{ mr: 1 }} />
                                                {feature}
                                            </Typography>
                                        ))}
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        fullWidth
                                        onClick={() => { setOpenModal(true), setSelectedPlan(plan.name), setSelectedPlanPrice(plan.price[billingCycle[plan.name]]) }}
                                        sx={{ mt: 2 }}
                                    > Select Plan
                                    </Button>
                                </CardContent>
                            </Card>
                        </Paper>
                    </Grid2 >
                })}
                <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                    <DialogTitle>{selectedPlan === "Free" ? "Free Plan" : "Enter Coupon or Pay"}</DialogTitle>
                    <DialogContent>
                        {selectedPlan === "Free"
                            ? <Typography sx={{ mb: 2 }}>
                                Are you continue with free plan?
                            </Typography>
                            : <Typography sx={{ mb: 2 }}>
                                If you have a coupon, please enter it to get a discount. Otherwise, you can proceed without entering one.
                            </Typography>
                        }

                        {!discountedPrice && (
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Price: ₹{selectedPlanPrice}
                            </Typography>
                        )}

                        {discountedPrice && (
                            <Typography variant="h6" color="green" sx={{ mb: 1 }}>
                                Discounted Price: ₹{discountedPrice}
                            </Typography>
                        )}

                        {selectedPlan !== "Free" && <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value)}
                                placeholder="Enter coupon"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        "&:hover fieldset": {
                                            borderColor: "gray",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "black",
                                            borderWidth: "1px",
                                        },
                                    },
                                }}
                            />

                            <Button
                                onClick={() => handleApplyCoupon(selectedPlan)}
                                color="secondary"
                                variant="outlined"
                                sx={{ height: "40px" }}
                            >
                                Apply
                            </Button>
                        </Box>
                        }

                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleCloseModal} variant="contained" sx={{ backgroundColor: "#f3f3f3" }} color="inherit">Cancel</Button>
                        <Button
                            onClick={() => handlePay(selectedPlan as string, billingCycle[selectedPlan as string])}
                            variant="contained"
                            sx={{ backgroundColor: "#00c979", color: "white" }}
                        >
                            {selectedPlan === "Free" ? "Continue" : "Pay Now"}
                        </Button>
                    </DialogActions>
                </Dialog>


            </Grid2>

        </Box>
    </>
})

export default SelectPlan;
