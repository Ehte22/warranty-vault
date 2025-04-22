import { View } from 'react-native'
import React, { useEffect } from 'react'
import { useCustomTheme } from '../../context/ThemeContext';
import { CustomTheme } from '../../theme/theme';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useUpdateUserMutation } from '../../redux/apis/user.api';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from '../../components/Toast';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useRouter } from 'expo-router';

const Set = () => {
    const { theme } = useCustomTheme();
    const styles = customStyles(theme)
    const router = useRouter()
    const { user } = useSelector((state: RootState) => state.auth)

    const [updateUser, { isSuccess, isLoading }] = useUpdateUserMutation()

    const schema = z.object({
        pin: z.string()
            .min(1, "PIN is required")
            .regex(/^\d+$/, "Only numbers are allowed")
            .min(6, "Pin must be exact 6 digits")
            .max(6, "Pin must be exact 6 digits"),
    })

    type FormValues = z.infer<typeof schema>

    const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { pin: "" } })

    const onSubmit = (values: FormValues) => {
        const formData = new FormData()

        formData.append("pin", values.pin)
        if (user?._id) {
            updateUser({ id: user._id, userData: formData })
        }
    };

    useEffect(() => {
        if (isSuccess) {
            const timeout = setTimeout(() => {
                router.replace("/")
            }, 2000);

            return () => clearTimeout(timeout)
        }
    }, [isSuccess, router])


    return <>
        {isSuccess && <Toast type="success" message={"PIN set successfully"} />}
        <View style={styles.container}>
            <Text style={styles.title}>Set your 6-digit PIN</Text>

            <Text style={styles.subtitle}>
                This PIN will be used to secure your account
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
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size={19} animating={true} color={theme.colors.btnText} />
                ) : (
                    'Save'
                )}
            </Button>
        </View>
    </>
}

export default Set

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