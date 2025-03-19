import { Box, Button, Container, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, TextField, Typography } from '@mui/material'
import { useState } from 'react';
import { Link } from 'react-router-dom'
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
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
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: '#00c979',
    },
};

const Register = () => {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    return <>
        <Container
            component="main"
            maxWidth="xs"
            sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
            <Paper elevation={3} sx={{ padding: 4, width: "100%", textAlign: "center" }}>
                <Typography variant="h5" fontWeight="bold" mb={3}>
                    Sign Up
                </Typography>
                <Box component="form" sx={{ mt: 1 }}>

                    {/* Name  */}
                    <TextField
                        fullWidth
                        label="Name"
                        type="text"
                        variant="outlined"
                        margin="normal"
                        sx={textFieldStyles}
                    />

                    {/* Email Address */}
                    <TextField
                        fullWidth
                        label="Email Address"
                        type="text"
                        variant="outlined"
                        margin="normal"
                        sx={textFieldStyles}
                    />

                    {/* Phone Number */}
                    <TextField
                        fullWidth
                        label="Phone Number"
                        type="text"
                        variant="outlined"
                        margin="normal"
                        sx={textFieldStyles}
                    />

                    {/* Email Address */}
                    <FormControl fullWidth margin="normal" variant="outlined" sx={textFieldStyles}>
                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
                            type={showPassword ? 'text' : 'password'}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={
                                            showPassword ? 'hide the password' : 'display the password'
                                        }
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        onMouseUp={handleMouseUpPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Password"
                        />
                    </FormControl>

                    {/* Submit Button */}
                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2, backgroundColor: "#00c979", color: "white" }}
                    >
                        Sign Up
                    </Button>

                </Box>

                {/* Register Link */}
                <Typography variant="body2" mt={3}>
                    Already have an account?{" "}
                    <Link to="/sign-in" style={{ color: "#00c979", textDecoration: "none" }}>
                        Sign In here
                    </Link>
                </Typography>
            </Paper>
        </Container>
    </>
}

export default Register