import { FormControl, InputLabel, MenuItem, Paper, Select, Stack } from '@mui/material'
import React from 'react'
import { IFieldProps } from '../hooks/useDynamicForm'

const selectStyles = {
    '& .MuiOutlinedInput-root': {
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: '1px solid #00c979',
        },
        '& .MuiSvgIcon-root': {
            color: '#00c979',
        },
        '& .MuiInputBase-root': {
            color: '#00c979',
        },
        '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px #f6fffb inset',
            WebkitTextFillColor: '#000',
        },
    },
    '& .MuiInputLabel-root': {
        color: 'gray',
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: '#00c979',
    },
};

const Selects: React.FC<IFieldProps> = ({ controllerField, field, errors }) => {
    return <>
        <Paper >
            <Stack>
                <FormControl fullWidth sx={selectStyles} error={Boolean(errors)}>
                    <InputLabel>{field.placeholder}</InputLabel>
                    <Select
                        {...controllerField}
                        value={controllerField.value || ""}
                        onChange={controllerField.onChange}

                    >
                        {field.options && field.options.length > 0 ? (
                            field.options.map((item, i) => (
                                <MenuItem key={i} value={item.label} disabled={item.disabled}>
                                    {item.label}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>No {field.label || "Data"} Found</MenuItem>
                        )}
                    </Select>
                </FormControl>
            </Stack>
        </Paper >
    </>
}

export default Selects