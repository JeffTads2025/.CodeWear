import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import api, { usersApi } from '../services/api';

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role?: string;
    cpf?: string;
    phone?: string;
    address?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface SignInPayload {
    token: string;
    user: AuthUser;
}

interface AuthContextData {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    signIn: (payload: SignInPayload) => void;
    signOut: () => void;
    updateUser: (user: AuthUser) => void;
    refreshUser: () => Promise<void>;
}

const STORAGE_TOKEN_KEY = '@CodeWear:token';
const STORAGE_USER_KEY = '@CodeWear:user';
const STORAGE_USER_NAME_KEY = '@CodeWear:userName';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function getStoredToken(): string | null {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
}

function getStoredUser(): AuthUser | null {
    const savedUser = localStorage.getItem(STORAGE_USER_KEY);

    if (!savedUser) {
        return null;
    }

    try {
        return JSON.parse(savedUser) as AuthUser;
    } catch {
        localStorage.removeItem(STORAGE_USER_KEY);
        return null;
    }
}

function syncApiAuthorizationHeader(token: string | null): void {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        return;
    }

    delete api.defaults.headers.common.Authorization;
}

function persistToken(token: string | null): void {
    if (token) {
        localStorage.setItem(STORAGE_TOKEN_KEY, token);
        return;
    }

    localStorage.removeItem(STORAGE_TOKEN_KEY);
}

function persistUser(user: AuthUser | null): void {
    if (user) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
        localStorage.setItem(STORAGE_USER_NAME_KEY, user.name);
        return;
    }

    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_USER_NAME_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(getStoredToken);
    const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

    useEffect(() => {
        syncApiAuthorizationHeader(token);
        persistToken(token);
    }, [token]);

    useEffect(() => {
        persistUser(user);
    }, [user]);

    useEffect(() => {
        const syncAuthState = () => {
            setToken(getStoredToken());
            setUser(getStoredUser());
        };

        window.addEventListener('storage', syncAuthState);
        return () => window.removeEventListener('storage', syncAuthState);
    }, []);

    function signIn({ token: nextToken, user: nextUser }: SignInPayload) {
        setToken(nextToken);
        setUser(nextUser);
    }

    function signOut() {
        setToken(null);
        setUser(null);
    }

    function updateUser(nextUser: AuthUser) {
        setUser(nextUser);
    }

    async function refreshUser() {
        const refreshedUser = await usersApi.getProfile();
        setUser(refreshedUser);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: Boolean(token),
                signIn,
                signOut,
                updateUser,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
