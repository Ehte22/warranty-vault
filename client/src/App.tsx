import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Box, createTheme, ThemeProvider } from "@mui/material";
import { ImageContextProvider } from "./context/ImageContext";
import Protected from "./components/Protected";
import ErrorBoundary from "./components/ErrorBoundary";
import Loader from "./components/Loader";

const Layout = lazy(() => import("./components/Layout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Products = lazy(() => import("./pages/products/Products"));
const AddProduct = lazy(() => import("./pages/products/AddProduct"));
const Brands = lazy(() => import("./pages/brand/Brands"));
const AddBrand = lazy(() => import("./pages/brand/AddBrand"));
const Policies = lazy(() => import("./pages/policy/Policies"));
const AddPolicy = lazy(() => import("./pages/policy/AddPolicy"));
const PolicyTypes = lazy(() => import("./pages/policy-types/PolicyTypes"));
const AddPolicyType = lazy(() => import("./pages/policy-types/AddPolicyType"));
const Plans = lazy(() => import("./pages/plan/Plans"));
const AddPlan = lazy(() => import("./pages/plan/AddPlan"));
const SelectPlan = lazy(() => import("./pages/plan/SelectPlan"));
const Notifications = lazy(() => import("./pages/notification/Notifications"));
const AddNotification = lazy(() => import("./pages/notification/AddNotification"));
const Users = lazy(() => import("./pages/users/Users"));
const AddUser = lazy(() => import("./pages/users/AddUsers"));
const Coupons = lazy(() => import("./pages/coupon/Coupons"));
const AddCoupon = lazy(() => import("./pages/coupon/AddCoupon"));
const ReferralPage = lazy(() => import("./pages/ReferralPage"));
const Profile = lazy(() => import("./pages/users/Profile"));
const UpgradePlan = lazy(() => import("./pages/plan/UpgradePlan"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#FFFFFF", contrastText: "#000000" },
    secondary: { main: "#00c979" },
  },
  breakpoints: { values: { xs: 0, sm: 600, md: 1000, lg: 1200, xl: 1536 } },
})

const App = () => {

  const x = localStorage.getItem("user")
  let user
  if (x) {
    user = JSON.parse(x || "")
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('result');

    if (result) {
      try {
        const parsedResult = JSON.parse(decodeURIComponent(result));
        // Store the user info in localStorage
        localStorage.setItem("user", JSON.stringify(parsedResult));

        // Remove the result query param from the URL to prevent infinite reload
        window.history.replaceState(null, "", window.location.pathname);

        // Reload the page to apply changes
        window.location.reload();
      } catch (error) {
        console.error("Error parsing result:", error);
      }
    }
  }, []);

  return <>
    <ThemeProvider theme={theme}>
      <ImageContextProvider>
        <BrowserRouter>
          <Suspense fallback={<Box sx={{ height: "100vh" }}><Loader /></Box>}>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Layout />} >

                  <Route index element={<Protected roles={user?.role === "Admin" ? ["Admin"] : ["User", "Admin"]} compo={user?.role === "Admin" ? <AdminDashboard /> : < Dashboard />} />} />
                  <Route path="user-dashboard" element={<Protected roles={["User", "Admin"]} compo={< Dashboard />} />} />
                  <Route path="admin" element={<Protected roles={["Admin"]} compo={<AdminDashboard />} />} />

                  <Route path="products">
                    <Route index element={<Protected roles={["User", "Admin"]} compo={<Products />} />} />
                    <Route path="add" element={<Protected roles={["User", "Admin"]} compo={<AddProduct />} />} />
                    <Route path="update/:id" element={<Protected roles={["User", "Admin"]} compo={<AddProduct />} />} />
                  </Route>

                  <Route path="brands">
                    <Route index element={<Protected roles={["User", "Admin"]} compo={<Brands />} />} />
                    <Route path="add" element={<Protected roles={["User", "Admin"]} compo={<AddBrand />} />} />
                    <Route path="update/:id" element={<Protected roles={["User", "Admin"]} compo={<AddBrand />} />} />
                  </Route>

                  <Route path="policies">
                    <Route index element={<Protected roles={["User", "Admin"]} compo={<Policies />} />} />
                    <Route path="add" element={<Protected roles={["User", "Admin"]} compo={<AddPolicy />} />} />
                    <Route path="update/:id" element={<Protected roles={["User", "Admin"]} compo={<AddPolicy />} />} />
                  </Route>

                  <Route path="policy-types">
                    <Route index element={<Protected roles={["User", "Admin"]} compo={<PolicyTypes />} />} />
                    <Route path="add" element={<Protected roles={["User", "Admin"]} compo={<AddPolicyType />} />} />
                    <Route path="update/:id" element={<Protected roles={["User", "Admin"]} compo={<AddPolicyType />} />} />
                  </Route>

                  <Route path="plans">
                    <Route index element={<Protected roles={["Admin"]} compo={<Plans />} />} />
                    <Route path="add" element={<Protected roles={["Admin"]} compo={<AddPlan />} />} />
                    <Route path="update/:id" element={<Protected roles={["Admin"]} compo={<AddPlan />} />} />
                  </Route>

                  <Route path="notifications">
                    <Route index element={<Protected roles={["User", "Admin"]} compo={<Notifications />} />} />
                    <Route path="add" element={<Protected roles={["User", "Admin"]} compo={<AddNotification />} />} />
                    <Route path="update/:id" element={<Protected roles={["User", "Admin"]} compo={<AddNotification />} />} />
                  </Route>

                  <Route path="users">
                    <Route index element={<Protected roles={["User", "Admin"]} compo={<Users />} />} />
                    <Route path="add" element={<Protected roles={["User", "Admin"]} compo={<AddUser />} />} />
                    <Route path="update/:id" element={<Protected roles={["User", "Admin"]} compo={<AddUser />} />} />
                  </Route>

                  <Route path="coupons">
                    <Route index element={<Protected roles={["Admin"]} compo={<Coupons />} />} />
                    <Route path="add" element={<Protected roles={["Admin"]} compo={<AddCoupon />} />} />
                    <Route path="update/:id" element={<Protected roles={["Admin"]} compo={<AddCoupon />} />} />
                  </Route>

                  <Route path="referrals" element={<Protected roles={["User", "Admin"]} compo={<ReferralPage />} />} />
                  <Route path="profile/:id" element={<Protected roles={["User", "Admin"]} compo={<Profile />} />} />
                  <Route path="upgrade-plan" element={<Protected roles={["User", "Admin"]} compo={<UpgradePlan />} />} />

                </Route>

                <Route path="sign-in" element={<Login />} />
                <Route path="sign-up" element={<Register />} />
                <Route path="select-plan" element={<SelectPlan />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<PageNotFound />} />

              </Routes>
            </ErrorBoundary>
          </Suspense>
        </BrowserRouter>
      </ImageContextProvider>
    </ThemeProvider>
  </>
}

export default App

