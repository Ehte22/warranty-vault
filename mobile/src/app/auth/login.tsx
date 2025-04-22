import GoogleLoginButton from '@/src/components/GoogleLoginButton';
import { useCustomTheme } from '@/src/context/ThemeContext';
import { CustomTheme } from '@/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Divider, ActivityIndicator, HelperText } from 'react-native-paper';
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useRouter } from 'expo-router';
import { useSignInMutation, useSignInWithGoogleMutation } from '@/src/redux/apis/auth.api';
import Toast from '@/src/components/Toast';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { useDispatch } from 'react-redux';
import { setUser } from '@/src/redux/slices/auth.slice';
import { iosApiClientId, webApiClientId } from '@/src/constants/config';

const Login = () => {
    const [secureText, setSecureText] = useState(true);

    useEffect(() => {
        GoogleSignin.configure({
            iosClientId: iosApiClientId,
            webClientId: webApiClientId,
            profileImageSize: 150
        })
    }, [])

    const router = useRouter()
    const dispatch = useDispatch()
    const { theme } = useCustomTheme();

    const styles = customStyle(theme)

    const [signIn, { data, error, isSuccess, isError, isLoading }] = useSignInMutation()
    const [signInWithGoogle, { data: googleLoginData, error: googleLoginError, isSuccess: isGoogleLoginSuccess, isError: isGoogleLoginError }] = useSignInWithGoogleMutation()

    const toggleSecureText = () => setSecureText(!secureText);

    const schema = z.object({
        username: z.string().min(1, "Field Username is required"),
        password: z.string().min(1, "Field Password is required")
    })

    type FormValues = z.infer<typeof schema>

    const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { username: "", password: "" } })

    const onSubmit = (values: FormValues) => {
        signIn({ username: values.username, password: values.password })
    };

    const handleGoogleSignIn = async () => {
        try {
            await GoogleSignin.hasPlayServices()
            await GoogleSignin.signOut();

            const response = await GoogleSignin.signIn()
            if (isSuccessResponse(response)) {
                const { idToken } = response.data

                if (idToken) {
                    const { data } = await signInWithGoogle({ idToken })
                    if (data?.result) {
                        dispatch(setUser(data.result))
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                router.replace("/")
            }, 2000);
        }
    }, [isSuccess, router])

    useEffect(() => {
        if (isGoogleLoginSuccess) {
            setTimeout(() => {
                router.replace(googleLoginData?.result.route as any);
            }, 2000);
        }
    }, [isGoogleLoginSuccess, router]);


    return <>
        {isSuccess && <Toast type="success" message={data.message} />}
        {isError && <Toast type="error" message={error as string} />}

        {isGoogleLoginSuccess && <Toast type="success" message={googleLoginData.message} />}
        {isGoogleLoginError && <Toast type="error" message={googleLoginError as string} />}
        <View style={styles.container}>
            <Text variant="headlineMedium" style={styles.heading}>Sign In</Text>
            <Text variant="bodyMedium" style={styles.subText}>Welcome back! Please Sign In to your account.</Text>

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
                            autoCapitalize="none"
                            error={!!errors.username}
                            left={<TextInput.Icon icon="account-circle-outline" />}
                        />
                    }}
                />
                {
                    errors.username && <HelperText type="error" >
                        {errors.username.message}
                    </HelperText>
                }
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
                {
                    errors.password && <HelperText type="error" >
                        {errors.password.message}
                    </HelperText>
                }
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
                <Link href="/auth/forgot-password" style={{ color: theme.colors.text }}>Forgot Password?</Link>
            </TouchableOpacity>

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={styles.loginBtn}
                contentStyle={{ paddingVertical: 4 }}
                labelStyle={{ fontSize: 16 }}
            >
                {isLoading ? (
                    <ActivityIndicator size={19} animating={true} color={theme.colors.btnText} />
                ) : (
                    'Sign In'
                )}
            </Button>

            <Divider style={styles.divider} />
            <Text style={styles.orText}>OR</Text>

            <GoogleLoginButton onPress={handleGoogleSignIn} />

            <View style={styles.signupContainer}>
                <Text style={{ color: theme.colors.text }}>Don't have an account?</Text>
                <TouchableOpacity>
                    <Link href="/auth/register" style={{ color: theme.colors.primary }}> Sign Up</Link>
                </TouchableOpacity>
            </View>
        </View>
    </>
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
