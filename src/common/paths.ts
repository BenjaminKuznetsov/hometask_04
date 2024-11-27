export const paths = {
    home: "/",
    blogs: "/api/blogs",
    posts: "/api/posts",
    users: "/api/users",
    comments: "/api/comments",
    auth: {
        root: "/api/auth",
        login: "/api/auth/login",
        register: "/api/auth/registration",
        registerConfirm: "/api/auth/registration-confirmation",
        registerEmailResend: "/api/auth/registration-email-resending",
        me: "/api/auth/me",
        subs: {
            login: "/login",
            me: "/me",
            register: "/registration",
            registerConfirm: "/registration-confirmation",
            registerEmailResend: "/registration-email-resending",
        },
    },

    testing: "/api/testing/all-data",
} as const
