import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {

    const [token, setToken] = useState(
        localStorage.getItem("token") || ""
    );

    const [user, setUser] = useState(null);

    useEffect(() => {

        if (token) {

            localStorage.setItem("token", token);

        }

        else {

            localStorage.removeItem("token");

        }

    }, [token]);

    const logout = () => {

        setToken("");

        setUser(null);

        localStorage.removeItem("token");

    };

    return (

        <AuthContext.Provider
            value={{
                token,
                setToken,
                user,
                setUser,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}