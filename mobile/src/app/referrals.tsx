import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Card, Title, Text, Button, List, } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import Toast from '../components/Toast';
import { useCustomTheme } from '../context/ThemeContext';
import { useGetUserByIdQuery } from '../redux/apis/user.api';
// import * as Clipboard from 'expo-clipboard'

const Referrals = () => {
    const { theme } = useCustomTheme();
    const [userId, setUserId] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const { user } = useSelector((state: RootState) => state.auth);
    const { data } = useGetUserByIdQuery(userId, { skip: !userId });

    const handleCopy = async () => {
        if (user?.referralLink) {
            // await Clipboard.setStringAsync(user.referralLink);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    useEffect(() => {
        if (user && user._id) {
            setUserId(user._id);
        }
    }, [user]);

    return <>
        {isCopied && <Toast type="success" message="Referral Link Copied" />}
        <ScrollView style={{ padding: 16, backgroundColor: theme.colors.background }}>

            <Card style={{ backgroundColor: theme.colors.cardBg, borderRadius: 4, marginVertical: 20 }}>
                <Card.Content>
                    <Title style={{ marginBottom: 16, color: theme.colors.text }}>Your Referral Link</Title>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <ScrollView
                            horizontal showsHorizontalScrollIndicator={false}
                            style={{
                                flex: 1,
                                marginRight: 8,
                                backgroundColor: theme.colors.cardBg,
                                borderRadius: 4,
                                borderWidth: 1,
                                borderColor: theme.colors.outline,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                            }}
                        >
                            <Text style={{ fontSize: 16, color: theme.colors.text, marginRight: 28, backgroundColor: theme.colors.cardBg }} selectable>
                                {user?.referralLink || ""}
                            </Text>
                        </ScrollView>
                        <Button
                            mode="contained"
                            onPress={handleCopy}
                            icon="content-copy"
                            style={{ backgroundColor: '#00c979', borderRadius: 4 }}
                        >
                            Copy
                        </Button>
                    </View>

                    <View style={{
                        padding: 16,
                        backgroundColor: theme.dark ? theme.colors.cardBg : '#f9f9f9',
                        borderRadius: 8,
                        borderWidth: theme.dark ? 1 : 0,
                        borderColor: theme.colors.primary
                    }}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 8, color: theme.colors.text }}>
                            Earn Rewards with Referrals!
                        </Text>
                        <Text style={{ marginBottom: 4, color: theme.colors.text }}>
                            You earn <Text style={{ fontWeight: 'bold' }}>100 points</Text> for each successful referral.
                        </Text>
                        <Text style={{ marginBottom: 4, color: theme.colors.text }}>
                            Your friend gets <Text style={{ fontWeight: 'bold' }}>50 points</Text> when they sign up.
                        </Text>
                        <Text style={{ color: theme.colors.text }}>
                            Coins can only be <Text style={{ fontWeight: 'bold' }}>redeemed when purchasing a paid plan</Text>.
                        </Text>
                    </View>
                </Card.Content>
            </Card>

            <Card style={{ backgroundColor: theme.colors.cardBg, borderRadius: 4 }}>
                <Card.Content>
                    <Title style={{ marginBottom: 16, color: theme.colors.text }}>Your Referrals</Title>

                    {data?.referrals && data.referrals?.length > 0 ? (
                        <>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                padding: 12,
                                backgroundColor: theme.colors.cardBg
                            }}>
                                <Text style={{ width: '70%', fontWeight: 'bold', color: theme.colors.text }}>Name</Text>
                                <Text style={{ width: '30%', fontWeight: 'bold', textAlign: 'center', color: theme.colors.text }}>Points</Text>
                            </View>

                            <List.Section>
                                {data.referrals.map((referral, index) => (
                                    <React.Fragment key={referral._id}>
                                        <List.Item
                                            title={referral.name}
                                            right={() => (
                                                <Text style={{
                                                    width: '30%',
                                                    textAlign: 'center',
                                                    alignSelf: 'center',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {100}
                                                </Text>
                                            )}
                                            style={{
                                                backgroundColor: index % 2 === 0 ? '#fafafa' : theme.colors.surface,
                                                paddingVertical: 12
                                            }}
                                        />
                                    </React.Fragment>
                                ))}
                            </List.Section>
                        </>
                    ) : (
                        <Text style={{ textAlign: 'center', padding: 16, color: theme.colors.text }}>No Referrals Yet.</Text>
                    )}
                </Card.Content>
            </Card>
        </ScrollView>
    </>
};

export default Referrals;