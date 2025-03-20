import React from "react";
import { Button } from "@mui/material";
import { FcGoogle } from "react-icons/fc"; // Google icon

const GoogleLoginButton: React.FC = () => {
    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:5000/api/v1/auth/google"
    };

    // const handleGoogleLogin = () => {
    //     window.open("http://localhost:5000/api/v1/auth/google", "_self")
    // };s

    return (
        <Button
            onClick={handleGoogleLogin}
            fullWidth
            variant="outlined"
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                color: "black",
                borderColor: "#ddd",
                textTransform: "none",
                "&:hover": {
                    backgroundColor: "#f5f5f5",
                },
            }}
        >
            <FcGoogle size={24} /> Sign in with Google
        </Button>
    );
};

export default GoogleLoginButton;
