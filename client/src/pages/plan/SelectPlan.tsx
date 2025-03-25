import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Button, Box, Divider, ToggleButtonGroup, ToggleButton, Paper, Badge, Grid2 } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useGetPlansQuery, useSelectPlanMutation } from "../../redux/apis/plan.api";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";
import { useInitiatePaymentMutation, useVerifyPaymentMutation } from "../../redux/apis/payment.api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const SelectPlan = () => {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<{ [key: string]: "monthly" | "yearly" }>({
        Free: "monthly",
        Pro: "monthly",
        Family: "monthly",
    });

    const navigate = useNavigate()
    const { user } = useSelector((state: RootState) => state.auth)

    const { data } = useGetPlansQuery({ isFetchAll: true })
    const [selectPlan, { isSuccess }] = useSelectPlanMutation()
    const [initiatePayment] = useInitiatePaymentMutation()
    const [verifyPayment, { data: paymentData, isSuccess: paymentSuccess, error: paymentErrorData, isError: paymentError }] = useVerifyPaymentMutation()

    const handleSelect = async (plan: string, billingCycle: string) => {
        setSelectedPlan(plan);
        // const selectedPlan = `${plan} ${billingCycle.charAt(0).toUpperCase()}${billingCycle.slice(1)}`

        if (plan === "Free") {
            selectPlan({ selectedPlan: plan })
        } else {

            const response = await initiatePayment({ selectedPlan: plan, billingCycle }).unwrap()

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
    };

    const handleBillingChange = (plan: string, newCycle: "monthly" | "yearly") => {
        if (newCycle) {
            setBillingCycle((prev) => ({ ...prev, [plan]: newCycle }));
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const result = params.get('result');

        if (result) {
            try {
                const parsedResult = JSON.parse(decodeURIComponent(result));
                // Store the user info in localStorage
                localStorage.setItem("user", JSON.stringify(parsedResult));

                // Remove the result query param from the URL to prevent infinite reload
                window.history.replaceState(null, "", window.location.pathname);

                // Reload the page to apply changes
                window.location.reload();
            } catch (error) {
                console.error("Error parsing result:", error);
            }
        }
    }, []); // This will run only once when the component mounts

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                navigate("/")
            }, 2000);
        }
    }, [isSuccess, navigate])

    return <>
        {paymentSuccess && <Toast type="success" message={paymentData.message} />}
        {paymentError && <Toast type="error" message={paymentErrorData as string} />}
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
                                        variant={selectedPlan === plan.name ? "contained" : "outlined"}
                                        color="secondary"
                                        fullWidth
                                        onClick={() => handleSelect(plan.name, billingCycle[plan.name])}
                                        sx={{ mt: 2, color: selectedPlan === plan.name ? "white" : "" }}
                                    >
                                        {selectedPlan === plan.name ? "Selected" : "Choose Plan"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Paper>
                    </Grid2 >
                })}
            </Grid2>
        </Box >
    </>
};

export default SelectPlan;
