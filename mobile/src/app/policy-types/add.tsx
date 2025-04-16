import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
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
import { useAddUserMutation, useGetUserByIdQuery, useUpdateUserMutation } from '@/src/redux/apis/user.api'
import { useAddPolicyTypeMutation, useGetPolicyTypeByIdQuery, useUpdatePolicyTypeMutation } from '@/src/redux/apis/policyType.api'

const AddPolicyType = () => {
    const { id } = useLocalSearchParams()
    const router = useRouter()
    const { setPreviewImages } = useImagePreview()

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit Policy Type" : "Add Policy Type",
        showBackBtn: true,
    }

    const [addPolicyType, { data: addData, error: addError, isLoading: addLoading, isSuccess: isAddSuccess, isError: isAddError }] = useAddPolicyTypeMutation()
    const [updatePolicyType, { data: updateData, error: updateError, isLoading: updateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdatePolicyTypeMutation()
    const { data } = useGetPolicyTypeByIdQuery(id as string, { skip: !id })

    const fields: FieldConfig[] = [
        {
            name: "name",
            type: "text",
            placeholder: "Name",
            rules: { required: true, min: 2, max: 100 }
        },
        {
            name: "description",
            type: "text",
            placeholder: "Description",
            styles: { minHeight: 120 },
            multiline: true,
            numberOfMultiline: 6,
            rules: { required: false, min: 2, max: 500 }
        },
    ]

    const defaultValues = {
        name: "",
        description: "",
    }

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = (values: FormValues) => {
        const policyTypeData = { name: values.name, description: values.description, type: "policyType" }
        if (id && data) {
            updatePolicyType({ id: id as string, policyTypeData })
        } else {
            addPolicyType(policyTypeData)
        }
    };

    const { renderSingleInput, handleSubmit, setValue, reset } = useDynamicForm({ fields, defaultValues, onSubmit, schema })

    const handleReset = async () => {
        reset()
        setPreviewImages([])
    }

    const { theme } = useCustomTheme()

    const styles = customStyles(theme)

    useEffect(() => {
        if (id && data) {
            setValue("name", data.name)
            setValue("description", data.description)
        }
    }, [id, data])

    useEffect(() => {
        if (isAddSuccess) {
            const timeout = setTimeout(() => {
                router.replace("/policy-types")
            }, 2000);

            return () => clearTimeout(timeout)
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            const timeout = setTimeout(() => {
                router.replace("/policy-types")
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

        {isUpdateSuccess && id && <Toast type={updateData === "No Changes Detected" ? "info" : "success"} message={updateData as string} />}
        {isUpdateError && id && <Toast type="error" message={updateError as string} />}

        <View style={styles.container}>
            <DataContainer config={config} />
            <Surface style={styles.formContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ paddingHorizontal: 16 }}>

                        {/* Name */}
                        {renderSingleInput("name")}

                        {/* Description */}
                        {renderSingleInput("description")}

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

export default AddPolicyType


