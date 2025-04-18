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
import { useAddProductMutation, useGetProductByIdQuery, useUpdateProductMutation } from '@/src/redux/apis/product.api'
import { useGetBrandsQuery } from '@/src/redux/apis/brand.api'

const AddProduct = () => {
    const [brandOptions, setBrandOptions] = useState<{ label: string, value?: string }[]>([])

    const { id } = useLocalSearchParams()
    const router = useRouter()
    const { setPreviewImages } = useImagePreview()

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit Product" : "Add Product",
        showBackBtn: true
    }

    const [addProduct, { data: addData, error: addError, isLoading: addLoading, isSuccess: isAddSuccess, isError: isAddError }] = useAddProductMutation()
    const [updateProduct, { data: updateData, error: updateError, isLoading: updateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdateProductMutation()
    const { data } = useGetProductByIdQuery(id as string, { skip: !id })
    const { data: brands } = useGetBrandsQuery({ isFetchAll: true })

    const fields: FieldConfig[] = [
        {
            name: "name",
            type: "text",
            placeholder: "Name",
            styles: { height: 52 },
            rules: { required: true, min: 2, max: 100 }
        },
        {
            name: "brand",
            type: "autoComplete",
            placeholder: "Select Brand",
            options: brandOptions,
            rules: { required: true }
        },
        {
            name: "model",
            type: "text",
            placeholder: "Model",
            styles: { height: 52 },
            rules: { required: true, min: 2, max: 100 }
        },
        {
            name: "purchaseDate",
            type: "date",
            placeholder: "Purchase Date",
            rules: { required: true }
        },
        {
            name: "image",
            type: "file",
            placeholder: "Image",
            displayName: "Product Image",
            rules: { required: false, file: true }
        },
    ]

    const defaultValues = {
        name: "",
        brand: "",
        model: "",
        purchaseDate: "",
        image: ""
    }

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = async (values: FormValues) => {
        const brand = brands?.result.find((item: any) => item._id === values.brand)

        let updatedData = values
        if (brand) {
            updatedData = { ...updatedData, brand: { _id: brand._id, name: brand.name }, type: "product" }
        }

        const formData = new FormData()

        Object.keys(updatedData).forEach((key) => {
            const value = updatedData[key];
            if (typeof value === "object" && value !== "" && key !== "image") {
                Object.entries(value).forEach(([objKey, objValue]) => {
                    formData.append(`${key}[${objKey}]`, objValue as any);
                });
            } else {
                formData.append(key, value)
            }
        })

        if (id) {
            let remove = "false"
            if (values.image === "" && data?.image) {
                remove = "true"
            }
            formData.append("remove", remove)
            updateProduct({ id: id as string, productData: formData })
        } else {
            addProduct(formData)
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
        if (brands?.result) {
            const transformedData = brands.result.map((item: any) => {
                return { label: item.name, value: item._id }
            })
            setBrandOptions(transformedData)
        }
    }, [brands?.result])

    useEffect(() => {
        if (id && data) {
            setValue("name", data.name)
            setValue("brand", data.brand?._id || '')
            setValue("model", data.model)
            setValue("purchaseDate", data.purchaseDate)

            if (data.image) {
                setValue("image", data.image)
                setPreviewImages([data.image])
            }
        }
    }, [id, data])

    useEffect(() => {
        if (isAddSuccess) {
            const timeout = setTimeout(() => {
                router.replace("/")
                router.push("/products")
            }, 2000);

            return () => clearTimeout(timeout)
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            const timeout = setTimeout(() => {
                router.replace("/")
                router.push("/products")
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

                        {/* Brand */}
                        {renderSingleInput("brand")}

                        {/* Model */}
                        {renderSingleInput("model")}

                        {/* Purchase Date */}
                        {renderSingleInput("purchaseDate")}

                        {/* Image */}
                        {renderSingleInput("image")}

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

export default AddProduct


