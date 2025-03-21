import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'
import { useGetBrandsQuery } from '../../redux/apis/brand.api'
import { useEffect, useState } from 'react'
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

const AddProduct = () => {
    const config: DataContainerConfig = {
        pageTitle: "Add Product",
        backLink: "../",
    }
    const [brandOptions, setBrandOptions] = useState<{ label: string, value: string | undefined }[]>([])

    const { id } = useParams()
    const { setPreviewImages } = useImagePreview()
    const navigate = useNavigate()

    const { data: brands } = useGetBrandsQuery({ isFetchAll: true })
    const [addProduct, { data: addData, error: addError, isLoading: addLoading, isSuccess: isAddSuccess, isError: isAddError }] = useAddProductMutation()
    const [updateProduct, { data: updateData, error: updateError, isLoading: updateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdateProductMutation()
    const { data } = useGetProductByIdQuery(id as string, { skip: !id })

    const fields: FieldConfig[] = [
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
    ]

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = (values: FormValues) => {
        const brand = brands?.result.find(item => item._id === values.brand)

        let updatedData = values
        if (brand) {
            updatedData = { ...values, brand: { _id: brand._id, name: brand.name } }
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

    }

    const { handleSubmit, renderSingleInput, setValue, reset } = useDynamicForm({ fields, defaultValues, schema, onSubmit })

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
        if (isAddSuccess) {
            setTimeout(() => {
                navigate("/products")
            }, 2000);
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            setTimeout(() => {
                navigate("/products")
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
                            onClick={() => reset()}
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

export default AddProduct