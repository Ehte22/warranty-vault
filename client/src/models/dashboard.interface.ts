interface SubscriptionDetails {
    plan: string;
    subscription: {
        expiryDate: string;
        paymentStatus: string
    };
}

interface ExpiringPolicy {
    _id: number;
    count: number;
}

export interface ReferralStat {
    _id: {
        year: number;
        month: number;
    };
    count: number;
}

interface NotificationStat {
    _id: string
    count: number;
}

export interface IUserDashboardData {
    subscriptionDetails: SubscriptionDetails | null;
    productCount: number;
    policyCount: number;
    expiringPolicies: ExpiringPolicy[];
    referralStats: ReferralStat[];
    notificationStats: NotificationStat[];
}


interface IncomeStats {
    month: number;
    year: number;
    totalIncome: number;
    count: number;
}

interface StatusStats {
    _id: string;
    count: number;
}

interface ReferralStats {
    referrerId: string;
    referrerName: string;
    count: number;
}

interface ExpiryTrend {
    month: number;
    year: number;
    count: number;
}

export interface IAdminDashboardData {
    totalUsers: number;
    totalProducts: number;
    totalPolicies: number;
    totalBrands: number;
    incomeStats: IncomeStats[];
    statusStats: StatusStats[];
    referralStats: ReferralStats[];
    expiryTrend: ExpiryTrend[];
}


