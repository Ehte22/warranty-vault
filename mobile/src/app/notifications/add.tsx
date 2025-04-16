import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useCustomTheme } from '@/src/context/ThemeContext'
import { CustomTheme } from '@/src/theme/theme'
import DataContainer, { DataContainerConfig } from '@/src/components/DataContainer'
import { ActivityIndicator, Divider, Surface, Text } from 'react-native-paper'
import { z } from "zod"
import { useLocalSearchParams, useRouter } from 'expo-router'
import Toast from '@/src/components/Toast'
import useDynamicForm, { FieldConfig } from '@/src/hooks/useDynamicForm'
import { customValidator } from '@/src/utils/validator'
import { useAddNotificationMutation, useGetNotificationByIdQuery, useUpdateNotificationMutation } from '@/src/redux/apis/notification.api'
import { useGetProductsQuery } from '@/src/redux/apis/product.api'
import { useGetPoliciesQuery } from '@/src/redux/apis/policy.api'
import { INotification } from '@/src/models/notification.interface'

const AddNotification = () => {
    const [productOptions, setProductOptions] = useState<{ label?: string, value?: string }[]>([])
    const [policyOptions, setPolicyOptions] = useState<{ label?: string, value?: string }[]>([])

    const { id } = useLocalSearchParams()
    const router = useRouter()
    const { theme } = useCustomTheme()
    const styles = customStyles(theme)

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit Notification" : "Add Notification",
        showBackBtn: true
    }

    const [addNotification, { data: addData, error: addError, isLoading: addLoading, isSuccess: isAddSuccess, isError: isAddError }] = useAddNotificationMutation()
    const [updateNotification, { data: updateData, error: updateError, isLoading: updateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdateNotificationMutation()
    const { data } = useGetNotificationByIdQuery(id as string, { skip: !id })
    const { data: products } = useGetProductsQuery({ isFetchAll: true })
    const { data: policies } = useGetPoliciesQuery({ isFetchAll: true })

    const fields: FieldConfig[] = [
        {
            name: "product",
            type: "autoComplete",
            placeholder: "Product",
            options: productOptions,
            rules: { required: true }
        },
        {
            name: "policy",
            type: "autoComplete",
            placeholder: "Policy",
            options: policyOptions,
            rules: { required: true }
        },
        {
            name: "scheduleDate",
            type: "date",
            placeholder: "Schedule Date",
            rules: { required: true }
        },
        {
            name: "message",
            type: "text",
            placeholder: "Message",
            multiline: true,
            numberOfMultiline: 3,
            styles: { minHeight: 80 },
            rules: { required: true }
        },
    ]

    const defaultValues = {
        product: "",
        policy: "",
        message: "",
        scheduleDate: ""
    }

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = async (values: FormValues) => {
        const product = products?.result.find(item => item._id === values.product)
        const policy = policyOptions.find(item => item.value === values.policy)

        let updatedData = values
        if (product && policy) {
            updatedData = {
                ...values,
                product: { _id: product._id, name: product.name },
                policy: { _id: policy.value, name: policy.label },
                type: "notification"
            }
        }

        if (id && data) {
            updateNotification({ id: id as string, notificationData: updatedData as INotification })
        } else {
            addNotification(updatedData as INotification)
        }
    };

    const { renderSingleInput, handleSubmit, setValue, reset, watch } = useDynamicForm({ fields, defaultValues, onSubmit, schema })

    const handleReset = async () => {
        reset()
    }

    useEffect(() => {
        if (products?.result) {
            const transformedData = products.result.map((item) => {
                return { label: item.name, value: item._id }
            })
            setProductOptions(transformedData)
        }
    }, [products?.result])

    useEffect(() => {
        if (policies?.result) {
            const subscription = watch(({ product }) => {
                if (product) {
                    const transformedData = policies.result
                        .filter((item) => item.product?._id === product)
                        .map((policy) => ({ label: policy.name.name, value: policy._id }))

                    setPolicyOptions(transformedData)
                }
            });

            return () => subscription.unsubscribe();
        }
    }, [policies?.result, watch]);

    useEffect(() => {
        if (id && data) {
            setValue("product", data.product?._id)
            setValue("policy", data.policy?._id)
            setValue("scheduleDate", data.scheduleDate)
            setValue("message", data.message)


            const selectedProduct = products?.result.find(item => item._id === data.product?._id);

            if (Array.isArray(selectedProduct?.policies)) {
                const transformedPolicies = selectedProduct.policies.map(policy => ({
                    label: policy.name,
                    value: policy._id,
                }));

                setPolicyOptions(transformedPolicies)
            }
        }
    }, [id, data, products])

    useEffect(() => {
        if (isAddSuccess) {
            const timeout = setTimeout(() => {
                router.replace("/notifications")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            const timeout = setTimeout(() => {
                router.replace("/notifications")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isUpdateSuccess])

    return <>
        {isAddSuccess && !id && <Toast type="success" message={addData?.message} />}
        {isAddError && !id && <Toast type="error" message={addError as string} />}
        {isUpdateSuccess && id && <Toast type={updateData === "No Changes Detected" ? "info" : "success"} message={updateData as string} />}
        {isUpdateError && id && <Toast type="error" message={updateError as string} />}
        <View style={styles.container}>
            <DataContainer config={config} />
            <Surface style={styles.formContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ paddingHorizontal: 16 }}>

                        {/* Product */}
                        {renderSingleInput("product")}

                        {/* Policy */}
                        {renderSingleInput("policy")}

                        {/* Schedule Date */}
                        {renderSingleInput("scheduleDate")}

                        {/* Message */}
                        {renderSingleInput("message")}

                    </View>


                    <Divider style={{ marginTop: 32 }} />

                    <View style={{ paddingHorizontal: 16, marginVertical: 20, display: "flex", justifyContent: "flex-end", flexDirection: "row", gap: 12 }}>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: "#f3f3f3" }]} onPress={handleReset}>
                            <Text style={{ color: "black", fontSize: 14, paddingHorizontal: 4, fontWeight: 'bold' }}>
                                RESET
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity disabled={addLoading || updateLoading} style={[styles.btn, { backgroundColor: theme.colors.primary }]}
                            onPress={handleSubmit(onSubmit)} >
                            {addLoading || updateLoading
                                ? <ActivityIndicator size={19} animating={true} color={theme.colors.btnText} />
                                : <Text style={{ color: theme.colors.btnText, fontSize: 14, paddingHorizontal: 4, fontWeight: 'bold' }}>
                                    SAVE
                                </Text>
                            }

                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Surface>

        </View >
    </>
}

const customStyles = (theme: CustomTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            paddingVertical: 16,
            paddingHorizontal: 10,
            backgroundColor: theme.colors.bgSecondary
        },
        formContainer: {
            backgroundColor: theme.colors.cardBg,
            borderRadius: 4,
            elevation: 4,
            marginTop: 20
        },
        btn: {
            borderRadius: 4,
            paddingHorizontal: 10,
            paddingVertical: 8,
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
    })
}

export default AddNotification


