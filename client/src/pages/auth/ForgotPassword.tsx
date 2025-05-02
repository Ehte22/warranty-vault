import React, { useMemo } from "react";
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import { FieldConfig } from "../../hooks/useDynamicForm";
import { customValidator } from "../../utils/validator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPasswordMutation } from "../../redux/apis/auth.api";
import Toast from "../../components/Toast";

const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
        height: "44px",
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
        transform: 'translate(14px, 11px) scale(1)',
        '&.Mui-focused, &.MuiFormLabel-filled': {
            transform: 'translate(14px, -6px) scale(0.75)',
        },
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: '#00c979',
    },
};

const fields: FieldConfig[] = [
    {
        name: "email",
        label: "Email Address",
        type: "text",
        rules: { required: true }
    },
]


const ForgotPassword: React.FC = React.memo(() => {

    const [forgotPassword, { data, error, isSuccess, isError, isLoading }] = useForgotPasswordMutation()

    const schema = useMemo(() => customValidator(fields), [])

    type FormValues = z.infer<typeof schema>

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } })

    const onSubmit = (values: FormValues) => {
        forgotPassword(values.email)
    }

    return <>
        {isSuccess && <Toast type="success" message={data} />}
        {isError && <Toast type="error" message={error as string} />}
        <Container
            component="main"
            maxWidth={false}
            sx={{ minHeight: "100vh", maxWidth: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
            <Paper elevation={3} sx={{ padding: 4, width: "100%", textAlign: "center" }}>
                <Typography variant="h5" fontWeight="bold" mb={3}>
                    Forgot Password?
                </Typography>

                <Typography sx={{ color: "gray" }} mb={3}>
                    Enter your email address below, and we’ll send you a password reset link.
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
                    {/* Email */}
                    <TextField
                        {...register("email")}
                        fullWidth
                        label="Email"
                        type="email"
                        variant="outlined"
                        margin="normal"
                        sx={textFieldStyles}
                        error={!!errors.email}
                        helperText={errors.email?.message as string}
                    />

                    {/* Submit Button */}
                    <Button
                        fullWidth
                        type="submit"
                        loading={isLoading}
                        variant="contained"
                        color="primary"
                        sx={{ my: 2, backgroundColor: "#00c979", color: "white" }}
                    >
                        Send
                    </Button>

                    {/* Back Link */}
                    <Link to="/sign-in" style={{ textDecoration: "none", color: "black" }}>
                        Back to Sign in
                    </Link>
                </Box>
            </Paper>
        </Container>
    </>

})

export default ForgotPassword;
