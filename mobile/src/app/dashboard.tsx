import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, Dimensions, RefreshControl } from 'react-native';
import { Title, Paragraph, Text, Surface, ActivityIndicator } from 'react-native-paper';
import { IUserDashboardData } from '../models/dashboard.interface';
import { useCustomTheme } from '../context/ThemeContext';
import { useGetUserDashboardQuery } from '../redux/apis/dashboard.api';
import { CustomTheme } from '../theme/theme';
import { BarChart, PieChart } from "react-native-chart-kit"

const screenWidth = Dimensions.get("window").width

const Dashboard = () => {
    const { theme } = useCustomTheme();
    const [dashboardData, setDashboardData] = useState<IUserDashboardData | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const { data, isLoading, refetch } = useGetUserDashboardQuery({});

    const styles = customStyles(theme)

    useEffect(() => {
        if (data) {
            setDashboardData(data);
        }
    }, [data]);

    const handleRefresh = async () => {
        setRefreshing(true);

        setTimeout(async () => {
            await refetch();
            setRefreshing(false);
        }, 600);
    };

    const subscriptionDetails = dashboardData?.subscriptionDetails
    const productCount = dashboardData?.productCount
    const policyCount = dashboardData?.policyCount
    const expiringPolicies = dashboardData?.expiringPolicies
    const referralStats = dashboardData?.referralStats
    const notificationStats = dashboardData?.notificationStats

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (isLoading) {
        return <View style={{ backgroundColor: theme.colors.background, flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator animating={true} size={32} color={theme.colors.primary} />
        </View>
    }

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>

            <View style={styles.row}>
                {/* Subscription Details */}
                <Surface style={styles.surface}>
                    <Title style={{ fontWeight: "bold" }}>Subscription Plan</Title>
                    <Paragraph>{subscriptionDetails?.plan || "N/A"}</Paragraph>
                    <Paragraph>
                        Expiry: {subscriptionDetails?.subscription?.expiryDate
                            ? new Date(subscriptionDetails.subscription.expiryDate).toISOString().split("T")[0]
                            : "N/A"}
                    </Paragraph>
                    <Paragraph style={{
                        color: subscriptionDetails?.subscription?.paymentStatus === "Active"
                            ? theme.colors.primary
                            : theme.colors.error
                    }}>
                        {subscriptionDetails?.subscription?.paymentStatus}
                    </Paragraph>
                </Surface>

                {/* Product Count */}
                <Surface style={styles.surface}>
                    <Title style={{ fontWeight: "bold" }}>Total Products</Title>
                    <Text style={styles.bigNumber}>{productCount}</Text>
                </Surface>

                {/* Policy Count */}
                <Surface style={styles.surface}>
                    <Title style={{ fontWeight: "bold" }}>Total Policies</Title>
                    <Text style={styles.bigNumber}>{policyCount}</Text>
                </Surface>

                {/* Referral Count */}
                <Surface style={styles.surface}>
                    <Title style={{ fontWeight: "bold" }}>Total Referrals</Title>
                    <Text style={styles.bigNumber}>{referralStats?.[0]?.count || 0}</Text>
                </Surface>

                {/* Expiring Policies Per Month */}
                <Surface style={{ marginTop: 20, borderRadius: 4, backgroundColor: theme.colors.cardBg }}>
                    <Text style={styles.chartTitle}>
                        Expiring Policies Per Month
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <BarChart
                            data={{
                                labels: months,
                                datasets: [
                                    {
                                        data: months.map((_, index) => {
                                            const monthData = expiringPolicies?.find(p => p._id === index + 1);
                                            return monthData ? monthData.count : 0;
                                        }),
                                    },
                                ],
                            }}
                            width={screenWidth * 2}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundGradientFrom: theme.colors.cardBg,
                                backgroundGradientTo: theme.colors.cardBg,
                                decimalPlaces: 2,
                                color: (opacity = 1) => `rgba(0, 201, 121, ${opacity})`,
                                labelColor: () => "gray",
                                style: {
                                    borderRadius: 4,
                                },
                                propsForDots: {
                                    r: "6",
                                    strokeWidth: "2",
                                    stroke: "#ffa726"
                                }
                            }}
                            showBarTops={false}
                        />
                    </ScrollView>
                </Surface>

                <Surface style={{ marginTop: 20, borderRadius: 4, backgroundColor: theme.colors.cardBg, marginBottom: 40 }}>
                    <Text style={styles.chartTitle}>
                        Notification Status
                    </Text>
                    <PieChart
                        data={(notificationStats ?? []).map((n) => ({
                            name: n._id,
                            population: n.count,
                            color: n._id === "Sent" ? "#00C979" : "#d1d1d1",
                            legendFontColor: theme.colors.text,
                            legendFontSize: 15
                        }))}
                        width={screenWidth - 20}
                        height={220}
                        accessor="population"
                        chartConfig={{
                            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`, barPercentage: 0.5,
                        }}
                        absolute
                        backgroundColor={"transparent"}
                        paddingLeft='10'
                    />
                </Surface>
            </View>


        </ScrollView >
    );
};

const customStyles = (theme: CustomTheme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: theme.colors.background
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    surface: {
        backgroundColor: theme.colors.cardBg,
        color: theme.colors.text,
        borderRadius: 4,
        marginTop: 20,
        padding: 16,
        width: "100%"
    },
    card: {
        width: '32%',
        minWidth: 150,
        marginBottom: 10,
    },
    fullWidthCard: {
        width: '100%',
        marginBottom: 10,
    },
    halfWidthCard: {
        width: '48%',
        minWidth: 180,
        marginBottom: 10,
    },
    chartContainer: {
        height: 250,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bigNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 6
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginVertical: 10,
        marginLeft: 20
    }
});

export default Dashboard;