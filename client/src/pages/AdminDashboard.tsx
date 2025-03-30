import { useEffect, useState } from 'react'
import { useGetAdminDashboardQuery } from '../redux/apis/dashboard.api'
import { IAdminDashboardData } from '../models/dashboard.interface'
import { Box, Card, CardContent, Grid2, Typography } from '@mui/material'
import { Bar, Line, Pie } from 'react-chartjs-2'
import "chart.js/auto"

const AdminDashboard = () => {
    const [dashBoardData, setDashBoardData] = useState<IAdminDashboardData | null>(null)

    const { data } = useGetAdminDashboardQuery()

    useEffect(() => {
        if (data) {
            setDashBoardData(data)
        }
    }, [data])

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const totalProducts = dashBoardData?.totalProducts
    const totalPolicies = dashBoardData?.totalPolicies
    const totalBrands = dashBoardData?.totalBrands
    const totalUsers = dashBoardData?.totalUsers
    const monthlyData = dashBoardData?.incomeStats
    const expiryTrend = dashBoardData?.expiryTrend
    const referralStats = dashBoardData?.referralStats
    const userStatus = dashBoardData?.statusStats

    const monthlyIncomeData = {
        labels: months,
        datasets: [
            {
                label: "Income Per Month",
                data: months.map((_, index) => {
                    const monthData = monthlyData?.find(p => p.month === index + 1)
                    return monthData?.totalIncome
                }),
                backgroundColor: "rgba(0, 201, 121, 0.6)",
                borderColor: "rgba(0, 201, 121, 1)",
                borderWidth: 1,
            },
        ],
    }

    const monthlySubscription = {
        labels: months,
        datasets: [{
            data: months.map((_, index) => {
                const monthData = monthlyData?.find(p => p.month === index + 1)
                return monthData?.count
            }),
            backgroundColor: [
                "#4BC0C0", "#FF6384", "#36A2EB", "#FFCE56", "#9966FF",
                "#FF9F40", "#C9CBCF", "#8D99AE", "#6A0572", "#2EC4B6",
                "#FF6B6B", "#00A896"
            ]
        }],
    }

    const expiryTrendData = {
        labels: months,
        datasets: [
            {
                label: "Expiry Trends",
                data: months.map((_, index) => {
                    const monthData = expiryTrend?.find(p => p.month === index + 1)
                    return monthData?.count || 0
                }),
                backgroundColor: "rgba(0, 201, 121, 0.2)",
                borderColor: "rgba(0, 201, 121, 1)",
                borderWidth: 2,
                fill: false
            },
        ],
    }

    const referralStatsData = {
        labels: referralStats?.map(item => item.referrerName),
        datasets: [
            {
                label: "Referrals",
                data: referralStats?.map(item => item.count),
                backgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
                    "#FF9F40", "#FFCD56", "#C9CBCF", "#36A2EB", "#D9C3F3",
                    "#F36E6E", "#6EF3A6"
                ],
                borderColor: "#fff",
                borderWidth: 1
            }
        ]
    };

    const userStatusData = {
        labels: ["Active Users", "Inactive Users"],
        datasets: [
            {
                label: "User Status",
                data: [
                    userStatus?.find(stat => stat._id === "active")?.count || 0,
                    userStatus?.find(stat => stat._id === "inactive")?.count || 0
                ],
                backgroundColor: ["#00C979", "#d1d1d1"],
                borderColor: "#fff",
                borderWidth: 1
            }
        ]
    };




    return <>
        <Box>
            <Grid2 container spacing={3} sx={{ mt: 3 }}>

                {/* Total Users */}
                <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Total Users</Typography>
                            <Typography variant="h4">{totalUsers}</Typography>
                        </CardContent>
                    </Card>
                </Grid2>

                {/* Total Products */}
                <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Total Products</Typography>
                            <Typography variant="h4">{totalProducts}</Typography>
                        </CardContent>
                    </Card>
                </Grid2>

                {/* Total Policies */}
                <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Total Policies</Typography>
                            <Typography variant="h4">{totalPolicies}</Typography>
                        </CardContent>
                    </Card>
                </Grid2>

                {/* Total Brands */}
                <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Total Brands</Typography>
                            <Typography variant="h4">{totalBrands}</Typography>
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Income Per Month</Typography>
                            <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px" } }}>
                                <Bar
                                    data={monthlyIncomeData}
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

                <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Monthly Subscriptions</Typography>
                            <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px", display: "flex", justifyContent: "center" } }}>
                                <Pie data={monthlySubscription} options={{
                                    plugins: {
                                        legend: { display: false },
                                    }
                                }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Users Status</Typography>
                            <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px", display: "flex", justifyContent: "center" } }}>
                                <Pie data={userStatusData}
                                    options={{
                                        plugins: {
                                            legend: { display: false },
                                        }
                                    }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Referral Stats</Typography>
                            <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px" } }}>
                                <Pie
                                    data={referralStatsData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: { enabled: true }
                                        }
                                    }}
                                />

                            </Box>
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Expiry Trends</Typography>
                            <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px" } }}>
                                <Line
                                    data={expiryTrendData}
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


                {/*     <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Notification Stats</Typography>
                            <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px", display: "flex", justifyContent: "center" } }}>
                                <Pie data={notificationData} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid2> */}
            </Grid2>
        </Box>
    </>
}

export default AdminDashboard