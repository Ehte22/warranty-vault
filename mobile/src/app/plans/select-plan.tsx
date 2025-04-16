import { View, StyleSheet, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useCustomTheme } from '@/src/context/ThemeContext'
import { CustomTheme } from '@/src/theme/theme'
import { useGetPlansQuery, useSelectPlanMutation } from '@/src/redux/apis/plan.api'
import { Badge, Button, Card, Divider, Modal, Portal, Text, TextInput, ToggleButton } from 'react-native-paper'
import Icon from "react-native-vector-icons/MaterialIcons"
import { useApplyCouponMutation } from '@/src/redux/apis/coupon.api'
import { useInitiatePaymentMutation, useVerifyPaymentMutation } from '@/src/redux/apis/payment.api'
import { useRouter } from 'expo-router'
import Toast from '@/src/components/Toast'
import { useSelector } from 'react-redux'
import { RootState } from '@/src/redux/store'
import RazorpayCheckout from 'react-native-razorpay';
import { razorpayKey } from '@/src/constants/razorpayConfig'

const SelectPlan = () => {
    const [selectedPlan, setSelectedPlan] = useState<string>("");
    const [selectedPlanPrice, setSelectedPlanPrice] = useState<string>("");
    const [billingCycle, setBillingCycle] = useState<{ [key: string]: "monthly" | "yearly" }>({
        Free: "monthly",
        Pro: "monthly",
        Family: "monthly",
    });
    const [openModal, setOpenModal] = useState(false);
    const [coupon, setCoupon] = useState("");
    const [discountedPrice, setDiscountedPrice] = useState("");

    const { user } = useSelector((state: RootState) => state.auth)

    const router = useRouter()

    const { theme } = useCustomTheme()
    const styles = customStyles(theme)

    const { data, isLoading } = useGetPlansQuery({ isFetchAll: true })

    const [selectPlan, { isSuccess }] = useSelectPlanMutation()
    const [applyCoupon, { data: couponData, isSuccess: isApplyCouponSuccess, isError: isApplyCouponError, error: applyCouponError }] = useApplyCouponMutation()
    const [initiatePayment] = useInitiatePaymentMutation()
    const [verifyPayment, { data: paymentData, isSuccess: paymentSuccess, error: paymentErrorData, isError: paymentError }] = useVerifyPaymentMutation()

    const handleCloseModal = () => {
        setCoupon("")
        setSelectedPlanPrice("")
        setDiscountedPrice("")
        setOpenModal(false)
    };

    const handleSelect = (plan: string, price: { monthly: string; yearly: string; }) => {
        setOpenModal(true)
        setSelectedPlan(plan)
        setSelectedPlanPrice(price[billingCycle[plan]])
    }

    const handlePay = async (plan: string, billingCycle: string) => {
        setOpenModal(true)
        setSelectedPlan(plan);
        if (plan === "Free") {
            selectPlan({ selectedPlan: plan })
        } else {

            const response = await initiatePayment({ selectedPlan: plan, billingCycle, code: coupon }).unwrap()

            const options: any = {
                key: razorpayKey,
                amount: response.amount,
                currency: "INR",
                name: "Subscription",
                description: "Payment for plan subscription",
                order_id: response.orderId,
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone
                },
                theme: {
                    color: "#3399cc"
                }
            };

            RazorpayCheckout.open(options)
                .then(async (paymentResponse: any) => {
                    const verifyRes = await verifyPayment(paymentResponse).unwrap();

                    if (verifyRes.success) {
                        await selectPlan({ selectedPlan: plan, billingCycle });
                    }

                })

        }
    };

    const handleBillingChange = (plan: string, newCycle: "monthly" | "yearly") => {
        if (newCycle) {
            setBillingCycle((prev) => ({ ...prev, [plan]: newCycle }));
        }
    };

    const handleApplyCoupon = (plan: string) => {
        if (coupon && plan === "Pro" || plan === "Family") {
            applyCoupon({ code: coupon, selectedPlan: plan, billingCycle: billingCycle[plan] })
        }
    }

    useEffect(() => {
        if (isSuccess) {
            setOpenModal(false)
            setTimeout(() => {
                router.replace("/")
            }, 2000);
        }
    }, [isSuccess, router])

    useEffect(() => {
        if (isApplyCouponSuccess) {
            setDiscountedPrice(couponData.finalAmount.toString())
        }
    }, [couponData])


    if (isLoading) {
        return <Text>Loading...</Text>
    }

    return <>
        {paymentSuccess && <Toast type="success" message={paymentData.message} />}
        {paymentError && <Toast type="error" message={paymentErrorData as string} />}

        {isApplyCouponSuccess && <Toast type="success" message={couponData.message} />}
        {isApplyCouponError && <Toast type="error" message={applyCouponError as string} />}

        <FlatList
            data={data?.result}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: plan, index }) => {
                const discount = (+plan.price.monthly * 12) - +plan.price.yearly
                return <Card key={index} style={styles.card} >
                    <Card.Content style={{ alignItems: "center" }}>
                        <Text variant='titleLarge' style={styles.cardTitle}>{plan.title}</Text>

                        <ToggleButton.Row
                            onValueChange={(newCycle) => {
                                if (newCycle !== null) {
                                    handleBillingChange(plan.name, newCycle as "monthly" | "yearly")
                                    setBillingCycle({
                                        ...billingCycle, [plan.name]: newCycle as "monthly" | "yearly"
                                    })
                                }
                            }}
                            value={billingCycle[plan.name]} style={{ marginTop: 12 }}
                        >
                            <ToggleButton
                                style={[styles.toggleBtn, plan.name === "Free" ? { backgroundColor: theme.colors.cardBg } : null]}
                                value='monthly'
                                icon={() => <Text style={{ color: plan.name === "Free" ? "gray" : billingCycle[plan.name] === "monthly" ? "black" : "gray" }}>MONTHLY</Text>}
                                disabled={plan.name === "Free"}
                            />
                            <ToggleButton
                                style={[styles.toggleBtn, plan.name === "Free" ? { backgroundColor: theme.colors.cardBg, } : null]}
                                value="yearly"
                                icon={() => <Text style={{ color: plan.name !== "Free" ? billingCycle[plan.name] === "yearly" ? "black" : "gray" : "gray" }}>YEARLY</Text>}
                                disabled={plan.name === "Free"}
                            />
                        </ToggleButton.Row>

                        {billingCycle[plan.name] === "yearly" && discount > 0 ? (
                            <View style={styles.priceContainer}>
                                <Badge style={styles.discountBadge}>{`₹${discount} OFF`}</Badge>
                                <Text variant="headlineSmall" style={styles.price}>₹{plan.price.yearly}</Text>
                            </View>
                        ) : (
                            <Text variant='headlineSmall' style={styles.price}>₹{plan.price[billingCycle[plan.name]]}</Text>
                        )}

                        <Divider style={styles.divider} />

                        <View style={styles.featureView}>
                            <FlatList
                                data={plan?.includes}
                                keyExtractor={(_, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <View style={styles.featureItem}>
                                        <Icon name="check" size={24} color={theme.colors.primary} />
                                        <Text style={{ marginLeft: 8, fontSize: 16, color: theme.colors.text }}>{item}</Text>
                                    </View>
                                )}
                            />
                        </View>

                        <Divider style={styles.divider} />

                        <Button mode='outlined' style={styles.btn} onPress={() => handleSelect(plan.name, plan.price)} >
                            SELECT PLAN
                        </Button>

                    </Card.Content>
                </Card>
            }}
        />
        {/* <Divider /> */}

        <Portal>
            <Modal visible={openModal} onDismiss={handleCloseModal} contentContainerStyle={styles.modal}>
                <Text style={styles.modalTitle}>
                    {selectedPlan === "Free" ? "Free Plan" : "Enter Coupon or Pay"}
                </Text>

                {selectedPlan === "Free"
                    ? <Text style={{ marginBottom: 12 }}>
                        Are you continue with free plan?
                    </Text>
                    : <Text style={{ marginBottom: 12 }}>
                        If you have a coupon, please enter it to get a discount. Otherwise, you can proceed without entering one.
                    </Text>
                }

                {!discountedPrice && (
                    <Text style={{ marginBottom: 8, fontSize: 18, fontWeight: "bold" }}>
                        Price: ₹{selectedPlanPrice}
                    </Text>
                )}

                {discountedPrice && (
                    <Text style={{ marginBottom: 8, color: "green", fontSize: 18, fontWeight: "bold" }}>
                        Discounted Price: ₹{discountedPrice}
                    </Text>
                )}

                {selectedPlan !== "Free" && <View style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                    <TextInput
                        mode="outlined"
                        value={coupon}
                        onChangeText={setCoupon}
                        placeholder="Enter coupon"
                        style={{ height: 40, flex: 1, backgroundColor: theme.colors.inputBackground }}
                    />

                    <Button
                        onPress={() => handleApplyCoupon(selectedPlan)}
                        mode="outlined"
                        style={{ height: 40, borderRadius: 4, borderColor: theme.colors.primary, marginLeft: 8 }}
                    >
                        APPLY
                    </Button>
                </View>
                }


                <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", gap: 4, marginTop: 24 }}>
                    <Button onPress={handleCloseModal} mode="contained" style={{ backgroundColor: "lightgrey", borderRadius: 4 }} >
                        Cancel
                    </Button>

                    <Button
                        onPress={() => handlePay(selectedPlan as string, billingCycle[selectedPlan as string])}
                        mode="contained"
                        style={{ backgroundColor: theme.colors.primary, borderRadius: 4 }}
                    >
                        {selectedPlan === "Free" ? "Continue" : "Pay Now"}
                    </Button>
                </View>

            </Modal>
        </Portal>

    </>
}

