import { View, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCustomTheme } from '@/src/context/ThemeContext'
import { CustomTheme } from '@/src/theme/theme'
import { ActivityIndicator, Button, HelperText, Text, TextInput } from 'react-native-paper'
import { Link, useRouter } from 'expo-router'
import { useSignUpMutation } from '@/src/redux/apis/auth.api'
import Toast from '@/src/components/Toast'

const Register = () => {
    const [secureText, setSecureText] = useState<{ [key: string]: boolean }>({
        password: true,
        confirmPassword: true
    });
    const { theme } = useCustomTheme();
    const router = useRouter()

    const [signUp, { data, isSuccess, isError, error, isLoading }] = useSignUpMutation()

    const toggleSecureText = (field: string) => {
        setSecureText({ ...secureText, [field]: !secureText[field] })
    }

    const schema = z.object({
        name: z.string().min(1, "Field name is required"),
        email: z.string().min(1, "Field email address is required").email("Please enter a valid email address"),
        phone: z.string().min(1, "Field phone number is required").regex(/^[6-9]\d{9}$/, { message: "Invalid format for phone number" }),
        password: z.
            string()
            .min(1, "Field password is required")
            .min(8, "Password must be at least 8 characters")
            .max(16, "Password must be at most 16 characters"),
        confirmPassword: z.string().min(1, "Field confirm password is required"),
        referrer: z.string()
    })
        .refine((data) => data.password === data.confirmPassword, {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        });

    type FormValues = z.infer<typeof schema>

    const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema), defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            referrer: ""
        }
    })

    const onSubmit = (values: FormValues) => {
        signUp(values)
    }

    const styles = customStyles(theme)

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                router.replace("/plans/select-plan")
            }, 2000);
        }
    }, [isSuccess, router])


    return <>
        {isSuccess && <Toast type='success' message={data.message} />}
        {isError && <Toast type='error' message={error as string} />}
        <View style={styles.container}>
            <Text variant='headlineMedium' style={styles.heading}>Sign Up</Text>

            <View style={{ marginBottom: 16 }}>
                <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => {
                        return <TextInput
                            label="Name"
                            mode='outlined'
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            style={styles.input}
                            autoCapitalize='none'
                            error={!!errors.name}
                            left={<TextInput.Icon icon="account-circle-outline" />}
                        />
                    }}
                />
                {
                    errors.name && <HelperText type="error" >
                        {errors.name.message}
                    </HelperText>
                }
            </View>

            <View style={{ marginBottom: 16 }}>
                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => {
                        return <TextInput
                            label="Email Address"
                            mode='outlined'
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            style={styles.input}
                            keyboardType='email-address'
                            autoCapitalize='none'
                            error={!!errors.email}
                            left={<TextInput.Icon icon="email-outline" />}
                        />
                    }}
                />
                {
                    errors.email && <HelperText type="error" >
                        {errors.email.message}
                    </HelperText>
                }
            </View>

            <View style={{ marginBottom: 16 }}>
                <Controller
                    control={control}
                    name="phone"
                    render={({ field: { onChange, onBlur, value } }) => {
                        return <TextInput
                            label="Phone Number"
                            mode='outlined'
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            style={styles.input}
                            keyboardType='phone-pad'
                            error={!!errors.phone}
                            left={<TextInput.Icon icon="phone-outline" />}
                        />
                    }}
                />
                {
                    errors.phone && <HelperText type="error" >
                        {errors.phone.message}
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
                            secureTextEntry={secureText.password}
                            style={styles.input}
                            error={!!errors.password}
                            left={<TextInput.Icon icon="lock-outline" />}
                            right={
                                <TextInput.Icon
                                    icon={secureText.password ? 'eye-off' : 'eye'}
                                    onPress={() => toggleSecureText("password")}
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

            <View style={{ marginBottom: 16 }}>
                <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, onBlur, value } }) => {
                        return <TextInput
                            label="Confirm Password"
                            mode="outlined"
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            secureTextEntry={secureText.confirmPassword}
                            style={styles.input}
                            error={!!errors.confirmPassword}
                            left={<TextInput.Icon icon="lock-outline" />}
                            right={
                                <TextInput.Icon
                                    icon={secureText.confirmPassword ? 'eye-off' : 'eye'}
                                    onPress={() => toggleSecureText("confirmPassword")}
                                />
                            }
                        />
                    }}
                />
                {
                    errors.confirmPassword && <HelperText type="error" >
                        {errors.confirmPassword.message}
                    </HelperText>
                }
            </View>

            <View style={{ marginBottom: 30 }}>
                <Controller
                    control={control}
                    name="referrer"
                    render={({ field: { onChange, onBlur, value } }) => {
                        return <TextInput
                            label="Referral Code"
                            mode='outlined'
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            style={styles.input}
                            error={!!errors.referrer}
                            left={<TextInput.Icon icon="ticket-percent-outline" />}
                        />
                    }}
                />
                {
                    errors.referrer && <HelperText type="error" >
                        {errors.referrer.message}
                    </HelperText>
                }
            </View>

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={styles.signUpBtn}
                contentStyle={{ paddingVertical: 4 }}
                labelStyle={{ fontSize: 16 }}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size={19} animating={true} color={theme.colors.btnText} />
                ) : (
                    'Sign Up'
                )}
            </Button>

            <View style={styles.signInContainer}>
                <Text style={{ color: theme.colors.text }}>Already have an account?</Text>
                <TouchableOpacity>
                    <Link href="/auth/login" style={{ color: theme.colors.primary }}> Sign In</Link>
                </TouchableOpacity>
            </View>

        </View>
    </>
}

export default Register

const customStyles = (theme: CustomTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            padding: 24,
            backgroundColor: theme.colors.background
        },
        heading: {
            textAlign: 'center',
            marginBottom: 24,
            fontWeight: 'bold',
            color: theme.colors.text
        },
        input: {
            marginBottom: 4,
            backgroundColor: theme.colors.inputBackground,
        },
        signUpBtn: {
            borderRadius: 4,
            marginBottom: 20,
        },
        signInContainer: {
            color: theme.colors.text,
            flexDirection: 'row',
            justifyContent: 'center',
        },
        errorText: {
            color: theme.colors.errorText,
            marginBottom: 8,
            marginLeft: 4,
        },
    })
}