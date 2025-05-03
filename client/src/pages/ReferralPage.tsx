import React, { useEffect, useState } from 'react'
import { Typography, TextField, Button, Card, CardContent, List, ListItem, Box, Paper } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useGetUserByIdQuery } from '../redux/apis/user.api';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import Toast from '../components/Toast';

const ReferralPage = React.memo(() => {
    const [userId, setUserId] = useState<string>("")
    const [isCopied, setIsCopied] = useState(false)

    const { user } = useSelector((state: RootState) => state.auth)
    const { data } = useGetUserByIdQuery(userId, { skip: !userId })

    const handleCopy = () => {
        if (user?.referralLink) {
            navigator.clipboard.writeText(user.referralLink)
                .then(() => {
                    setIsCopied(true)
                    setTimeout(() => setIsCopied(false), 2000);
                })
        }
    };

    useEffect(() => {
        if (user && user._id) {
            setUserId(user._id)
        }
    }, [user])

    return <>
        {isCopied && <Toast type="success" message={"Referral Link Copied"} />}

        <Paper sx={{ mt: 2, pt: 4, pb: 3, px: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                Your Referral Link
            </Typography>

            <Box display="flex" gap={1} alignItems="center" justifyContent="center" mb={2}>
                <TextField
                    fullWidth
                    value={user?.referralLink || ""}
                    variant="outlined"
                    size='small'
                    slotProps={{
                        input: {
                            readOnly: true,
                        },
                    }}
                    sx={{
                        mr: { sm: 1 },
                        backgroundColor: 'white',
                        "& .MuiOutlinedInput-root": {
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "gray",
                                borderWidth: "1px",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "gray",
                                borderWidth: "1px",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "gray",
                                borderWidth: "1px",
                            },
                        },
                    }}
                />
                <Button variant="contained" onClick={handleCopy} sx={{ backgroundColor: "#00c979", color: "white", height: "40px" }} startIcon={<ContentCopyIcon />}>
                    Copy
                </Button>
            </Box>

            <Box
                sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                }}
            >
                <Typography variant="body1" fontWeight={500} color="textPrimary">
                    Earn Rewards with Referrals!
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    You earn <strong>100 points</strong> for each successful referral.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Your friend gets <strong>50 points</strong> when they sign up.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Coins can only be **redeemed when purchasing a paid plan**.
                </Typography>
            </Box>
        </Paper>
        <Paper sx={{ mt: 2, pt: 4, pb: 3, px: 3 }}>
            <Typography variant="h6" gutterBottom>
                Your Referrals
            </Typography>

            <Card variant="outlined">
                <CardContent>
                    {data?.referrals && data.referrals?.length > 0 ? (
                        <>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    p: 1.5,
                                    borderRadius: "6px",
                                }}
                            >
                                <Typography sx={{ width: "70%", fontWeight: 600, textAlign: "left" }}>
                                    Name
                                </Typography>
                                <Typography sx={{ width: "30%", fontWeight: 600, textAlign: "center" }}>
                                    Points
                                </Typography>
                            </Box>

                            <List sx={{ mt: 1 }}>
                                {data.referrals.map((user, index) => (
                                    <ListItem
                                        key={user._id}
                                        divider
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            p: 1.5,
                                            backgroundColor: index % 2 === 0 ? "#fafafa" : "white",
                                            borderRadius: "4px",
                                        }}
                                    >
                                        <Typography sx={{ width: "70%", textAlign: "left", fontWeight: 500 }}>
                                            {user.name}
                                        </Typography>
                                        <Typography sx={{ width: "30%", textAlign: "center", fontWeight: 500 }}>
                                            {data?.points && data.referrals?.length ? data.points / data.referrals.length : 100}
                                        </Typography>
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    ) : (
                        <Typography sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            No Referrals Yet.
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Paper>



    </>
})

export default ReferralPage