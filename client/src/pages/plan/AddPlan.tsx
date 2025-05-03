import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Toast from '../../components/Toast'
import { useAddPlanMutation, useGetPlanByIdQuery, useUpdatePlanMutation } from '../../redux/apis/plan.api'
import { IPlan } from '../../models/plan.interface'

const AddPlan = React.memo(() => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [selectedPlan, setSelectedPlan] = useState("")

    const baseFields: FieldConfig[] = [
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
            rules: {
                required: true,
                pattern: /^\d+$/,
                patternMessage: "Only numbers are allowed"
            }
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
    ]

    const [fields, setFields] = useState<FieldConfig[]>(baseFields)

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
        maxNotifications: "",
        maxFamilyMembers: "",
        includes: [
            { item: "" }
        ]
    }

    const [addPlan, add] = useAddPlanMutation()
    const [updatePlan, update] = useUpdatePlanMutation()
    const { data } = useGetPlanByIdQuery(id as string, { skip: !id })

    const config: DataContainerConfig = useMemo(() => ({
        pageTitle: id ? "Edit Plan" : "Add Plan",
        backLink: "../",
    }), [id])

    const handleSave = useCallback(
        (values: z.infer<ReturnType<typeof customValidator>>) => {
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
        }, [id, data, addPlan, updatePlan])

    const { handleSubmit, renderSingleInput, setValue, reset, watch } = useDynamicForm({
        fields,
        defaultValues,
        schema: customValidator(fields),
        onSubmit: handleSave
    })

    const updateFieldsForPlan = (planName: string) => {
        let dynamicFields: FieldConfig[] = []

        if (planName === "Pro" || planName === "Family") {
            dynamicFields = [
                {
                    name: "monthlyPrice",
                    type: "text",
                    placeholder: "Monthly Price",
                    rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
                },
                {
                    name: "yearlyPrice",
                    type: "text",
                    placeholder: "Yearly Price",
                    rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
                }
            ]
            if (planName === "Family") {
                dynamicFields.push({
                    name: "maxFamilyMembers",
                    type: "text",
                    placeholder: "Max Family Members",
                    rules: {
                        required: true,
                        pattern: /^(Unlimited|\d+)$/,
                        patternMessage: "Only numbers or 'Unlimited' are allowed"
                    }
                })
            }
        }

        if (planName === "Free") {
            dynamicFields = [
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
                {
                    name: "maxNotifications",
                    type: "text",
                    placeholder: "Max Notifications",
                    rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
                }
            ]
        }

        setFields([...baseFields, ...dynamicFields])
    }

    useEffect(() => {
        const subscription = watch((values) => {
            const planName = values.name
            if (planName && planName !== selectedPlan) {
                setSelectedPlan(planName)
                updateFieldsForPlan(planName)
            }
        })

        return () => subscription.unsubscribe()
    }, [watch, selectedPlan])


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
            if (data.maxPolicies) setValue("maxPolicies", data.maxPolicies)
            if (data.maxPolicyTypes) setValue("maxPolicyTypes", data.maxPolicyTypes)
            if (data.maxNotifications) setValue("maxNotifications", data.maxNotifications)
            if (data.maxFamilyMembers) setValue("maxFamilyMembers", data.maxFamilyMembers)

        }
    }, [id, data, setValue])

    useEffect(() => {
        if (add.isSuccess || update.isSuccess) {
            const timeout = setTimeout(() => navigate('/plans'), 2000)
            return () => clearTimeout(timeout)
        }
    }, [add.isSuccess, update.isSuccess, navigate])

    return <>
        {add.isSuccess && <Toast type="success" message={add.data?.message} />}
        {add.isError && <Toast type="error" message={String(add.error)} />}
        {update.isSuccess && <Toast type={update.data === 'No Changes Detected' ? 'info' : 'success'} message={update.data} />}
        {update.isError && <Toast type="error" message={String(update.error)} />}

        <Box>
            <DataContainer config={config} />
            <Paper sx={{ mt: 2, pt: 4, pb: 3 }}>
                <Box component="form" onSubmit={handleSubmit(handleSave)}>
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

                        {/* Max Family Members */}
                        {selectedPlan === "Family" &&
                            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                                {renderSingleInput("maxFamilyMembers")}
                            </Grid2>
                        }

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

                        {/* Max Notifications */}
                        {(selectedPlan === "Free") &&
                            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} >
                                {renderSingleInput("maxNotifications")}
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
                            loading={id ? update.isLoading : add.isLoading}
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
})

export default AddPlan