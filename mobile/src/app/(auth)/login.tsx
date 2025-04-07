import GoogleLoginButton from '@/src/components/GoogleLoginButton';
import { useCustomTheme } from '@/src/context/ThemeContext';
import { CustomTheme } from '@/src/theme/theme';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Divider } from 'react-native-paper';
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from 'expo-router';

const Login = () => {
    const [secureText, setSecureText] = useState(true);
    const { theme } = useCustomTheme();

    const toggleSecureText = () => setSecureText(!secureText);

    const schema = z.object({
        username: z.string().min(1, "Username is required"),
        password: z.string().min(1, "Password is required")
    })

    type FormValues = z.infer<typeof schema>

    const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { username: "", password: "" } })

    const onSubmit = (values: FormValues) => {
        console.log('Logging in with', values);
    };

    // const handleGoogleLogin = async () => {
    //     try {
    //         await GoogleSignin.hasPlayServices();
    //         const userInfo = await GoogleSignin.signIn();
    //         console.log('Google User Info:', userInfo);
    //     } catch (error) {
    //         console.error('Google Login Error:', error);
    //     }
    // };

    const styles = customStyle(theme)

    return (
        <View style={styles.container}>
            <Text variant="headlineMedium" style={styles.heading}>Sign In</Text>
            <Text variant="bodyMedium" style={styles.subText}>Welcome back! Please login to your account.</Text>

            <View style={{ marginBottom: 16 }}>
                <Controller
                    control={control}
                    name="username"
                    render={({ field: { onChange, onBlur, value } }) => {
                        return <TextInput
                            label="Username"
                            mode="outlined"
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={!!errors.username}
                            left={<TextInput.Icon icon="account-circle-outline" />}
                        />
                    }}
                />
                {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}
            </View>

            <View style={{ marginBottom: 16 }}>
                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => {
                        return <TextInput
                            label="Password"
                            mode="outlined"
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            secureTextEntry={secureText}
                            style={styles.input}
                            error={!!errors.password}
                            left={<TextInput.Icon icon="lock-outline" />}
                            right={
                                <TextInput.Icon
                                    icon={secureText ? 'eye-off' : 'eye'}
                                    onPress={toggleSecureText}
                                />
                            }
                        />
                    }}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
                <Text style={{ color: theme.colors.primary }}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={styles.loginBtn}
                contentStyle={{ paddingVertical: 4 }}
                labelStyle={{ fontSize: 16 }}
            >
                Sign In
            </Button>

            <Divider style={styles.divider} />
            <Text style={styles.orText}>OR</Text>

            <GoogleLoginButton />

            <View style={styles.signupContainer}>
                <Text style={{ color: theme.colors.text }}>Don't have an account?</Text>
                <TouchableOpacity>
                    <Link href="/(auth)/register" style={{ color: theme.colors.primary }}> Sign Up</Link>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Login;

const customStyle = (theme: CustomTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            padding: 24,
            backgroundColor: theme.colors.background
        },
        heading: {
            textAlign: 'center',
            marginBottom: 8,
            fontWeight: 'bold',
            color: theme.colors.text
        },
        subText: {
            textAlign: 'center',
            marginBottom: 24,
            color: theme.colors.text,
        },
        input: {
            marginBottom: 4,
            backgroundColor: theme.colors.inputBackground,
        },
        forgotPassword: {
            alignItems: 'flex-end',
            marginBottom: 20,
        },
        loginBtn: {
            borderRadius: 4,
            marginBottom: 20,
        },
        divider: {
            marginVertical: 16,
            color: theme.colors.text
        },
        orText: {
            textAlign: 'center',
            marginBottom: 16,
            color: theme.colors.text,
        },
        signupContainer: {
            marginTop: 30,
            color: theme.colors.text,
            flexDirection: 'row',
            justifyContent: 'center',
        },
        errorText: {
            color: theme.colors.errorText,
            marginBottom: 8,
            marginLeft: 4,
        },
    });
} 
