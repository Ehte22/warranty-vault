import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FieldConfig } from "../../hooks/useDynamicForm";
import { customValidator } from "../../utils/validator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPasswordMutation } from "../../redux/apis/auth.api";
import Toast from "../../components/Toast";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
        height: "44px",
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: '1px solid #00c979',
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

const ResetPassword: React.FC = React.memo(() => {

    const [isPassMatchError, setIsPassMatchError] = useState<boolean>(false)
    const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({
        password: false,
        cpassword: false
    })

    const [resetPassword, { data, error, isSuccess, isError, isLoading }] = useResetPasswordMutation()

    const navigate = useNavigate()

    const fields: FieldConfig[] = useMemo(() => [
        {
            name: "password",
            label: "Password",
            type: "text",
            rules: { required: true, min: 8, max: 16 }
        },
        {
            name: "confirmPassword",
            label: "Confirm Password",
            type: "text",
            rules: { required: true }
        },
    ], [])

    const handleClickShowPassword = (field: string) => {
        setShowPassword({ ...showPassword, [field]: !showPassword[field] })
    }

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
    }

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
    }

    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } })

    const onSubmit = useCallback(() => (values: FormValues) => {
        if (!isPassMatchError && token) {
            resetPassword({ password: values.password, confirmPassword: values.confirmPassword, token })
        }
    }, [isPassMatchError, token, resetPassword])

    useEffect(() => {
        const subscription = watch((values) => {
            if (values.password && values.password !== values.confirmPassword) {
                setIsPassMatchError(true);
            } else {
                setIsPassMatchError(false)
            }
        });

        return () => subscription.unsubscribe();
    }, [watch]);

    useEffect(() => {
        if (isSuccess) {
            const timeout = setTimeout(() => {
                navigate("/sign-in")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isSuccess, navigate])


    return <>
        {isSuccess && <Toast type="success" message={data} />}
        {isError && <Toast type="error" message={String(error)} />}
        <Container
            component="main"
            maxWidth={false}
            sx={{ minHeight: "100vh", maxWidth: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
            <Paper elevation={3} sx={{ padding: 4, width: "100%", textAlign: "center" }}>
                <Typography variant="h5" fontWeight="bold" mb={3}>
                    Create a New Password
                </Typography>

                <Typography sx={{ color: "gray" }} mb={3}>
                    Your password must be at least 8 characters long and match the confirmation.
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
                    {/* Password */}
                    <FormControl fullWidth margin="normal" variant="outlined" sx={textFieldStyles} error={!!errors.password} >
                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                        <OutlinedInput
                            {...register("password")}
                            id="outlined-adornment-password"
                            type={showPassword.password ? 'text' : 'password'}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={
                                            showPassword.password ? 'hide the password' : 'display the password'
                                        }
                                        onClick={() => handleClickShowPassword("password")}
                                        onMouseDown={handleMouseDownPassword}
                                        onMouseUp={handleMouseUpPassword}
                                        edge="end"
                                    >
                                        {showPassword.password ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Password"
                        />
                        <Typography variant="caption" color="error"
                            sx={{ textAlign: "left", display: "block", marginTop: "2px", marginLeft: "16px" }}>
                            {errors.password?.message as string}
                        </Typography>
                    </FormControl>

                    {/* Confirm Password */}
                    <FormControl fullWidth margin="normal" variant="outlined" sx={textFieldStyles} error={isPassMatchError && watch("confirmPassword") !== ""}>
                        <InputLabel htmlFor="outlined-adornment-cpassword">Confirm Password</InputLabel>
                        <OutlinedInput
                            {...register("confirmPassword")}
                            id="outlined-adornment-cpassword"
                            type={showPassword.cpassword ? 'text' : 'password'}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={
                                            showPassword.cpassword ? 'hide the password' : 'display the password'
                                        }
                                        onClick={() => handleClickShowPassword("cpassword")}
                                        onMouseDown={handleMouseDownPassword}
                                        onMouseUp={handleMouseUpPassword}
                                        edge="end"
                                    >
                                        {showPassword.cpassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Confirm Password"
                        />
                        {isPassMatchError && watch("confirmPassword") !== "" && (
                            <Typography variant="caption" color="error"
                                sx={{ textAlign: "left", display: "block", marginTop: "2px", marginLeft: "16px" }}>
                                Passwords do not match
                            </Typography>
                        )}
                        <Typography variant="caption" color="error"
                            sx={{ textAlign: "left", display: "block", marginTop: "2px", marginLeft: "16px" }}>
                            {errors.confirmPassword?.message as string}
                        </Typography>
                    </FormControl>

                    {/* Submit Button */}
                    <Button
                        fullWidth
                        type="submit"
                        loading={isLoading}
                        variant="contained"
                        color="primary"
                        sx={{ my: 2, backgroundColor: "#00c979", color: "white" }}
                    >
                        Reset Password
                    </Button>
                </Box>
            </Paper>
        </Container>
    </>

})

export default ResetPassword;
