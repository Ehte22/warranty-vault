import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useAddBrandMutation, useGetBrandByIdQuery, useUpdateBrandMutation } from '../../redux/apis/brand.api'
import { useEffect } from 'react'
import { useImagePreview } from '../../context/ImageContext'
import Toast from '../../components/Toast'

const fields: FieldConfig[] = [
    {
        name: "name",
        type: "text",
        placeholder: "Name",
        rules: { required: true, min: 2, max: 100 }
    },
    {
        name: "description",
        type: "textarea",
        placeholder: "Description",
        rules: { required: false, min: 2, max: 500 }
    },
    {
        name: "logo",
        type: "file",
        label: "Logo",
        placeholder: "Logo",
        rules: { required: false, file: true }
    },
]

const defaultValues = {
    name: "",
    description: "",
    logo: ""
}

const AddBrand = () => {
    const { id } = useParams()
    const { setPreviewImages } = useImagePreview()
    const navigate = useNavigate()

    const [addBrand, { data: addData, error: addError, isLoading: addLoading, isSuccess: isAddSuccess, isError: isAddError }] = useAddBrandMutation()
    const [updateBrand, { data: updateData, error: updateError, isLoading: updateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdateBrandMutation()
    const { data } = useGetBrandByIdQuery(id as string, { skip: !id })

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit Brand" : "Add Brand",
        backLink: "../",
    }

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = (values: FormValues) => {
        const formData = new FormData()

        const updatedData: Record<string, any> = { ...values, type: "brand" }

        Object.keys(updatedData).forEach((key) => {
            if (typeof updatedData[key] === "object") {
                Object.keys(updatedData[key]).forEach((item) => {
                    formData.append(key, updatedData[key][item])
                })
            } else {
                formData.append(key, updatedData[key])
            }
        })

        if (id && data) {
            updateBrand({ id, brandData: formData })
        } else {
            addBrand(formData)
        }
    }

    const { handleSubmit, renderSingleInput, setValue, reset } = useDynamicForm({ fields, defaultValues, schema, onSubmit })

    useEffect(() => {
        if (id && data) {
            setValue("name", data.name)
            setValue("description", data.description)

            if (data.logo) {
                setValue("logo", data.logo)
                setPreviewImages([data.logo])
            }
        }
    }, [id, data])

    useEffect(() => {
        if (isAddSuccess) {
            const timeout = setTimeout(() => {
                navigate("/brands")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            setTimeout(() => {
                navigate("/brands")
            }, 2000);
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
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            {renderSingleInput("name")}
                        </Grid2>

                        {/* Description */}
                        <Grid2 size={{ xs: 12, md: 6 }} >
                            {renderSingleInput("description")}
                        </Grid2>

                        {/* Logo */}
                        <Grid2 size={{ xs: 12 }}>
                            {renderSingleInput("logo")}
                        </Grid2>

                    </Grid2>

                    <Divider sx={{ mt: 4, mb: 3 }} />

                    <Box sx={{ textAlign: "end", px: 3 }}>
                        <Button
                            type='button'
                            onClick={() => reset()}
                            variant='contained'
                            sx={{ backgroundColor: "#F3F3F3", py: 0.65 }}>
                            Reset
                        </Button>
                        <Button
                            loading={id ? updateLoading : addLoading}
                            type='submit'
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

export default AddBrand