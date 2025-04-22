import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { CustomTheme } from '../theme/theme';
import { useCustomTheme } from '../context/ThemeContext';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useSignOutMutation } from '../redux/apis/auth.api';
import { useRouter } from 'expo-router';
import Toast from '../components/Toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const { user } = useSelector((state: RootState) => state.auth)

    const router = useRouter()

    const [signOut, { data, error, isLoading, isSuccess, isError }] = useSignOutMutation()

    const handleSignOut = () => {
        if (user) {
            signOut()
        }
    }

    const { theme, toggleTheme } = useCustomTheme()
    const styles = customStyles(theme)


    useEffect(() => {
        if (isSuccess) {
            setTimeout(async () => {
                await AsyncStorage.removeItem('hasAuthenticated')
                router.replace("/auth/login")
            }, 2000);
        }
    }, [isSuccess, router])

    return <>
        {isSuccess && <Toast type="success" message={data} />}
        {isError && <Toast type="error" message={error as string} />}
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity
                    style={styles.upgradeItem}
                    onPress={() => router.push("/plans/upgrade-plan")}
                >
                    <Icon2 name="crown" size={24} color="#FFC107" />
                    <View style={styles.upgradeTextContainer}>
                        <Text style={styles.upgradeTitle}>Upgrade Plan</Text>
                        <Text style={styles.upgradeSubtitle}>Get premium features and more</Text>
                    </View>
                    <Icon name="chevron-right" size={24} color="#1976D2" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => router.push("/referrals")}
                >
                    <View style={styles.iconContainer}>
                        <Icon2 name="account-group" size={24} style={styles.icon} />
                        <Text style={styles.settingText}>Referral Program</Text>
                    </View>
                    <Icon name="chevron-right" size={24} style={styles.icon} />
                </TouchableOpacity>

                <Text style={styles.sectionHeader}>Appearance</Text>

                <View style={styles.settingItem}>
                    <View style={styles.iconContainer}>
                        <Icon name="brightness-4" size={24} style={styles.icon} />
                        <Text style={styles.settingText}>Dark Mode</Text>
                    </View>
                    <Switch
                        trackColor={{ false: "#A4A4A4" }}
                        thumbColor={theme.dark ? theme.colors.primary : "#f4f3f4"}
                        onValueChange={toggleTheme}
                        value={theme.dark}
                    />
                </View>

                <Text style={styles.sectionHeader}>Notifications</Text>

                <View style={styles.settingItem}>
                    <View style={styles.iconContainer}>
                        <Icon name="notifications" size={24} style={styles.icon} />
                        <Text style={styles.settingText}>Enable Notifications</Text>
                    </View>
                    <Switch
                        trackColor={{ false: "#A4A4A4" }}
                        thumbColor={notificationsEnabled ? theme.colors.primary : "#f4f3f4"}
                        onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
                        value={notificationsEnabled}
                    />
                </View>

                <Text style={styles.sectionHeader}>Preferences</Text>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => console.log('Change currency pressed')}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="attach-money" size={24} style={styles.icon} />
                        <Text style={styles.settingText}>Currency</Text>
                    </View>
                    <View style={styles.iconContainer}>
                        <Text style={[styles.settingText, { marginRight: 5 }]}>USD</Text>
                        <Icon name="chevron-right" size={24} style={styles.icon} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => console.log('Language pressed')}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="language" size={24} style={styles.icon} />
                        <Text style={styles.settingText}>Language</Text>
                    </View>
                    <View style={styles.iconContainer}>
                        <Text style={[styles.settingText, { marginRight: 5 }]}>English</Text>
                        <Icon name="chevron-right" size={24} style={styles.icon} />
                    </View>
                </TouchableOpacity>

                <Text style={styles.sectionHeader}>About</Text>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => console.log('Help pressed')}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="help-outline" size={24} style={styles.icon} />
                        <Text style={styles.settingText}>Help & Support</Text>
                    </View>
                    <Icon name="chevron-right" size={24} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => console.log('About pressed')}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="info-outline" size={24} style={styles.icon} />
                        <Text style={styles.settingText}>About Warrant Wallet</Text>
                    </View>
                    <Icon name="chevron-right" size={24} style={styles.icon} />
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.logoutContainer}>
                <TouchableOpacity
                    disabled={isLoading}
                    style={styles.logoutButton}
                    onPress={handleSignOut}
                >
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    </>
};

export default Settings;

const customStyles = (theme: CustomTheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginTop: 20,
        marginBottom: 10,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.text,
    },
    settingText: {
        fontSize: 16,
        color: theme.colors.text,
    },
    logoutContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.text,
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        padding: 15,
        borderRadius: 4,
        alignItems: 'center',
    },
    logoutText: {
        color: theme.colors.btnText,
        fontSize: 16,
        fontWeight: '600',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 10,
        color: theme.colors.text,
    },
    upgradeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#E3F2FD',
        marginBottom: 12,
    },
    upgradeTextContainer: {
        flex: 1,
        marginLeft: 10,
    },
    upgradeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1976D2',
    },
    upgradeSubtitle: {
        fontSize: 14,
        color: '#1976D2',
        opacity: 0.8,
    },
}); 
