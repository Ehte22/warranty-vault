import { Autocomplete, Paper, TextField } from '@mui/material'
import React from 'react'
import { IFieldProps } from '../hooks/useDynamicForm'
import { textFieldStyles } from './Inputs'

const AutoComplete: React.FC<IFieldProps> = ({ controllerField, field, errors }) => {
    const isError = Boolean(errors)
    return <>
        <Paper>
            <Autocomplete
                value={field.options?.find(opt => opt.value === controllerField.value) || null}
                onChange={(_, newValue) => {
                    if (newValue) {
                        controllerField.onChange(newValue.value);
                    }
                }}
                sx={textFieldStyles}
                disablePortal
                options={field?.options || []}
                renderInput={(params) => <TextField error={isError} {...params} label={field.placeholder} />}
            />
        </Paper>
    </>
}

export default AutoComplete