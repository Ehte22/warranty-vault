import React from "react";
import { Button } from "@mui/material";
import { FcGoogle } from "react-icons/fc";

const GoogleLoginButton: React.FC = () => {
    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/google`
    };

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
