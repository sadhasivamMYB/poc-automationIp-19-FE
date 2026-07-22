import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/admin/Dashboard";
import MasterItemsList from "../pages/admin/master-items/MasterItemsList";
import MasterItemForm from "../pages/admin/master-items/MasterItemForm";
import InitialStockList from "../pages/admin/initial-stock/InitialStockList";
import InitialStockForm from "../pages/admin/initial-stock/InitialStockForm";
import DailyStock from "../pages/warehouse/DailyStocks";
import CustomDateLog from "../pages/warehouse/CustomDateLog";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import AuthLayout from "../layouts/Authlayout";
import AdminLayout from "../layouts/Adminlayout";
import WarehouseLayout from "../layouts/WarehouseLayout";
import Compare from "../pages/admin/compare-stock/Compare";
import UsersList from "../pages/admin/users/UsersList";
import UserForm from "../pages/admin/users/UserForm";
import Summary from "../pages/admin/summary/Summary";
const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<PublicRoute />}>
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} />
        }
      >
        <Route path="/admin">
          <Route
            index
            element={
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            }
          />
          <Route
            path="master-items"
            element={
              <AdminLayout>
                <MasterItemsList />
              </AdminLayout>
            }
          />
          <Route
            path="master-items/:id"
            element={
              <AdminLayout>
                <MasterItemForm />
              </AdminLayout>
            }
          />
          <Route
            path="initial-stock"
            element={
              <AdminLayout>
                <InitialStockList />
              </AdminLayout>
            }
          />
          <Route
            path="initial-stock/:id"
            element={
              <AdminLayout>
                <InitialStockForm />
              </AdminLayout>
            }
          />

          <Route
            path="compare"
            element={
              <AdminLayout>
                <Compare />
              </AdminLayout>
            }
          />

          <Route
            path="summary"
            element={
              <AdminLayout>
                <Summary />
              </AdminLayout>
            }
          />

          <Route
            path="users"
            element={
              <AdminLayout>
                <UsersList />
              </AdminLayout>
            }
          />
          <Route
            path="users/:id"
            element={
              <AdminLayout>
                <UserForm />
              </AdminLayout>
            }
          />

        </Route>
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["USER"]} />
        }
      >
        <Route
          path="/warehouse/log"
          element={
            <WarehouseLayout>
              <DailyStock />
            </WarehouseLayout>
          }
        />
        <Route
          path="/warehouse/custom-date-log"
          element={
            <WarehouseLayout>
              <CustomDateLog />
            </WarehouseLayout>
          }
        />
        <Route
          path="/warehouse/summary"
          element={
            <WarehouseLayout>
              <Summary />
            </WarehouseLayout>
          }
        />
        <Route path="/warehouse/*" element={<Navigate to="/warehouse/log" replace />} />
      </Route>

    </Routes>
  </BrowserRouter>
);

export default AppRoutes;