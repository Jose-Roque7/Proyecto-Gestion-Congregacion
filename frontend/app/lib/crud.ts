import api from "./axios";
import Cookies from "js-cookie";
// import { jwtDecode } from 'jwt-decode';

// interface JwtPayloadCustom {
//   id: string;
//   iglesiaId: string;
//   rol: string;
//   iat: number;
//   exp: number;
// }

export const login = async (data: any) => {
        const response = await api.post("/auth/login", data);
        Cookies.set("auth_token", response.data.access_token, { expires: 1 });
        return response.data;  
}

export const createMiembro = async (data: any) => {
    try {
        const verify = await verifyToken();
        if (!verify) return;
        const response = await api.post("/miembros", data);
        return response.data;
    } catch (error) {
        return;
    }
}

export const createUser = async (data: any) => {
    try {
        verifyToken();
        const response = await api.post("/usuarios", data);
        return response.data;
    } catch (error) {
        return;
    }
}


const verifyToken = async (): Promise<boolean> => {
    try {
        const response = await api.get("/auth/verify");
        
        // Verificar que la respuesta sea exitosa
        if (response.status >= 200 && response.status < 300) {
            return true;
        }
        
        // Si la respuesta no es exitosa, considerar como error
        throw new Error("Verificación fallida");
        
    } catch (error: any) {
        // Eliminar el token
        Cookies.remove("auth_token");
        // Redirigir al login solo si estamos en el cliente
        if (typeof window !== "undefined") {
            // Verificar que no estamos ya en la página de login
            if (window.location.pathname !== "/") {
                window.location.href = "/";
            }
        }
        
        return false;
    }
}