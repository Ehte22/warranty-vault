import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import Toast from '../../components/Toast'
import { useAddPlanMutation, useGetPlanByIdQuery, useUpdatePlanMutation } from '../../redux/apis/plan.api'

const defaultValues = {
    name: "",
    billingCycle: "",
    price: "",
}

const AddPlan = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [addPlan, { data: addData, error: addError, isLoading: addLoading, isSuccess: isAddSuccess, isError: isAddError }] = useAddPlanMutation()
    const [updatePlan, { data: updateData, error: updateError, isLoading: updateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdatePlanMutation()
    const { data } = useGetPlanByIdQuery(id as string, { skip: !id })

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit Plan" : "Add Plan",
        backLink: "../",
    }

    const fields: FieldConfig[] = [
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
        }
    ]

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = (values: FormValues) => {
        if (id && data) {
            updatePlan({ id, planData: { name: values.name, billingCycle: values.billingCycle, price: values.price } })
        } else {
            addPlan({ name: values.name, billingCycle: values.billingCycle, price: values.price })
        }
    }

    const { handleSubmit, renderSingleInput, setValue, reset } = useDynamicForm({ fields, defaultValues, schema, onSubmit })

    useEffect(() => {
        if (id && data) {
            setValue("name", data.name)
            setValue("billingCycle", data.billingCycle)
            setValue("price", data.price)
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
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            {renderSingleInput("name")}
                        </Grid2>

                        {/* Description */}
                        <Grid2 size={{ xs: 12, md: 6 }} >
                            {renderSingleInput("billingCycle")}
                        </Grid2>

                        {/* Description */}
                        <Grid2 size={{ xs: 12, md: 6 }} >
                            {renderSingleInput("price")}
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

export default AddPlan