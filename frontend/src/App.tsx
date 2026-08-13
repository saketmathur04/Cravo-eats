import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Navbar } from "./features/landing/Navbar";
import { useAppData } from "./context/AppContext";

// Lazy-loaded pages — each downloads only when visited
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const SelectRole = lazy(() => import("./pages/SelectRole"));
const Account = lazy(() => import("./pages/Account"));
const Restaurant = lazy(() => import("./pages/Restaurant"));
const RestaurantPage = lazy(() => import("./pages/RestaurantPage"));
const Cart = lazy(() => import("./pages/Cart"));
const AddAddressPage = lazy(() => import("./pages/Address"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderPage = lazy(() => import("./pages/OrderPage"));
const RiderDashboard = lazy(() => import("./pages/RiderDashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const PublicRoute = lazy(() => import("./components/publicRoute"));

/** Conditionally renders the Navbar (hidden on /login) */
function ConditionalNavbar() {
  const location = useLocation();
  if (location.pathname === "/login") return null;
  return <Navbar />;
}

const App = () => {
  const { user, loading } = useAppData();

  if (loading) {
    return (
      <h1 className="text-2xl font-bold text-red-500 text-center mt-56">
        Loading...
      </h1>
    );
  }

  return (
    <>
      <BrowserRouter>
        <ConditionalNavbar />
        <Suspense fallback={
          <div className="flex h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <span className="text-sm font-medium text-muted-foreground tracking-wide">Loading...</span>
            </div>
          </div>
        }>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={
                  user?.role === "seller" ? <div className="pt-16"><Restaurant /></div> :
                  user?.role === "rider" ? <div className="pt-16"><RiderDashboard /></div> :
                  user?.role === "admin" ? <div className="pt-16"><Admin /></div> :
                  <Home />
              } />
              <Route
                path="/paymentsuccess/:paymentId"
                element={<PaymentSuccess />}
              />
              <Route path="/orders" element={<Orders />} />
              <Route path="/order/:id" element={<OrderPage />} />
              <Route path="/ordersuccess" element={<OrderSuccess />} />
              <Route path="/address" element={<AddAddressPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/restaurant/:id" element={<RestaurantPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/select-role" element={<SelectRole />} />
              <Route path="/account" element={<Account />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
};

export default App;
