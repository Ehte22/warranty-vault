import React from "react";
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Divider,
    Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import GoogleLoginButton from "../../components/GoogleLoginButton";

const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
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


const SignInPage: React.FC = () => {

    return <>
        <Container
            component="main"
            maxWidth="xs"
            sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
            <Paper elevation={3} sx={{ padding: 4, width: "100%", textAlign: "center" }}>
                <Typography variant="h5" fontWeight="bold" mb={3}>
                    Sign In
                </Typography>
                <Box component="form" sx={{ mt: 1 }}>

                    <TextField
                        fullWidth
                        label="Username"
                        type="email"
                        variant="outlined"
                        margin="normal"
                        sx={textFieldStyles}
                    />

                    {/* Password Field */}
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        margin="normal"
                        sx={textFieldStyles}
                    />

                    {/* Submit Button */}
                    <Button
                        fullWidth
                        type="submit"
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

};

export default SignInPage;
