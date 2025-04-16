import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import Toast from '../../components/Toast'
import { useAddPolicyTypeMutation, useGetPolicyTypeByIdQuery, useUpdatePolicyTypeMutation } from '../../redux/apis/policyType.api'

const fields: FieldConfig[] = [
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
]

const defaultValues = {
    name: "",
    description: "",
}

const AddPolicyType = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [addPolicyType, { data: addData, error: addError, isLoading: addLoading, isSuccess: isAddSuccess, isError: isAddError }] = useAddPolicyTypeMutation()
    const [updatePolicyType, { data: updateData, error: updateError, isLoading: updateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdatePolicyTypeMutation()
    const { data } = useGetPolicyTypeByIdQuery(id as string, { skip: !id })

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit Policy Type" : "Add Policy Type",
        backLink: "../",
    }

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = (values: FormValues) => {
        const policyTypeData = { name: values.name, description: values.description, type: "policyType" }
        if (id && data) {
            updatePolicyType({ id, policyTypeData })
        } else {
            addPolicyType(policyTypeData)
        }
    }

    const { handleSubmit, renderSingleInput, setValue, reset } = useDynamicForm({ fields, defaultValues, schema, onSubmit })

    useEffect(() => {
        if (id && data) {
            setValue("name", data.name)
            setValue("description", data.description)
        }
    }, [id, data])

    useEffect(() => {
        if (isAddSuccess) {
            const timeout = setTimeout(() => {
                navigate("/policy-types")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            const timeout = setTimeout(() => {
                navigate("/policy-types")
            }, 2000);
            return () => clearTimeout(timeout)
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
                            {renderSingleInput("description")}
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