export default SelectPlan

const customStyles = (theme: CustomTheme) => {
    return StyleSheet.create({
        container: {
            paddingTop: 40,
            paddingBottom: 20,
            paddingHorizontal: 24,
            backgroundColor: theme.colors.background

        },
        card: {
            backgroundColor: theme.colors.cardBg,
            borderRadius: 4,
            paddingVertical: 10,
            marginBottom: 24
        },
        cardTitle: {
            color: theme.colors.text,
            fontWeight: "bold"
        },
        toggleBtn: {
            width: 92
        },
        price: {
            marginTop: 12,
            fontWeight: "bold",
            height: 40,
            color: theme.colors.text
        },
        divider: {
            marginVertical: 16,
            color: theme.colors.text
        },
        featureView: {
            alignSelf: "flex-start",
            paddingHorizontal: 40
        },
        featureItem: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 6
        },
        btn: {
            width: "100%",
            borderRadius: 4,
            borderColor: theme.colors.primary
        },
        priceContainer: {
            marginTop: 12,
            position: 'relative',
            height: 40,
            justifyContent: 'center',
        },
        discountBadge: {
            position: 'absolute',
            left: 40,
            top: -2,
            backgroundColor: theme.colors.primary,
            borderRadius: 4,
            color: 'white',
            zIndex: 1,
            paddingHorizontal: 5
        },
        modal: {
            backgroundColor: theme.colors.cardBg,
            padding: 20,
            marginHorizontal: 24,
            borderRadius: 4,
        },
        text: {
            fontSize: 18,
        },
        modalTitle: {
            fontSize: 18,
            color: theme.colors.text,
            fontWeight: "bold",
            marginBottom: 4
        }
    })
}

