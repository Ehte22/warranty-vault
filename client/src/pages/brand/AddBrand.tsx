import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useAddBrandMutation, useGetBrandByIdQuery, useUpdateBrandMutation } from '../../redux/apis/brand.api'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useImagePreview } from '../../context/ImageContext'
import Toast from '../../components/Toast'

const defaultValues = {
    name: "",
    description: "",
    logo: ""
}

const AddBrand = React.memo(() => {
    const { id } = useParams()
    const { setPreviewImages } = useImagePreview()
    const navigate = useNavigate()

    const [addBrand, addStatus] = useAddBrandMutation()
    const [updateBrand, updateStatus] = useUpdateBrandMutation()
    const { data: brandData } = useGetBrandByIdQuery(id as string, { skip: !id })

    const config: DataContainerConfig = useMemo(() => ({
        pageTitle: id ? "Edit Brand" : "Add Brand",
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
    ], [])


    const handleSave = useCallback(
        (values: z.infer<ReturnType<typeof customValidator>>) => {
            const formData = new FormData()
            const payload: Record<string, any> = { ...values, type: "brand" }

            Object.entries(payload).forEach(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    Object.values(value).forEach((item: any) => {
                        formData.append(key, item);
                    });
                } else {
                    formData.append(key, value);
                }
            });

            id && brandData
                ? updateBrand({ id, brandData: formData })
                : addBrand(formData);
        }, [id, brandData, addBrand, updateBrand])

    const { handleSubmit, renderSingleInput, setValue, reset } =
        useDynamicForm({
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
        if (id && brandData) {
            setValue("name", brandData.name)
            setValue("description", brandData.description)

            if (brandData.logo) {
                setValue("logo", brandData.logo)
                setPreviewImages([brandData.logo])
            }
        }
    }, [id, brandData, setValue])

    useEffect(() => {
        if (addStatus.isSuccess || updateStatus.isSuccess) {
            const timeout = setTimeout(() => navigate('/brands'), 2000)
            return () => clearTimeout(timeout)
        }
    }, [addStatus.isSuccess, updateStatus.isSuccess, navigate])

    return <>
        {addStatus.isSuccess && <Toast type="success" message={addStatus.data?.message} />}
        {addStatus.isError && <Toast type="error" message={String(addStatus.error)} />}
        {updateStatus.isSuccess && <Toast type={updateStatus.data === 'No Changes Detected' ? 'info' : 'success'} message={updateStatus.data} />}
        {updateStatus.isError && <Toast type="error" message={String(updateStatus.error)} />}

        <Box>
            <DataContainer config={config} />
            <Paper sx={{ mt: 2, pt: 4, pb: 3 }}>
                <Box component="form" onSubmit={handleSubmit(handleSave)}>
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
                            onClick={handleReset}
                            variant='contained'
                            sx={{ backgroundColor: "#F3F3F3", py: 0.65 }}>
                            Reset
                        </Button>
                        <Button
                            loading={id ? updateStatus.isLoading : addStatus.isLoading}
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
})

export default AddBrand