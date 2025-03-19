import React from "react";
import TextField from "@mui/material/TextField";
import { IFieldProps } from "../hooks/useDynamicForm";
import { Paper, Stack } from "@mui/material";

export const textFieldStyles = {
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

const Inputs: React.FC<IFieldProps> = ({ controllerField, field, errors, disabled }) => {
    const isError = Boolean(errors);

    return <>
        <Paper >
            <Stack>
                <TextField
                    {...controllerField}
                    type={field.type}
                    id={field.name}
                    label={field.placeholder}
                    variant="outlined"
                    sx={textFieldStyles}
                    fullWidth
                    error={isError}
                    disabled={disabled}
                />
            </Stack>
        </Paper>
    </>
};

export default Inputs;
