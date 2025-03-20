import { BrowserRouter, Route, Routes } from "react-router-dom"
import Layout from "./components/Layout"
import Products from "./pages/products/Products"
import { createTheme, ThemeProvider } from "@mui/material"
import AddProduct from "./pages/products/AddProduct";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PageNotFound from "./pages/PageNotFound";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Brands from "./pages/brand/Brands";
import AddBrand from "./pages/brand/AddBrand";
import { ImageContextProvider } from "./context/ImageContext";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#FFFFFF",
      contrastText: "#000000",
    },
    secondary: {
      main: "#00c979",
    },
  },
  // typography: {
  //   fontFamily: "ArcaMajora, Arial, sans-serif",
  // },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 1000,
      lg: 1200,
      xl: 1536,
    },
  },
});


const App = () => {
  return <>
    <ThemeProvider theme={theme}>
      <ImageContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />} >

              <Route index element={<Dashboard />} />

              <Route path="products">
                <Route index element={<Products />} />
                <Route path="add" element={<AddProduct />} />
                <Route path="update/:id" element={<AddProduct />} />
              </Route>

              <Route path="brands">
                <Route index element={<Brands />} />
                <Route path="add" element={<AddBrand />} />
                <Route path="update/:id" element={<AddBrand />} />
              </Route>

            </Route>

            <Route path="sign-in" element={<Login />} />
            <Route path="sign-up" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="*" element={<PageNotFound />} />

          </Routes>
        </BrowserRouter >
      </ImageContextProvider>
    </ThemeProvider>
  </>
}

export default App

