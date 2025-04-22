import React from 'react';
import Onboarding from 'react-native-onboarding-swiper';
import { Image, StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCustomTheme } from '../context/ThemeContext';
import { CustomTheme } from '../theme/theme';

const Onboardings = () => {
    const router = useRouter();
    const { theme } = useCustomTheme()

    const styles = customStyles(theme)

    const handleComplete = async () => {
        await AsyncStorage.setItem('onboardingCompleted', 'true');
        router.replace('/auth/login');
    }

    const DotComponent = ({ selected }: any) => {
        return (
            <View
                style={[
                    styles.dot,
                    {
                        backgroundColor: selected ? theme.colors.primary : '#d3d3d3',
                        width: selected ? 20 : 8,
                    },
                ]}
            />
        );
    };

    return (
        <View style={styles.container}>
            <Onboarding
                onSkip={handleComplete}
                onDone={handleComplete}
                bottomBarHighlight={false}
                DotComponent={DotComponent}
                titleStyles={styles.title}
                subTitleStyles={styles.subtitle}
                nextLabel="→"
                skipLabel="Skip"
                doneLabel="Get Started"
                pages={[
                    {
                        backgroundColor: theme.colors.background,
                        image: (
                            <View style={styles.imageContainer}>
                                <View style={[styles.circle, styles.circleBlue]}>
                                    <Image
                                        source={require('../../assets/images/splash-icon.png')}
                                        style={styles.image}
                                    />
                                </View>
                                <Text style={styles.pageNumber}>1/3</Text>
                            </View>
                        ),
                        title: 'All Warranties in One Place',
                        subtitle: 'Store bills and warranty cards safely in your pocket.',
                    },
                    {
                        backgroundColor: theme.colors.background,
                        image: (
                            <View style={styles.imageContainer}>
                                <View style={[styles.circle, styles.circleGreen]}>
                                    <Image
                                        source={require('../../assets/images/splash-icon.png')}
                                        style={styles.image}
                                    />
                                </View>
                                <Text style={styles.pageNumber}>2/3</Text>
                            </View>
                        ),
                        title: 'Never Miss an Expiry Date',
                        subtitle: 'Get reminders before your warranties expire.',
                    },
                    {
                        backgroundColor: theme.colors.background,
                        image: (
                            <View style={styles.imageContainer}>
                                <View style={[styles.circle, styles.circlePurple]}>
                                    <Image
                                        source={require('../../assets/images/splash-icon.png')}
                                        style={styles.image}
                                    />
                                </View>
                                <Text style={styles.pageNumber}>3/3</Text>
                            </View>
                        ),
                        title: 'Snap, Save, Relax',
                        subtitle: 'Upload receipts or product photos instantly.',
                    },
                ]}
            />
        </View>
    );
};

const customStyles = (theme: CustomTheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    circle: {
        width: 280,
        height: 280,
        borderRadius: 140,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    circleBlue: {
        backgroundColor: '#bbdefb', // Light blue
    },
    circleGreen: {
        backgroundColor: '#c8e6c9', // Light green
    },
    circlePurple: {
        backgroundColor: '#e1bee7', // Light purple
    },
    image: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 15,
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.text,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 22,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 3,
    },
    pageNumber: {
        fontSize: 14,
        color: theme.colors.text,
        fontWeight: '500',
        marginTop: 10,
    },
});

export default Onboardings;