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
    title: "",
    priority: "",
    monthlyPrice: "",
    yearlyPrice: "",
    maxBrands: "",
    maxProducts: "",
    maxPolicies: "",
    maxPolicyTypes: "",
    includes: [
        { item: "" }
    ]
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
        {
            name: "title",
            type: "text",
            placeholder: "Title",
            rules: { required: true }
        },
        {
            name: "priority",
            type: "text",
            placeholder: "Priority",
            rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
        },
        {
            name: "includes",
            type: "formArray",
            formArray: [
                {
                    name: "item",
                    type: "text",
                    placeholder: "Plan Includes",
                    rules: { required: true }
                }
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
        let updatedData = values

        const includes = values.includes.map(({ item }: any) => item)
        const price = { monthly: values.monthlyPrice, yearly: values.yearlyPrice }
        if (values.name === "Free") {
            updatedData = { ...values, includes }
        } else {
            updatedData = { ...values, includes, price }
        }

        if (id && data) {
            updatePlan({ id, planData: updatedData as IPlan })
        } else {
            addPlan(updatedData as IPlan)
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
                        name: "monthlyPrice",
                        type: "text",
                        placeholder: "Monthly Price",
                        rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
                    },
                    {
                        name: "yearlyPrice",
                        type: "text",
                        placeholder: "Yearly Price",
                        rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
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
            setValue("title", data.title)
            setValue("priority", data.priority)
            setValue("monthlyPrice", data.price.monthly || "")
            setValue("yearlyPrice", data.price.yearly || "")

            if (data.includes) {
                const x = data.includes.map((item) => ({ item }))
                setValue("includes", x)
            }

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

                        {/* Title */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("title")}
                        </Grid2>

                        {/* Priority */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("priority")}
                        </Grid2>

                        {/* Monthly Price */}
                        {(selectedPlan === "Pro" || selectedPlan === "Family") &&
                            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                                {renderSingleInput("monthlyPrice")}
                            </Grid2>
                        }

                        {/* Yearly Price */}
                        {(selectedPlan === "Pro" || selectedPlan === "Family") &&
                            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                                {renderSingleInput("yearlyPrice")}
                            </Grid2>
                        }

                        {/* Max Brands */}
                        {(selectedPlan === "Free") &&
                            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                                {renderSingleInput("maxBrands")}
                            </Grid2>
                        }

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

                        {/* plan Includes */}
                        {selectedPlan &&
                            <Grid2 size={{ xs: 12, md: 6, xl: 4 }} >
                                {renderSingleInput("includes")}
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