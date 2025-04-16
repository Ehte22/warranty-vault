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

const AddUser = () => {
    const { id } = useLocalSearchParams()
    const router = useRouter()
    const { setPreviewImages } = useImagePreview()

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit User" : "Add User",
        showBackBtn: true,
    }

    const [addUser, { data: addData, error: addError, isLoading: addLoading, isSuccess: isAddSuccess, isError: isAddError }] = useAddUserMutation()
    const [updateUser, { data: updateData, error: updateError, isLoading: updateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdateUserMutation()
    const { data } = useGetUserByIdQuery(id as string, { skip: !id })

    const fields: FieldConfig[] = [
        {
            name: "name",
            type: "text",
            placeholder: "Name",
            styles: { height: 52 },
            rules: { required: true, min: 2, max: 100 }
        },
        {
            name: "email",
            type: "text",
            placeholder: "Email Address",
            styles: { height: 52 },
            keyboardType: "email-address",
            rules: { required: true, email: true }
        },
        {
            name: "phone",
            placeholder: "Phone Number",
            type: "text",
            styles: { height: 52 },
            keyboardType: "phone-pad",
            rules: { required: true, pattern: /^[6-9]\d{9}$/, patternMessage: "Please enter a valid phone number" }
        },
        {
            name: "password",
            placeholder: "Password",
            type: "text",
            styles: { height: 52 },
            rules: { required: id ? false : true, min: 8, max: 16 }
        },
        {
            name: "profile",
            placeholder: "Profile",
            type: "file",
            displayName: "User Profile",
            rules: { required: false, file: true }
        },
    ]

    const defaultValues = {
        name: "",
        email: "",
        phone: "",
        profile: "",
        password: "",
    }

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = (values: FormValues) => {
        const formData = new FormData()

        const updatedData: Record<string, any> = { ...values, type: "user" }

        Object.keys(updatedData).forEach((key) => {
            formData.append(key, updatedData[key])
        })

        if (id) {
            let remove = "false"
            if (values.profile === "" && data?.profile) {
                remove = "true"
            }
            formData.append("remove", remove)
            updateUser({ id: id as string, userData: formData })
        } else {
            addUser(formData)
        }
    };

    const { renderSingleInput, handleSubmit, setValue, reset, control, errors, watch } = useDynamicForm({ fields, defaultValues, onSubmit, schema })

    const handleReset = async () => {
        reset()
        setPreviewImages([])
    }

    const { theme } = useCustomTheme()

    const styles = customStyles(theme)

    useEffect(() => {
        if (id && data) {
            setValue("name", data.name)
            setValue("email", data.email)
            setValue("phone", data.phone || "")

            if (data.profile) {
                setValue("profile", data.profile)
                setPreviewImages([data.profile])
            }
        }
    }, [id, data])

    useEffect(() => {
        if (isAddSuccess) {
            const timeout = setTimeout(() => {
                router.replace("/users")
            }, 2000);

            return () => clearTimeout(timeout)
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            const timeout = setTimeout(() => {
                router.replace("/users")
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

                        {/* Email Address */}
                        {renderSingleInput("email")}

                        {/* Phone */}
                        {renderSingleInput("phone")}

                        {/* Password */}
                        {!id && renderSingleInput("password")}

                        {/* Profile */}
                        {renderSingleInput("profile")}

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

export default AddUser


