import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useImagePreview } from '../../context/ImageContext'
import Toast from '../../components/Toast'
import { useGetProductsQuery } from '../../redux/apis/product.api'
import { useAddPolicyMutation, useGetPolicyByIdQuery, useUpdatePolicyMutation } from '../../redux/apis/policy.api'
import { useGetPolicyTypesQuery } from '../../redux/apis/policyType.api'

const defaultValues = {
    product: "",
    type: "",
    provider: "",
    expiryDate: "",
    document: ""
}

const AddPolicy = () => {
    const [productOptions, setProductOptions] = useState<{ label: string, value: string | undefined }[]>([])
    const [policyTypeOptions, setPolicyTypeOptions] = useState<{ label: string, value: string | undefined }[]>([])

    const { id } = useParams()
    const { setPreviewImages } = useImagePreview()
    const navigate = useNavigate()

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit Policy" : "Add Policy",
        backLink: "../",
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
            name: "type",
            type: "autoComplete",
            placeholder: "Select Type",
            options: policyTypeOptions,
            rules: { required: true }
        },
        {
            name: "provider",
            type: "text",
            placeholder: "Provider",
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
            label: "Document",
            rules: { required: true, file: true }
        },
    ]

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = (values: FormValues) => {
        const product = products?.result.find(item => item._id === values.product)
        const type = policyTypes?.result.find(item => item._id === values.type)

        let updatedData = values
        if (product && type) {
            updatedData = {
                ...values,
                product: { _id: product._id, name: product.name },
                type: { _id: type._id, name: type.name }
            }
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
            updatePolicy({ id, policyData: formData })
        } else {
            addPolicy(formData)
        }

    }

    const { handleSubmit, renderSingleInput, setValue, reset } = useDynamicForm({ fields, defaultValues, schema, onSubmit })

    useEffect(() => {
        if (id && data) {
            setValue("product", data.product?._id || "")
            setValue("type", data.type?._id || "")
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
            setTimeout(() => {
                navigate("/policies")
            }, 2000);
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            setTimeout(() => {
                navigate("/policies")
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
                            {renderSingleInput("product")}
                        </Grid2>

                        {/* Brand */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                            {renderSingleInput("type")}
                        </Grid2>

                        {/* Model */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                            {renderSingleInput("provider")}
                        </Grid2>

                        {/* Purchase Date */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                            {renderSingleInput("expiryDate")}
                        </Grid2>

                        {/* Image */}
                        <Grid2 size={{ xs: 12 }} >
                            {renderSingleInput("document")}
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

export default AddPolicy