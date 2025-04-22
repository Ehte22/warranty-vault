import { TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useCustomTheme } from '@/src/context/ThemeContext';
import { ActivityIndicator, Button, HelperText, Text, TextInput } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForgotPasswordMutation } from '@/src/redux/apis/auth.api';
import { Link } from 'expo-router';
import { CustomTheme } from '@/src/theme/theme';
import { StyleSheet } from 'react-native';
import Toast from '@/src/components/Toast';

const ForgotPassword = () => {

    const [forgotPassword, { data, error, isSuccess, isError, isLoading }] = useForgotPasswordMutation()

    const { theme } = useCustomTheme();
    const styles = customStyle(theme)

    const schema = z.object({
        email: z.string().min(1, "Field email address is required").email("Please enter a valid email address"),
    })

    type FormValues = z.infer<typeof schema>

    const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } })

    const onSubmit = (values: FormValues) => {
        forgotPassword(values.email)
    };
    return <>
        {isSuccess && <Toast type="success" message={data} />}
        {isError && <Toast type="error" message={error as string} />}
        <View style={styles.container}>
            <Text variant="headlineMedium" style={styles.heading}>Forgot Password?</Text>
            <Text variant="bodyMedium" style={styles.subText}>
                Enter your email address below, and we’ll send you a password reset link.
            </Text>

            <View style={{ marginBottom: 16 }}>
                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => {
                        return <TextInput
                            label="Email"
                            mode="outlined"
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            style={styles.input}
                            autoCapitalize="none"
                            error={!!errors.email}
                            left={<TextInput.Icon icon="account-circle-outline" />}
                        />
                    }}
                />
                {
                    errors.email && <HelperText type="error" >
                        {errors.email.message}
                    </HelperText>
                }
            </View>

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={styles.btn}
                contentStyle={{ paddingVertical: 4 }}
                labelStyle={{ fontSize: 16 }}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size={19} animating={true} color={theme.colors.btnText} />
                ) : (
                    'Send'
                )}
            </Button>

            <TouchableOpacity style={{ marginTop: 10, alignItems: "center", marginRight: 2 }}>
                <Link href="/auth/login" style={{ color: theme.colors.text }}>Back to Sign In</Link>
            </TouchableOpacity>
        </View>
    </>
}

export default ForgotPassword

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
        btn: {
            borderRadius: 4,
            marginTop: 16,
        },
    });
} 