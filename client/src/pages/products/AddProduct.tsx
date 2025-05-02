import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'
import { useGetBrandsQuery } from '../../redux/apis/brand.api'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useImagePreview } from '../../context/ImageContext'
import { useAddProductMutation, useGetProductByIdQuery, useUpdateProductMutation } from '../../redux/apis/product.api'
import Toast from '../../components/Toast'

const defaultValues = {
    name: "",
    brand: "",
    model: "",
    purchaseDate: "",
    image: ""
}

const AddProduct = React.memo(() => {
    const [brandOptions, setBrandOptions] = useState<{ label: string, value?: string }[]>([])

    const { id } = useParams()
    const { setPreviewImages } = useImagePreview()
    const navigate = useNavigate()

    const [addProduct, add] = useAddProductMutation()
    const [updateProduct, update] = useUpdateProductMutation()
    const { data } = useGetProductByIdQuery(id as string, { skip: !id })
    const { data: brands } = useGetBrandsQuery({ isFetchAll: true })

    const config: DataContainerConfig = useMemo(() => ({
        pageTitle: id ? "Edit Product" : "Add Product",
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
            label: "Image",
            rules: { required: false, file: true }
        },
    ], [brandOptions])

    const handleSave = useCallback(
        (values: z.infer<ReturnType<typeof customValidator>>) => {
            const brand = brands?.result.find(item => item._id === values.brand)

            let updatedData = values
            if (brand) {
                updatedData = { ...values, brand: { _id: brand._id, name: brand.name }, type: "product" }
            }

            const formData = new FormData()

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
                updateProduct({ id, productData: formData })
            } else {
                addProduct(formData)
            }

        }, [id, data, addProduct, updateProduct, brands])

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
        if (brands?.result) {
            const transformedData = brands.result.map((item) => {
                return { label: item.name, value: item._id }
            })
            setBrandOptions(transformedData)
        }
    }, [brands?.result])

    useEffect(() => {
        if (add.isSuccess || update.isSuccess) {
            const timeout = setTimeout(() => navigate('/products'), 2000)
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

                        {/* Brand */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                            {renderSingleInput("brand")}
                        </Grid2>

                        {/* Model */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                            {renderSingleInput("model")}
                        </Grid2>

                        {/* Purchase Date */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                            {renderSingleInput("purchaseDate")}
                        </Grid2>

                        {/* Image */}
                        <Grid2 size={{ xs: 12 }} >
                            {renderSingleInput("image")}
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

export default AddProduct