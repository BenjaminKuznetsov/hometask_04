export const paths = {
    home: "/",
    blogs: "/api/blogs",
    posts: "/api/posts",
    users: "/api/users",
    comments: "/api/comments",
    sessions: "/api/security/devices",
    auth: {
        root: "/api/auth",
        login: "/api/auth/login",
        refresh: "/api/auth/refresh-token",
        register: "/api/auth/registration",
        logout: "/api/auth/logout",
        registerConfirm: "/api/auth/registration-confirmation",
        registerEmailResend: "/api/auth/registration-email-resending",
        me: "/api/auth/me",
        subs: {
            login: "/login",
            refresh: "/refresh-token",
            logout: "/logout",
            register: "/registration",
            registerConfirm: "/registration-confirmation",
            registerEmailResend: "/registration-email-resending",
            me: "/me",
        },
    },

    testing: "/api/testing/all-data",
} as const
