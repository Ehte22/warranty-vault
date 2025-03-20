import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'

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
    {
        name: "logo",
        type: "file",
        label: "Logo",
        multiple: true,
        placeholder: "Logo",
        rules: { required: false, file: true }
    },
]

const defaultValues = {
    name: "",
    description: "",
    logo: ""
}

const AddBrand = () => {
    const config: DataContainerConfig = {
        pageTitle: "Add Brand",
        backLink: "../",
    }

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = (values: FormValues) => {
        console.log(values);

        const formData = new FormData()

        Object.keys(values).forEach((key) => {
            if (typeof values[key] === "object") {
                Object.keys(values[key]).forEach((item) => {
                    formData.append(key, values[item])
                })
            } else {
                formData.append(key, values[key])
            }
        })
    }

    const { handleSubmit, renderSingleInput, setValue, reset } = useDynamicForm({ fields, defaultValues, schema, onSubmit })

    return <>
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

                    {/* Name */}
                    <Grid2 size={{ xs: 12 }}>
                        {renderSingleInput("logo")}
                    </Grid2>

                </Grid2>

                <Divider sx={{ my: 4 }} />

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
                        variant='contained'
                        sx={{ ml: 2, background: "#00c979", color: "white", py: 0.65 }}>
                        Save
                    </Button>
                </Box>
            </Box>
        </Paper>

    </>
}

export default AddBrand