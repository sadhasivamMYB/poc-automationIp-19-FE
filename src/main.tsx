import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Toaster } from "sonner";
import theme from "./theme/theme";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import { validateEnvironment } from "./zod";
import { msalInstance } from "./pages/auth/msal";

// Validate environment variables on startup
validateEnvironment();

msalInstance.initialize().then(() => {
  ReactDOM.createRoot(
    document.getElementById("root")!
  ).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster position="top-right" richColors />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
});