import React, { useMemo } from 'react';
import { useGetAdminDashboardQuery } from '../redux/apis/dashboard.api';
import { Box, Card, CardContent, Grid2, Typography } from '@mui/material';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { ChartData } from 'chart.js';
import "chart.js/auto";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const chartColors = {
    green: "rgba(0, 201, 121, 0.6)",
    greenBorder: "rgba(0, 201, 121, 1)",
    greenLight: "rgba(0, 201, 121, 0.2)",
    pieColors: [
        "#4BC0C0", "#FF6384", "#36A2EB", "#FFCE56", "#9966FF",
        "#FF9F40", "#C9CBCF", "#8D99AE", "#6A0572", "#2EC4B6",
        "#FF6B6B", "#00A896"
    ],
    referralColors: [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
        "#FF9F40", "#FFCD56", "#C9CBCF", "#36A2EB", "#D9C3F3",
        "#F36E6E", "#6EF3A6"
    ],
    statusColors: ["#00C979", "#d1d1d1"]
};

type DashboardChartData = {
    monthlyIncome: ChartData<'bar', number[], string>;
    monthlySubscription: ChartData<'pie', number[], string>;
    expiryTrend: ChartData<'line', number[], string>;
    referralStats: ChartData<'pie', number[], string>;
    userStatus: ChartData<'pie', number[], string>;
};

const StatCard = ({ title, value }: { title: string; value?: number }) => (
    <Card>
        <CardContent>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="h4">{value ?? 0}</Typography>
        </CardContent>
    </Card>
);

const ChartContainer = ({ children }: { children: React.ReactNode }) => (
    <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px" } }}>
        {children}
    </Box>
);

const AdminDashboard = React.memo(() => {
    const { data: dashBoardData, isError } = useGetAdminDashboardQuery();

    const defaultChartData: DashboardChartData = {
        monthlyIncome: {
            labels: months,
            datasets: [{
                label: 'Loading...',
                data: Array(12).fill(0),
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                borderColor: "rgba(0, 0, 0, 0.3)",
                borderWidth: 1,
            }]
        },
        monthlySubscription: {
            labels: months,
            datasets: [{
                data: Array(12).fill(0),
                backgroundColor: chartColors.pieColors
            }]
        },
        expiryTrend: {
            labels: months,
            datasets: [{
                label: "Loading...",
                data: Array(12).fill(0),
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                borderColor: "rgba(0, 0, 0, 0.3)",
                borderWidth: 2,
                fill: false
            }]
        },
        referralStats: {
            labels: ['Loading...'],
            datasets: [{
                label: "Referrals",
                data: [1],
                backgroundColor: ["#C9CBCF"],
                borderColor: "#fff",
                borderWidth: 1
            }]
        },
        userStatus: {
            labels: ["Loading..."],
            datasets: [{
                label: "User Status",
                data: [1],
                backgroundColor: ["#C9CBCF"],
                borderColor: "#fff",
                borderWidth: 1
            }]
        }
    };

    const chartData = useMemo<DashboardChartData>(() => {
        if (!dashBoardData) return defaultChartData;

        return {
            monthlyIncome: {
                labels: months,
                datasets: [{
                    label: "Income Per Month",
                    data: months.map((_, index) =>
                        dashBoardData.incomeStats?.find(p => p.month === index + 1)?.totalIncome ?? 0
                    ),
                    backgroundColor: chartColors.green,
                    borderColor: chartColors.greenBorder,
                    borderWidth: 1,
                }]
            },
            monthlySubscription: {
                labels: months,
                datasets: [{
                    data: months.map((_, index) =>
                        dashBoardData.incomeStats?.find(p => p.month === index + 1)?.count ?? 0
                    ),
                    backgroundColor: chartColors.pieColors
                }]
            },
            expiryTrend: {
                labels: months,
                datasets: [{
                    label: "Expiry Trends",
                    data: months.map((_, index) =>
                        dashBoardData.expiryTrend?.find(p => p.month === index + 1)?.count ?? 0
                    ),
                    backgroundColor: chartColors.greenLight,
                    borderColor: chartColors.greenBorder,
                    borderWidth: 2,
                    fill: false
                }]
            },
            referralStats: {
                labels: dashBoardData.referralStats?.map(item => item.referrerName) || ['No data'],
                datasets: [{
                    label: "Referrals",
                    data: dashBoardData.referralStats?.map(item => item.count) || [0],
                    backgroundColor: chartColors.referralColors,
                    borderColor: "#fff",
                    borderWidth: 1
                }]
            },
            userStatus: {
                labels: ["Active Users", "Inactive Users"],
                datasets: [{
                    label: "User Status",
                    data: [
                        dashBoardData.statusStats?.find(stat => stat._id === "active")?.count ?? 0,
                        dashBoardData.statusStats?.find(stat => stat._id === "inactive")?.count ?? 0
                    ],
                    backgroundColor: chartColors.statusColors,
                    borderColor: "#fff",
                    borderWidth: 1
                }]
            }
        };
    }, [dashBoardData]);

    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
    };

    if (isError) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                    Error loading dashboard data
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 3 }}>
            <Grid2 container spacing={3}>
                {/* Stat Cards */}
                <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <StatCard title="Total Users" value={dashBoardData?.totalUsers} />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <StatCard title="Total Products" value={dashBoardData?.totalProducts} />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <StatCard title="Total Policies" value={dashBoardData?.totalPolicies} />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <StatCard title="Total Brands" value={dashBoardData?.totalBrands} />
                </Grid2>

                {/* Charts */}
                <Grid2 size={{ xs: 12 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Income Per Month</Typography>
                            <ChartContainer>
                                <Bar data={chartData.monthlyIncome} options={commonChartOptions} />
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Monthly Subscriptions</Typography>
                            <ChartContainer>
                                <Pie data={chartData.monthlySubscription} options={pieChartOptions} />
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Users Status</Typography>
                            <ChartContainer>
                                <Pie data={chartData.userStatus} options={pieChartOptions} />
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Referral Stats</Typography>
                            <ChartContainer>
                                <Pie data={chartData.referralStats} options={pieChartOptions} />
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Expiry Trends</Typography>
                            <ChartContainer>
                                <Line data={chartData.expiryTrend} options={commonChartOptions} />
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </Grid2>
            </Grid2>
        </Box>
    );
})

export default AdminDashboard;