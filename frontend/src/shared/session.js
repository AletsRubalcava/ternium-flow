export const session = {
    setSession({ token, user }) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
    },

    clearSession() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },

    getToken() {
        return localStorage.getItem("token");
    },

    getUser() {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },

    getUserId() {
        return this.getUser()?.id ?? null;
    },

    getUserRole() {
        return this.getUser()?.role ?? null;
    },

    getClientId() {
        return this.getUser()?.id_cliente ?? null;
    },

    isAuthenticated() {
        return !!this.getToken();
    }
};