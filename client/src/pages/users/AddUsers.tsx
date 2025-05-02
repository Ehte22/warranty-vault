import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useImagePreview } from '../../context/ImageContext'
import Toast from '../../components/Toast'
import { useAddUserMutation, useGetUserByIdQuery, useUpdateUserMutation } from '../../redux/apis/user.api'

const AddUser = React.memo(() => {
    const { id } = useParams()

    const navigate = useNavigate()

    const { setPreviewImages } = useImagePreview()

    const [addUser, add] = useAddUserMutation()
    const [updateUser, update] = useUpdateUserMutation()
    const { data } = useGetUserByIdQuery(id as string, { skip: !id })

    const config: DataContainerConfig = useMemo(() => ({
        pageTitle: id ? "Edit User" : "Add User",
        backLink: "../",
    }), [id])

    const fields: FieldConfig[] = useMemo(() => [
        {
            name: "name",
            type: "text",
            placeholder: "Name",
            rules: { required: true, min: 2, max: 100 }
        },
        {
            name: "email",
            type: "text",
            placeholder: "Email Address",
            rules: { required: true, email: true }
        },
        {
            name: "phone",
            placeholder: "Phone Number",
            type: "text",
            rules: { required: true, pattern: /^[6-9]\d{9}$/, patternMessage: "Please enter a valid phone number" }
        },
        {
            name: "password",
            placeholder: "Password",
            type: "text",
            rules: { required: id ? false : true, min: 8, max: 16 }
        },
        {
            name: "profile",
            label: "Profile",
            type: "file",
            rules: { required: false, file: true }
        },
    ], [])

    const defaultValues = {
        name: "",
        email: "",
        phone: "",
        profile: "",
        password: "",
    }

    const handleSave = useCallback(
        (values: z.infer<ReturnType<typeof customValidator>>) => {
            const formData = new FormData()

            const updatedData: Record<string, any> = { ...values, type: "user" }

            Object.keys(updatedData).forEach((key) => {
                const value = updatedData[key];

                if (value instanceof FileList) {
                    Array.from(value).forEach((file) => {
                        formData.append(key, file);
                    });
                } else if (typeof value === "object" && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach((item, index) => {
                            formData.append(`${key}[${index}]`, JSON.stringify(item));
                        });
                    } else {
                        Object.entries(value).forEach(([objKey, objValue]) => {
                            formData.append(`${key}[${objKey}]`, objValue as any);
                        });
                    }
                } else {
                    formData.append(key, value);
                }
            });


            if (id && data) {
                updateUser({ id, userData: formData })
            } else {
                addUser(formData)
            }

        }, [id, data, addUser, updateUser])

    const { handleSubmit, renderSingleInput, setValue, reset } = useDynamicForm({
        fields,
        defaultValues,
        schema: customValidator(fields),
        onSubmit: handleSave
    })

    const handleReset = useCallback(() => {
        reset()
        setPreviewImages([])
    }, [reset, setPreviewImages])

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
        if (add.isSuccess || update.isSuccess) {
            const timeout = setTimeout(() => navigate('/users'), 2000)
            return () => clearTimeout(timeout)
        }
    }, [add.isSuccess, update.isSuccess, navigate])

    return <>
        {add.isSuccess && <Toast type="success" message={add.data?.message} />}
        {add.isError && <Toast type="error" message={add.error as string} />}
        {update.isSuccess && <Toast type={update.data === 'No Changes Detected' ? 'info' : 'success'} message={update.data} />}
        {update.isError && <Toast type="error" message={update.error as string} />}

        <Box>
            <DataContainer config={config} />
            <Paper sx={{ mt: 2, pt: 4, pb: 3 }}>
                <Box component="form" onSubmit={handleSubmit(handleSave)}>
                    <Grid2 container columnSpacing={2} rowSpacing={3} sx={{ px: 3 }} >

                        {/* Name */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("name")}
                        </Grid2>

                        {/* Email Address */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                            {renderSingleInput("email")}
                        </Grid2>

                        {/* Phone Number */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                            {renderSingleInput("phone")}
                        </Grid2>

                        {/* Password */}
                        {
                            !id && <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                                {renderSingleInput("password")}
                            </Grid2>
                        }

                        {/* Profile */}
                        <Grid2 size={{ xs: 12 }} >
                            {renderSingleInput("profile")}
                        </Grid2>

                    </Grid2>

                    <Divider sx={{ mt: 4, mb: 3 }} />

                    <Box sx={{ textAlign: "end", px: 3 }}>
                        <Button
                            type='button'
                            onClick={handleReset}
                            variant='contained'
                            sx={{ backgroundColor: "#F3F3F3", py: 0.65 }}>
                            Reset
                        </Button>
                        <Button
                            type='submit'
                            loading={add.isLoading || update.isLoading}
                            variant='contained'
                            sx={{ ml: 2, background: "#00c979", color: "white", py: 0.65 }}>
                            Save
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    </>
})

export default AddUser