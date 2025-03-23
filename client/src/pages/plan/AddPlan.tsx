import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Toast from '../../components/Toast'
import { useAddPlanMutation, useGetPlanByIdQuery, useUpdatePlanMutation } from '../../redux/apis/plan.api'
import { IPlan } from '../../models/plan.interface'

const defaultValues = {
    name: "",
    billingCycle: "",
    price: "",
    maxBrands: "",
    maxProducts: "",
    maxPolicies: "",
    maxPolicyTypes: "",
}

const AddPlan = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [selectedPlan, setSelectedPlan] = useState("")
    const [fields, setFields] = useState<FieldConfig[]>([
        {
            name: "name",
            type: "select",
            placeholder: "Name",
            options: [
                { label: "Free", value: "Free" },
                { label: "Pro", value: "Pro" },
                { label: "Family", value: "Family" }
            ],
            rules: { required: true }
        },
    ])

    const [addPlan, { data: addData, error: addError, isLoading: addLoading, isSuccess: isAddSuccess, isError: isAddError }] = useAddPlanMutation()
    const [updatePlan, { data: updateData, error: updateError, isLoading: updateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdatePlanMutation()
    const { data } = useGetPlanByIdQuery(id as string, { skip: !id })

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit Plan" : "Add Plan",
        backLink: "../",
    }

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = (values: FormValues) => {
        if (id && data) {
            updatePlan({ id, planData: values as IPlan })
        } else {
            addPlan(values as IPlan)
        }
    }

    const { handleSubmit, renderSingleInput, setValue, reset, watch } = useDynamicForm({ fields, defaultValues, schema, onSubmit })

    useEffect(() => {
        const subscription = watch((values) => {
            setSelectedPlan(values.name)
            if (values.name === "Pro" || values.name === "Family") {
                setFields([
                    ...fields,
                    {
                        name: "billingCycle",
                        type: "select",
                        placeholder: "Select Type",
                        options: [
                            { label: "Monthly", value: "Monthly" },
                            { label: "Yearly", value: "Yearly" },
                        ],
                        rules: { required: true }
                    },
                    {
                        name: "price",
                        type: "text",
                        placeholder: "Price",
                        rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
                    },
                ])
            } else if (values.name === "Free") {
                setFields([
                    ...fields,
                    {
                        name: "maxProducts",
                        type: "text",
                        placeholder: "Max Products",
                        rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
                    },
                    {
                        name: "maxPolicies",
                        type: "text",
                        placeholder: "Max Policies",
                        rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
                    },
                    {
                        name: "maxPolicyTypes",
                        type: "text",
                        placeholder: "Max Policy Types",
                        rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
                    },
                    {
                        name: "maxBrands",
                        type: "text",
                        placeholder: "Max Brands",
                        rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
                    },
                ])
            } else {
                setFields([...fields])
            }
        })

        return () => subscription.unsubscribe()
    }, [watch])


    useEffect(() => {
        if (id && data) {
            setValue("name", data.name)
            setValue("billingCycle", data.billingCycle)
            setValue("price", data.price)

            if (data.maxBrands) setValue("maxBrands", data.maxBrands)
            if (data.maxProducts) setValue("maxProducts", data.maxProducts)
            if (data.maxPolicies) setValue("maxPolicies", data.maxProducts)
            if (data.maxPolicyTypes) setValue("maxPolicyTypes", data.maxProducts)

        }
    }, [id, data])

    useEffect(() => {
        if (isAddSuccess) {
            setTimeout(() => {
                navigate("/plans")
            }, 2000);
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            setTimeout(() => {
                navigate("/plans")
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

                        {/* Billing Cycle */}
                        {(selectedPlan === "Pro" || selectedPlan === "Family") &&
                            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                                {renderSingleInput("billingCycle")}
                            </Grid2>
                        }

                        {/* Price */}
                        {(selectedPlan === "Pro" || selectedPlan === "Family") &&
                            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                                {renderSingleInput("price")}
                            </Grid2>
                        }

                        {/* Max Brands */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                            {renderSingleInput("maxBrands")}
                        </Grid2>

                        {/* Max Products */}
                        {(selectedPlan === "Free") &&
                            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                                {renderSingleInput("maxProducts")}
                            </Grid2>
                        }

                        {/* Max Policies */}
                        {(selectedPlan === "Free") &&
                            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                                {renderSingleInput("maxPolicies")}
                            </Grid2>
                        }

                        {/* Max Policy Types */}
                        {(selectedPlan === "Free") &&
                            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                                {renderSingleInput("maxPolicyTypes")}
                            </Grid2>
                        }

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
            </Paper >
        </Box >
    </>
}

export default AddPlan