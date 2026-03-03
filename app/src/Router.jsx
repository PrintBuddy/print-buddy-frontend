import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import DashboardLayout from "./components/mainViewComponents/DashboardLayout";

import LoginPage from "./views/LoginPage";
import RegisterPage from "./views/RegisterPage";
import MainPage from "./views/MainPage";
import PrintPage from "./views/PrintPage";
import FilePage from "./views/FilePage";
import HistoryPage from "./views/HistoryPage";
import BalancePage from "./views/BalancePage";
import PwdResetPage from "./views/PwdResetPage";
import PwdRequestPage from "./views/PwdRequestPage";
import AdminDashboardPage from "./views/AdminDashboardPage";
import AdminUsersPage from "./views/AdminUsersPage";
import AdminRefundsPage from "./views/AdminRefundsPage";
import AdminSettingsPage from "./views/AdminSettingsPage";
import AdminActivityPage from "./views/AdminActivityPage";

import { useEffect } from "react";
import { usePrint } from "./context/PrintContext"; 
import { usePrinter } from "./context/PrinterContext"; 
import { useFile } from "./context/FileContext";
import { useUser } from "./context/UserContext";


const ProtectedRoute = ({ children }) => {
    const { statusLoggedIn } = useAuth();
    const { refreshUser } = useUser();
    const { resetState: resetPrint } = usePrint();
    const { resetState: resetPrinter } = usePrinter();
    const { resetState: resetFile } = useFile();

    const location = useLocation();

    useEffect(() => {
        if (location.pathname != "/print") {
            resetFile();
            resetPrint();
            resetPrinter();
            refreshUser();
        }

    }, [location.pathname])

    if (statusLoggedIn == "loggedOut") {
        return (
            <Navigate to="/login" replace />    
        )
    }

    return (
        <DashboardLayout>
            { children }
        </DashboardLayout>
    );
}

const AdminRoute = ({ children }) => {
    const { statusLoggedIn } = useAuth();
    const { user } = useUser();

    if (statusLoggedIn == "loggedOut") {
        return <Navigate to="/login" replace />;
    }

    if (user && !user.is_admin) {
        return <Navigate to="/" replace />;
    }

    return (
        <DashboardLayout>
            { children }
        </DashboardLayout>
    );
};


export default function AppRouter() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/password-reset" element={<PwdResetPage />} />
                <Route path="/pwd-reset-request" element={<PwdRequestPage />} />

                <Route path="/" element={
                    <ProtectedRoute>
                        <MainPage />
                    </ProtectedRoute>
                } />

                <Route path="/print" element={
                    <ProtectedRoute>
                        <PrintPage />
                    </ProtectedRoute>
                } />

                <Route path="/files" element={
                    <ProtectedRoute>
                        <FilePage />
                    </ProtectedRoute>
                } />

                <Route path="/history" element={
                    <ProtectedRoute>
                        <HistoryPage />
                    </ProtectedRoute>
                } />

                <Route path="/balance" element={
                    <ProtectedRoute>
                        <BalancePage />
                    </ProtectedRoute>
                } />

                {/* ── Admin routes ────────────────────────── */}
                <Route path="/admin" element={
                    <AdminRoute>
                        <AdminDashboardPage />
                    </AdminRoute>
                } />

                <Route path="/admin/users" element={
                    <AdminRoute>
                        <AdminUsersPage />
                    </AdminRoute>
                } />

                <Route path="/admin/refunds" element={
                    <AdminRoute>
                        <AdminRefundsPage />
                    </AdminRoute>
                } />

                <Route path="/admin/settings" element={
                    <AdminRoute>
                        <AdminSettingsPage />
                    </AdminRoute>
                } />

                <Route path="/admin/activity" element={
                    <AdminRoute>
                        <AdminActivityPage />
                    </AdminRoute>
                } />

                <Route path="*" element={
                    <ProtectedRoute>
                        <MainPage />
                    </ProtectedRoute>
                } />
                
            </Routes>
        </BrowserRouter>
    )
}
