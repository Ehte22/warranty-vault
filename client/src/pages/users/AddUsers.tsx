import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useImagePreview } from '../../context/ImageContext'
import Toast from '../../components/Toast'
import { useAddUserMutation, useGetUserByIdQuery, useUpdateUserMutation } from '../../redux/apis/user.api'

const defaultValues = {
    name: "",
    email: "",
    phone: "",
    profile: "",
    password: "",
}

const AddUser = () => {
    const { id } = useParams()

    const navigate = useNavigate()

    const { setPreviewImages } = useImagePreview()

    const [addUser, { data: addData, error: addError, isLoading: addLoading, isSuccess: isAddSuccess, isError: isAddError }] = useAddUserMutation()
    const [updateUser, { data: updateData, error: updateError, isLoading: updateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdateUserMutation()
    const { data } = useGetUserByIdQuery(id as string, { skip: !id })

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit User" : "Add User",
        backLink: "../",
    }

    const fields: FieldConfig[] = [
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
    ]

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = (values: FormValues) => {
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

    }

    const handleReset = () => {
        reset()
        setPreviewImages([])
    }

    const { handleSubmit, renderSingleInput, setValue, reset } = useDynamicForm({ fields, defaultValues, schema, onSubmit })

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
                navigate("/users")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            const timeout = setTimeout(() => {
                navigate("/users")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isUpdateSuccess])


    return <>
        {isAddSuccess && !id && <Toast type="success" message={addData?.message} />}
        {isAddError && !id && <Toast type="error" message={addError as string} />}

        {isUpdateSuccess && id && <Toast type={updateData === "No Changes Detected" ? "info" : "success"} message={updateData as string} />}
        {isUpdateError && id && <Toast type="error" message={updateError as string} />}

        <Box>
            <DataContainer config={config} />
            <Paper sx={{ mt: 2, pt: 4, pb: 3 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
                            loading={addLoading || updateLoading}
                            variant='contained'
                            sx={{ ml: 2, background: "#00c979", color: "white", py: 0.65 }}>
                            Save
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    </>
}

export default AddUser