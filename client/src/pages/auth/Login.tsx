import React, { useCallback, useEffect, useMemo } from "react";
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Divider,
    Box,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import GoogleLoginButton from "../../components/GoogleLoginButton";
import { FieldConfig } from "../../hooks/useDynamicForm";
import { customValidator } from "../../utils/validator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignInMutation } from "../../redux/apis/auth.api";
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

const Login: React.FC = React.memo(() => {

    const [signIn, { data, error, isSuccess, isError, isLoading }] = useSignInMutation()

    const navigate = useNavigate()

    const fields: FieldConfig[] = useMemo(() => [
        {
            name: "username",
            label: "Username",
            type: "text",
            rules: { required: true }
        },
        {
            name: "password",
            label: "Password",
            type: "text",
            rules: { required: true }
        },
    ], [])

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { username: "", password: "" } })

    const onSubmit = useCallback((values: FormValues) => {
        signIn({ username: values.username, password: values.password })
    }, [signIn])

    useEffect(() => {
        if (isSuccess) {
            const timeout = setTimeout(() => {
                navigate("/")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isSuccess, navigate])


    return <>
        {isSuccess && <Toast type="success" message={data.message} />}
        {isError && <Toast type="error" message={String(error)} />}
        <Container
            component="main"
            maxWidth={false}
            sx={{ minHeight: "100vh", maxWidth: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
            <Paper elevation={3} sx={{ padding: 4, width: "100%", textAlign: "center" }}>
                <Typography variant="h5" fontWeight="bold" mb={3}>
                    Sign In
                </Typography>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>

                    {/* Username */}
                    <TextField
                        {...register("username")}
                        fullWidth
                        label="Username"
                        type="text"
                        variant="outlined"
                        margin="normal"
                        sx={textFieldStyles}
                        error={!!errors.username}
                        helperText={errors.username?.message as string}
                    />

                    {/* Password */}
                    <TextField
                        {...register("password")}
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        margin="normal"
                        sx={textFieldStyles}
                        error={!!errors.password}
                        helperText={errors.password?.message as string}
                    />

                    {/* Forgot Link */}
                    <Box sx={{ textAlign: "end", mb: 1 }}>
                        <Link to="/forgot-password" style={{ textDecoration: "none", color: "black", fontWeight: 550 }}>
                            Forgot Password?
                        </Link>
                    </Box>

                    {/* Submit Button */}
                    <Button
                        fullWidth
                        type="submit"
                        loading={isLoading}
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2, backgroundColor: "#00c979", color: "white" }}
                    >
                        Login
                    </Button>

                    <Divider sx={{ my: 2 }}>OR</Divider>

                    {/* Google Login Button */}
                    <Box mt={2} display="flex" justifyContent="center">
                        <GoogleLoginButton />
                    </Box>
                </Box>

                {/* Register Link */}
                <Typography variant="body2" mt={3}>
                    Don't have an account?{" "}
                    <Link to="/sign-up" style={{ color: "#00c979", textDecoration: "none" }}>
                        Sign Up here
                    </Link>
                </Typography>
            </Paper>
        </Container>
    </>

})

export default Login;
