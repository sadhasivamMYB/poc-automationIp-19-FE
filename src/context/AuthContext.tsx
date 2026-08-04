import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import api from "../services/api";
import { msalInstance } from "../pages/auth/msal";
import { parseApiResponse } from "../utils/zod-validation";
import { authResponseSchema, type User } from "../zod";

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    loginWithEmail: (data: any) => Promise<any>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    resendOtp: (email: string) => Promise<void>;
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
                if (response && response.idToken) {
                    const apiResponse = await api.post("/auth/microsoft", {
                        token: response.idToken,
                    });

                    const parsed = parseApiResponse(authResponseSchema, apiResponse.data);

                    if (parsed.data?.token && parsed.data?.user) {
                        internalLogin(parsed.data.token, parsed.data.user);
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
        const responseData = response.data;

        // If OTP is required, return the response for the Login page to handle
        if (responseData?.data?.otpRequired) {
            return responseData.data;
        }

        // Otherwise, complete login directly
        const parsed = parseApiResponse(authResponseSchema, responseData);
        if (parsed.data?.token && parsed.data?.user) {
            internalLogin(parsed.data.token, parsed.data.user);
        }
        return responseData.data;
    };

    const verifyOtp = async (email: string, otp: string) => {
        const response = await api.post("/auth/verify/otp", { email, otp });
        const parsed = parseApiResponse(authResponseSchema, response.data);

        if (parsed.data?.token && parsed.data?.user) {
            internalLogin(parsed.data.token, parsed.data.user);
        }
    };

    const resendOtp = async (email: string) => {
        await api.post("/auth/resend/otp", { email });
    };

    const loginWithMicrosoft = async () => {
        await msalInstance.loginRedirect({
            scopes: ["User.Read"],
        });
    };

    const logout = () => {
        localStorage.clear()
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, loginWithEmail, verifyOtp, resendOtp, loginWithMicrosoft, logout, fileName, setFileName }}>
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