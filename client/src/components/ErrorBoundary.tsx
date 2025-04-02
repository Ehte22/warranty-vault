import React, { Component, ReactNode } from "react";
import { Button, Card, CardContent, Typography, Box } from "@mui/material";

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    errorMessage?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, errorMessage: "" };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, errorMessage: error.message };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, errorMessage: "" });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" height="100">
                    <Card sx={{ textAlign: "center", bgcolor: "#ffebee", p: 3, borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h5" color="error" fontWeight="bold">
                                Something went wrong!
                            </Typography>
                            <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                                {this.state.errorMessage}
                            </Typography>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={this.handleReset}
                                sx={{ mt: 3 }}
                            >
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
