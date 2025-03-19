import React from 'react'
import { Box, Button, Grid2, IconButton, Paper, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faRotate } from '@fortawesome/free-solid-svg-icons';
import SearchIcon from '@mui/icons-material/Search';
import { useLocation, useNavigate } from 'react-router-dom';

export interface DataContainerConfig {
    pageTitle?: string;
    backLink?: string;
    showAddBtn?: boolean;
    showSearchBar?: boolean;
    showPagination?: boolean;
    showRefreshButton?: boolean;
    table?: boolean;
    tableData?: any
    tableColumns?: any
    totalRecords?: any
    totalPages?: any
    onSearch?: any
    onPageChange?: any
    pageIndex?: number
    pageSize?: number
}

export interface DataContainerProps {
    config: DataContainerConfig
}

const DataContainer: React.FC<DataContainerProps> = ({ config }) => {
    const theme = useTheme()
    const isXsScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const location = useLocation()
    const navigate = useNavigate()

    const handleAdd = () => {
        navigate(`${location.pathname.replace(/\/$/, '')}/add`)
    }

    const handleBack = () => {
        navigate(`${config.backLink}`)
    }

    const handleReload = () => {
        window.location.reload()
    }

    return <>
        <Paper sx={{ p: 2 }}>
            <Stack>
                <Grid2 container spacing={config.showAddBtn ? 2 : 0}>
                    <Grid2 size={{ xs: 12, sm: 3 }} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography
                            variant='h6'
                            sx={{ fontSize: '19px' }}>
                            {config.pageTitle}
                        </Typography>

                        {
                            isXsScreen && <Box sx={{ display: "flex", gap: 1.5, alignItems: 'center' }}>
                                {
                                    config.showRefreshButton && <IconButton
                                        onClick={handleReload}
                                        sx={{
                                            backgroundColor: "#00c979",
                                            borderRadius: "4px",
                                            px: "10px",
                                            color: "white",
                                            boxShadow: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
                                            ":hover": { backgroundColor: "#00c979", boxShadow: "0px 2px 4px rgba(0,0,0,0.2)" }
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faRotate} fontSize="16px" />
                                    </IconButton>
                                }

                                {
                                    config.showAddBtn && <IconButton
                                        onClick={handleAdd}
                                        sx={{
                                            backgroundColor: "#00c979",
                                            borderRadius: "4px",
                                            px: "12px",
                                            color: "white",
                                            boxShadow: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
                                            ":hover": { backgroundColor: "#00c979", boxShadow: "0px 2px 4px rgba(0,0,0,0.2)" }
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faPlus} fontSize="16px" />
                                    </IconButton>
                                }


                                {
                                    config.backLink && <Button
                                        onClick={handleBack}
                                        variant='contained' size='small'
                                        sx={{ backgroundColor: '#00c979', color: "white", py: 0.65 }}>
                                        Back
                                    </Button>
                                }
                            </Box>
                        }
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 9 }} >
                        <Box sx={{ display: "flex", gap: 1.5, alignItems: 'center', justifyContent: "flex-end" }}>

                            {
                                config.showSearchBar && <TextField
                                    id="search"
                                    label="Search"
                                    variant="outlined"
                                    size="small"
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <IconButton type="button" aria-label="search" size="small">
                                                    <SearchIcon />
                                                </IconButton>
                                            ),
                                            sx: { pr: 0.5 },
                                        },
                                    }}
                                    sx={{
                                        mr: { sm: 1 },
                                        width: { xs: "100%", sm: "280px" },
                                        backgroundColor: 'white',
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                border: '1px solid black',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                color: 'gray',
                                            },
                                            '& .MuiInputBase-root': {
                                                color: 'black',
                                            },
                                            '& input:-webkit-autofill': {
                                                WebkitBoxShadow: '0 0 0 100px black inset',
                                                WebkitTextFillColor: 'black',
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: 'gray',
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black',
                                        },
                                    }}
                                />
                            }

                            {
                                !isXsScreen && <>
                                    {
                                        config.showRefreshButton && <IconButton
                                            onClick={handleReload}
                                            sx={{
                                                backgroundColor: "#00c979",
                                                borderRadius: "4px",
                                                px: "10px",
                                                color: "white",
                                                boxShadow: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
                                                ":hover": { backgroundColor: "#00c979", boxShadow: "0px 2px 4px rgba(0,0,0,0.2)" }
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faRotate} fontSize="16px" />
                                        </IconButton>
                                    }

                                    {
                                        config.showAddBtn && <IconButton
                                            onClick={handleAdd}
                                            sx={{
                                                backgroundColor: "#00c979",
                                                borderRadius: "4px",
                                                px: "12px",
                                                color: "white",
                                                boxShadow: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
                                                ":hover": { backgroundColor: "#00c979", boxShadow: "0px 2px 4px rgba(0,0,0,0.2)" }
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPlus} fontSize="16px" />
                                        </IconButton>
                                    }

                                    {
                                        config.backLink && <Button
                                            onClick={handleBack}
                                            variant='contained' size='small'
                                            sx={{ backgroundColor: '#00c979', color: "white", py: 0.65 }}>
                                            Back
                                        </Button>
                                    }
                                </>
                            }

                        </Box>
                    </Grid2>

                </Grid2>
            </Stack>
        </Paper>
    </>
}

export default DataContainer