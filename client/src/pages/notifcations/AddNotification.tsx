import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Toast from '../../components/Toast'
import { useAddNotificationMutation, useGetNotificationByIdQuery, useUpdateNotificationMutation } from '../../redux/apis/notification.api'
import { INotification } from '../../models/notification.interface'
import { useGetProductsQuery } from '../../redux/apis/product.api'

const defaultValues = {
    product: "",
    policy: "",
    message: "",
    scheduleDate: ""
}

const AddPolicyType = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [productOptions, setProductOptions] = useState<{ label?: string, value?: string }[]>([])
    const [policyOptions, setPolicyOptions] = useState<{ label?: string, value?: string }[]>([])

    const [addNotification, { data: addData, error: addError, isLoading: addLoading, isSuccess: isAddSuccess, isError: isAddError }] = useAddNotificationMutation()
    const [updateNotification, { data: updateData, error: updateError, isLoading: updateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdateNotificationMutation()
    const { data } = useGetNotificationByIdQuery(id as string, { skip: !id })
    const { data: products } = useGetProductsQuery({ isFetchAll: true })

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit Notification" : "Add Notification",
        backLink: "../",
    }

    const fields: FieldConfig[] = [
        {
            name: "product",
            type: "autoComplete",
            placeholder: "product",
            options: productOptions,
            rules: { required: true }
        },
        {
            name: "policy",
            type: "autoComplete",
            placeholder: "policy",
            options: policyOptions,
            rules: { required: true }
        },
        {
            name: "scheduleDate",
            type: "date",
            placeholder: "Schedule Date",
            rules: { required: true }
        },
        {
            name: "message",
            type: "text",
            placeholder: "message",
            rules: { required: true }
        },
    ]

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = (values: FormValues) => {
        const product = products?.result.find(item => item._id === values.product)
        const policy = policyOptions.find(item => item.value === values.policy)

        let updatedData = values
        if (product && policy) {
            updatedData = {
                ...values,
                product: { _id: product._id, name: product.name },
                policy: { _id: policy.value, name: policy.label }
            }
        }

        if (id && data) {
            updateNotification({ id, notificationData: updatedData as INotification })
        } else {
            addNotification(updatedData as INotification)
        }
    }

    const { handleSubmit, renderSingleInput, setValue, reset, watch } = useDynamicForm({ fields, defaultValues, schema, onSubmit })

    useEffect(() => {
        if (products?.result) {
            const transformedData = products.result.map((item) => {
                return { label: item.name, value: item._id }
            })
            setProductOptions(transformedData)
        }
    }, [products?.result])

    useEffect(() => {
        const subscription = watch(({ product }) => {
            if (product) {
                const selectedProduct = products?.result.find(item => item._id === product);

                if (Array.isArray(selectedProduct?.policies)) {
                    const transformedPolicies = selectedProduct.policies.map(policy => ({
                        label: policy.name,
                        value: policy._id,
                    }));

                    setPolicyOptions(transformedPolicies)
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [products?.result, watch]);

    useEffect(() => {
        if (id && data) {
            setValue("product", data.product?._id)
            setValue("policy", data.policy?._id)
            setValue("scheduleDate", data.scheduleDate)
            setValue("message", data.message)


            const selectedProduct = products?.result.find(item => item._id === data.product?._id);

            if (Array.isArray(selectedProduct?.policies)) {
                const transformedPolicies = selectedProduct.policies.map(policy => ({
                    label: policy.name,
                    value: policy._id,
                }));

                setPolicyOptions(transformedPolicies)
            }
        }
    }, [id, data, products])

    useEffect(() => {
        if (isAddSuccess) {
            setTimeout(() => {
                navigate("/notifications")
            }, 2000);
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            setTimeout(() => {
                navigate("/notifications")
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
                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                            {renderSingleInput("product")}
                        </Grid2>

                        {/* Description */}
                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }} >
                            {renderSingleInput("policy")}
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }} >
                            {renderSingleInput("scheduleDate")}
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }} >
                            {renderSingleInput("message")}
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

export default AddPolicyType