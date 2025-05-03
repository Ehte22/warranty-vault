import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import React, { useCallback, useEffect } from 'react'
import Toast from '../../components/Toast'
import { useAddPolicyTypeMutation, useGetPolicyTypeByIdQuery, useUpdatePolicyTypeMutation } from '../../redux/apis/policyType.api'

const AddPolicyType = React.memo(() => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [addPolicyType, add] = useAddPolicyTypeMutation()
    const [updatePolicyType, update] = useUpdatePolicyTypeMutation()
    const { data } = useGetPolicyTypeByIdQuery(id as string, { skip: !id })

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit Policy Type" : "Add Policy Type",
        backLink: "../",
    }

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

    const handleSave = useCallback(
        (values: z.infer<ReturnType<typeof customValidator>>) => {
            const policyTypeData = { name: values.name, description: values.description, type: "policyType" }
            if (id && data) {
                updatePolicyType({ id, policyTypeData })
            } else {
                addPolicyType(policyTypeData)
            }
        }, [id, data, addPolicyType, updatePolicyType])

    const { handleSubmit, renderSingleInput, setValue, reset } = useDynamicForm({
        fields,
        defaultValues,
        schema: customValidator(fields),
        onSubmit: handleSave
    })

    useEffect(() => {
        if (id && data) {
            setValue("name", data.name)
            setValue("description", data.description)
        }
    }, [id, data, setValue])

    useEffect(() => {
        if (add.isSuccess || update.isSuccess) {
            const timeout = setTimeout(() => navigate('/policy-types'), 2000)
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
                            loading={add.isLoading || update.isLoading}
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