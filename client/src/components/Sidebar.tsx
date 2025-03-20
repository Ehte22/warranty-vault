import { styled, Theme, CSSObject } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { CssBaseline, Typography } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from "react-router-dom";

const NAVIGATION = [

    {
        segment: '/',
        title: 'Dashboard',
        icon: <FontAwesomeIcon icon={faGlobe} fontSize={'20px'} color='#00c979' />,
    },
    {
        segment: 'products',
        title: 'Products',
        icon: <FontAwesomeIcon icon={faGlobe} fontSize={'20px'} color='#00c979' />,
    },
    {
        segment: 'policies',
        title: 'Policies',
        icon: <FontAwesomeIcon icon={faGlobe} fontSize={'20px'} color='#00c979' />,
    },
    {
        segment: 'plans',
        title: 'Plans',
        icon: <FontAwesomeIcon icon={faGlobe} fontSize={'20px'} color='#00c979' />,
    },
    {
        segment: 'notifications',
        title: 'Notifications',
        icon: <FontAwesomeIcon icon={faGlobe} fontSize={'20px'} color='#00c979' />,
    },
];

const drawerWidth = 320;
const navbarHeight = 64;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        height: `calc(100vh - ${navbarHeight}px)`,
        top: navbarHeight,
        boxSizing: "border-box",
        position: "absolute",
        ...(open ? openedMixin(theme) : closedMixin(theme)),
        "& .MuiDrawer-paper": {
            position: "absolute",
            ...(open ? openedMixin(theme) : closedMixin(theme)),
        },
    })
);


const Sidebar = ({ open }: { open: boolean }) => {

    const location = useLocation()

    return <>
        <CssBaseline />
        <Drawer sx={{ position: "fixed" }} variant="permanent" open={open}>
            <List>
                {NAVIGATION.map((item, index) => {
                    const isActive = location.pathname.startsWith(item.segment);

                    return <ListItem key={index} disablePadding sx={{ display: "block" }}>
                        <ListItemButton
                            component={Link}
                            to={item.segment}
                            sx={{
                                minHeight: 48,
                                px: 2.5,
                                justifyContent: open ? "initial" : "center",
                                // backgroundColor: isActive ? "#f0f0f0" : "transparent",

                            }}
                        >
                            <ListItemIcon
                                sx={{ minWidth: 0, justifyContent: "center", mr: open ? 3 : "auto" }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography variant="body1" fontWeight={500}>
                                        {item.title}
                                    </Typography>
                                }
                                sx={{ opacity: open ? 1 : 0 }}
                            />
                        </ListItemButton>
                    </ListItem>
                })}
            </List>
        </Drawer>
    </>
};

export default Sidebar;
