import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Toast from '../../components/Toast'
import { useAddNotificationMutation, useGetNotificationByIdQuery, useUpdateNotificationMutation } from '../../redux/apis/notification.api'
import { INotification } from '../../models/notification.interface'
import { useGetProductsQuery } from '../../redux/apis/product.api'
import { useGetPoliciesQuery } from '../../redux/apis/policy.api'

const defaultValues = {
    product: "",
    policy: "",
    message: "",
    scheduleDate: ""
}

const AddPolicyType = React.memo(() => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [productOptions, setProductOptions] = useState<{ label?: string, value?: string }[]>([])
    const [policyOptions, setPolicyOptions] = useState<{ label?: string, value?: string }[]>([])

    const [addNotification, addStatus] = useAddNotificationMutation()
    const [updateNotification, updateStatus] = useUpdateNotificationMutation()
    const { data } = useGetNotificationByIdQuery(id as string, { skip: !id })
    const { data: products } = useGetProductsQuery({ isFetchAll: true })
    const { data: policies } = useGetPoliciesQuery({ isFetchAll: true })

    const config: DataContainerConfig = useMemo(() => ({
        pageTitle: id ? "Edit Notification" : "Add Notification",
        backLink: "../",
    }), [id])

    const fields: FieldConfig[] = useMemo(() => [
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
    ], [productOptions, policyOptions])


    const handleSave = useCallback(
        (values: z.infer<ReturnType<typeof customValidator>>) => {
            const product = products?.result.find(item => item._id === values.product)
            const policy = policyOptions.find(item => item.value === values.policy)

            let updatedData = values
            if (product && policy) {
                updatedData = {
                    ...values,
                    product: { _id: product._id, name: product.name },
                    policy: { _id: policy.value, name: policy.label },
                    type: "notification"
                }
            }

            if (id && data) {
                updateNotification({ id, notificationData: updatedData as INotification })
            } else {
                addNotification(updatedData as INotification)
            }
        }, [id, data, addNotification, updateNotification, products, policyOptions])

    const { handleSubmit, renderSingleInput, setValue, reset, watch } = useDynamicForm({
        fields,
        defaultValues,
        schema: customValidator(fields),
        onSubmit: handleSave
    })

    useEffect(() => {
        if (products?.result) {
            const transformedData = products.result.map((item) => {
                return { label: item.name, value: item._id }
            })
            setProductOptions(transformedData)
        }
    }, [products?.result])

    useEffect(() => {
        if (policies?.result) {
            const subscription = watch(({ product }) => {
                if (product) {
                    const transformedData = policies.result
                        .filter((item) => item.product?._id === product)
                        .map((policy) => ({ label: policy.name.name, value: policy._id }))

                    setPolicyOptions(transformedData)
                }
            });

            return () => subscription.unsubscribe();
        }
    }, [policies?.result, watch]);

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
    }, [id, data, products, setValue])

    useEffect(() => {
        if (addStatus.isSuccess || updateStatus.isSuccess) {
            const timeout = setTimeout(() => navigate('/notifications'), 2000)
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

                        {/* Product */}
                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                            {renderSingleInput("product")}
                        </Grid2>

                        {/* Policy */}
                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }} >
                            {renderSingleInput("policy")}
                        </Grid2>

                        {/* Schedule Date */}
                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }} >
                            {renderSingleInput("scheduleDate")}
                        </Grid2>

                        {/* Message */}
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

export default AddPolicyType