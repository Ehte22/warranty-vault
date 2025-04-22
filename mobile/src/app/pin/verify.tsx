import { View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useCustomTheme } from '../../context/ThemeContext';
import { CustomTheme } from '../../theme/theme';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, Button, HelperText, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from '../../components/Toast';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/redux/store';

const Verify = () => {
    const [isVerifySuccess, setIsVerifySuccess] = useState(false)
    const [isVerifyError, setIsVerifyError] = useState(false)
    const [error, setError] = useState("")
    const { theme } = useCustomTheme();
    const styles = customStyles(theme)
    const router = useRouter()
    const { user } = useSelector((state: RootState) => state.auth)

    const schema = z.object({
        pin: z.string()
            .min(1, "PIN is required")
            .regex(/^\d+$/, "Only numbers are allowed")
            .min(6, "Pin must be exact 6 digits")
            .max(6, "Pin must be exact 6 digits"),
    })

    type FormValues = z.infer<typeof schema>

    const { control, handleSubmit, formState: { errors }, getValues } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { pin: "" } })

    const onSubmit = (values: FormValues) => {
        setIsVerifyError(false);
        setIsVerifySuccess(false);
        setError("");
        if (values.pin === user?.pin) {
            setIsVerifySuccess(true)
        } else {
            setError("Invalid PIN");
            setIsVerifyError(true)
        }
    };

    useEffect(() => {
        if (isVerifySuccess) {
            const timeout = setTimeout(async () => {
                await AsyncStorage.setItem('hasAuthenticated', 'true');
                router.replace({ pathname: "/", params: { verified: "true" } })
            }, 2000);

            return () => clearTimeout(timeout)
        }
    }, [isVerifySuccess])

    return <>
        {isVerifySuccess && <Toast type="success" message={"PIN Verified Successfully"} />}
        {isVerifyError && <Toast type="error" message={error} />}
        <View style={styles.container}>
            <Text style={styles.title}>Verify your 6-digit PIN</Text>

            <Text style={styles.subtitle}>
                Please Verify your pin
            </Text>

            <View style={{ marginBottom: 16 }}>
                <Controller
                    control={control}
                    name="pin"
                    render={({ field: { onChange, onBlur, value } }) => {
                        return <TextInput
                            label="PIN"
                            mode="outlined"
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            keyboardType='numeric'
                            style={styles.input}
                            error={!!errors.pin}
                        />
                    }}
                />
                {
                    errors.pin && <HelperText type="error" >
                        {errors.pin.message}
                    </HelperText>
                }
            </View>

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={styles.btn}
                contentStyle={{ paddingVertical: 4 }}
                labelStyle={{ fontSize: 16 }}
            >
                Verify
            </Button>
        </View>
    </>
}

export default Verify

const customStyles = (theme: CustomTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            padding: 24,
            backgroundColor: theme.colors.background
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.text,
            textAlign: 'center',
            marginBottom: 8
        },
        subtitle: {
            fontSize: 16,
            color: theme.colors.text,
            textAlign: 'center',
            marginBottom: 32
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