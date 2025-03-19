import useDynamicForm, { FieldConfig } from '../hooks/useDynamicForm'
import { Box } from '@mui/material'
import { customValidator } from '../utils/validator'
import { z } from 'zod'

const fields: FieldConfig[] = [
    {
        name: "name",
        type: "text",
        placeholder: "Enter Clinic Name",
        rules: { required: true }
    },
    {
        name: "age",
        type: "text",
        placeholder: "Enter Clinic Name",
        rules: { required: true }
    },
    {
        name: "country",
        placeholder: "Select Country",
        type: "select",
        options: [
            { label: "India", value: "India" },
            { label: "United States", value: "United States" },
            { label: "United Kingdom", value: "United Kingdom" },
            { label: "Australia", value: "Australia" }
        ],
        className: "sm:col-span-3 xl:col-span-2 mb-8",
        rules: { required: true }
    },
]

const defaultValues = {
    name: "",
    age: "",
    country: ""
}

const Test = () => {

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = (values: FormValues) => {
        console.log(values);

    }

    // Dynamic Form
    const { renderSingleInput, handleSubmit, }
        = useDynamicForm({ schema, fields, onSubmit, defaultValues })

    return <>
        <Box>
            <form onSubmit={handleSubmit(onSubmit)}>
                {renderSingleInput("name")}
                {renderSingleInput("age")}
                {renderSingleInput("country")}



                <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    Save
                </button>
            </form>
        </Box>
    </>
}

export default Test