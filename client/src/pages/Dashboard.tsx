import { useEffect, useState } from "react"
import { Grid2, Card, CardContent, Typography, Box } from "@mui/material"
import { Bar, Pie } from "react-chartjs-2"
import "chart.js/auto"
import { IUserDashboardData } from "../models/dashboard.interface"
import { useGetUserDashboardQuery } from "../redux/apis/dashboard.api"
import Loader from "../components/Loader"
import DataContainer, { DataContainerConfig } from "../components/DataContainer"

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState<IUserDashboardData | null>(null)
    const [selectedUser, setSelectedUser] = useState<string>("")

    const config: DataContainerConfig = {
        pageTitle: "Dashboard",
        showSelector: true,
        onSelect: setSelectedUser
    }

    const { data, isLoading } = useGetUserDashboardQuery({ selectedUser })

    useEffect(() => {
        if (data) {
            setDashboardData(data)
        }
    }, [data])

    const subscriptionDetails = dashboardData?.subscriptionDetails
    const productCount = dashboardData?.productCount
    const policyCount = dashboardData?.policyCount
    const expiringPolicies = dashboardData?.expiringPolicies
    const referralStats = dashboardData?.referralStats
    const notificationStats = dashboardData?.notificationStats

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const policyChartData = {
        labels: months,
        datasets: [
            {
                label: "Expiring Policies",
                data: months.map((_, index) => {
                    const monthData = expiringPolicies?.find(p => p._id === index + 1)
                    return monthData ? monthData.count : 0
                }),
                backgroundColor: "rgba(0, 201, 121, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    }


    const referralData = {
        labels: ["Referred Users"],
        datasets: [{ data: [referralStats?.[0]?.count || 0], backgroundColor: ["#d1d1d1"] }],
    }


    const notificationData = {
        labels: notificationStats?.map((n) => n._id),
        datasets: [{ data: notificationStats?.map((n) => n.count), backgroundColor: ["#00C979", "#d1d1d1"] }],
    }

    if (isLoading) {
        return <Loader />
    }

    return <>
        <Box>
            <DataContainer config={config} />
            <Grid2 container spacing={3} sx={{ mt: 3 }}>
                {/* Subscription Details */}
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Subscription Plan</Typography>
                            <Typography>{subscriptionDetails?.plan || "N/A"}</Typography>
                            <Typography color="textSecondary">
                                Expiry: {subscriptionDetails?.subscription?.expiryDate
                                    ? new Date(subscriptionDetails.subscription.expiryDate).toISOString().split("T")[0]
                                    : "N/A"}
                            </Typography>

                            <Typography color={subscriptionDetails?.subscription?.paymentStatus === "Active" ? "green" : "red"}>
                                {subscriptionDetails?.subscription?.paymentStatus}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid2>

                {/* Product Count */}
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Total Products</Typography>
                            <Typography variant="h4">{productCount}</Typography>
                        </CardContent>
                    </Card>
                </Grid2>

                {/* Policy Count */}
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Total Policies</Typography>
                            <Typography variant="h4">{policyCount}</Typography>
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Expiring Policies Per Month</Typography>
                            <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px" } }}>
                                <Bar
                                    data={policyChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: { beginAtZero: true }
                                        }
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid2>

                {/* Charts for Referral & Notifications */}
                <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Referral Stats</Typography>
                            <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px", display: "flex", justifyContent: "center" } }}>
                                <Pie data={referralData} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Notification Stats</Typography>
                            <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px", display: "flex", justifyContent: "center" } }}>
                                <Pie data={notificationData} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid2>
            </Grid2>
        </Box>
    </>
}

export default Dashboard
