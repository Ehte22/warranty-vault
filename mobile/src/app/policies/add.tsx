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
import { useImagePreview } from '@/src/context/ImageContext'
import { useGetProductsQuery } from '@/src/redux/apis/product.api'
import { useGetPolicyTypesQuery } from '@/src/redux/apis/policyType.api'
import { useAddPolicyMutation, useGetPolicyByIdQuery, useUpdatePolicyMutation } from '@/src/redux/apis/policy.api'

const AddPolicy = () => {
    const [productOptions, setProductOptions] = useState<{ label: string, value: string | undefined }[]>([])
    const [policyTypeOptions, setPolicyTypeOptions] = useState<{ label: string, value: string | undefined }[]>([])

    const { id } = useLocalSearchParams()
    const router = useRouter()
    const { setPreviewImages } = useImagePreview()

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit Policy" : "Add Policy",
        showBackBtn: true
    }

    const { data: products } = useGetProductsQuery({ isFetchAll: true })
    const { data: policyTypes } = useGetPolicyTypesQuery({ isFetchAll: true })
    const [addPolicy, { data: addData, error: addError, isLoading: addLoading, isSuccess: isAddSuccess, isError: isAddError }] = useAddPolicyMutation()
    const [updatePolicy, { data: updateData, error: updateError, isLoading: updateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdatePolicyMutation()
    const { data } = useGetPolicyByIdQuery(id as string, { skip: !id })

    const fields: FieldConfig[] = [
        {
            name: "product",
            type: "autoComplete",
            placeholder: "Select Product",
            options: productOptions,
            rules: { required: true }
        },
        {
            name: "name",
            type: "autoComplete",
            placeholder: "Select Type",
            options: policyTypeOptions,
            rules: { required: true }
        },
        {
            name: "provider",
            type: "text",
            placeholder: "Provider",
            styles: { height: 52 },
            rules: { required: true, min: 2, max: 100 }
        },
        {
            name: "expiryDate",
            type: "date",
            placeholder: "Expiry Date",
            rules: { required: true }
        },
        {
            name: "document",
            type: "file",
            placeholder: "Document",
            displayName: "Document Image",
            rules: { required: data?.document ? false : true, file: true }
        },
    ]

    const defaultValues = {
        product: "",
        name: "",
        provider: "",
        expiryDate: "",
        document: ""
    }

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = async (values: FormValues) => {
        const product = products?.result.find(item => item._id === values.product)
        const name = policyTypes?.result.find(item => item._id === values.name)

        let updatedData = values
        if (product && name) {
            updatedData = {
                ...values,
                product: { _id: product._id, name: product.name },
                name: { _id: name._id, name: name.name },
                type: "policy"
            }
        }

        const formData = new FormData()

        Object.keys(updatedData).forEach((key) => {
            const value = updatedData[key];
            if (typeof value === "object" && value !== "" && key !== "document") {
                Object.entries(value).forEach(([objKey, objValue]) => {
                    formData.append(`${key}[${objKey}]`, objValue as any);
                });
            } else {
                formData.append(key, value)
            }
        })

        if (id) {
            let remove = "false"
            if (values.document === "" && data?.document) {
                remove = "true"
            }
            formData.append("remove", remove)
            updatePolicy({ id: id as string, policyData: formData })
        } else {
            addPolicy(formData)
        }
    };

    const { renderSingleInput, handleSubmit, setValue, reset, } = useDynamicForm({ fields, defaultValues, onSubmit, schema })

    const handleReset = async () => {
        reset()
        setPreviewImages([])
    }

    const { theme } = useCustomTheme()

    const styles = customStyles(theme)

    useEffect(() => {
        if (id && data) {
            setValue("product", data.product?._id || "")
            setValue("name", data.name?._id || "")
            setValue("provider", data.provider)
            setValue("expiryDate", data.expiryDate)


            if (data.document) {
                setValue("document", data.document)
                setPreviewImages([data.document])
            }
        }
    }, [id, data])

    useEffect(() => {
        if (products?.result) {
            const transformedData = products.result.map((item) => {
                return { label: item.name, value: item._id }
            })
            setProductOptions(transformedData)
        }
    }, [products?.result])

    useEffect(() => {
        if (policyTypes?.result) {
            const transformedData = policyTypes.result.map((item) => {
                return { label: item.name, value: item._id }
            })
            setPolicyTypeOptions(transformedData)
        }
    }, [policyTypes?.result])

    useEffect(() => {
        if (isAddSuccess) {
            const timeout = setTimeout(() => {
                router.replace("/")
                router.push("/policies")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            const timeout = setTimeout(() => {
                router.replace("/")
                router.push("/policies")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isUpdateSuccess])

    useEffect(() => {
        return () => {
            setPreviewImages([])
        }
    }, [isAddSuccess, isUpdateSuccess])

    return <>
        {isAddSuccess && !id && <Toast type="success" message={addData?.message} />}
        {isAddError && !id && <Toast type="error" message={addError as string} />}

        {/* {isUpdateSuccess && id && <Toast type={updateData === "No Changes Detected" ? "info" : "success"} message={updateData as string} />}
        {isUpdateError && id && <Toast type="error" message={updateError as string} />} */}
        <View style={styles.container}>
            <DataContainer config={config} />
            <Surface style={styles.formContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ paddingHorizontal: 16 }}>

                        {/* Name */}
                        {renderSingleInput("name")}

                        {/* Product */}
                        {renderSingleInput("product")}

                        {/* Provider */}
                        {renderSingleInput("provider")}

                        {/* Expiry Date */}
                        {renderSingleInput("expiryDate")}

                        {/* Image */}
                        {renderSingleInput("document")}

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
            marginTop: 20,
            flexShrink: 1
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

export default AddPolicy


