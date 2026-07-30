import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import api from "../services/api";
import { msalInstance } from "../pages/auth/msal";

export interface User {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    warehouseId?: string;
    warehouseName?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    loginWithEmail: (data: any) => Promise<void>;
    loginWithMicrosoft: () => Promise<void>;
    logout: () => void;
    fileName: string | null;
    setFileName: (fileName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);
    const [fileName, setFileName] = useState("");

    const internalLogin = (newToken: string, newUser: User) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            try {
                // First resolve any pending MSAL redirects

                const response = await msalInstance.handleRedirectPromise();

                if (response === null) {
                    // No pending redirect, just continue
                    console.log("No pending MSAL redirect");
                }
                console.log("After INIT Micrsoft HandleREDIRECT 1", response, " response")
                if (response && response.idToken) {
                    const apiResponse = await api.post("/auth/microsoft", {
                        token: response.idToken,
                    });
                    const { token: appToken, user: appUser } = apiResponse.data;

                    if (appToken && appUser) {
                        internalLogin(appToken, appUser);
                        if (isMounted) setLoading(false);
                        return; // Successfully logged in, exit early
                    }
                }
            } catch (err) {
                console.error("MSAL Redirect or Backend Error:", err);
            }

            // Fallback to local storage if no MSAL redirect or if it failed
            const savedUser = localStorage.getItem("user");
            if (savedUser) {
                setUser(JSON.parse(savedUser));
                // Assuming token is already initialized from localStorage in useState
            }
            if (isMounted) setLoading(false);
        };

        initAuth();

        const handleAuthError = () => logout();
        window.addEventListener("auth-error", handleAuthError);
        return () => {
            isMounted = false;
            window.removeEventListener("auth-error", handleAuthError);
        };
    }, []);

    const loginWithEmail = async (data: any) => {
        const response = await api.post("/auth/login", data);
        const { token: newToken, user: newUser } = response.data;
        internalLogin(newToken, newUser);
    };

    const loginWithMicrosoft = async () => {
        console.log("loginWithMicrosoft ⚡⚡⚡⚡⚡  1")
        await msalInstance.loginRedirect({
            scopes: ["User.Read"],
        });
        console.log("loginWithMicrosoft ⚡⚡⚡⚡⚡  2")
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, loginWithEmail, loginWithMicrosoft, logout, fileName, setFileName }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};