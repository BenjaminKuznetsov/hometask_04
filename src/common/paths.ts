export const paths = {
    home: "/",
    blogs: "/api/blogs",
    posts: "/api/posts",
    users: "/api/users",
    comments: "/api/comments",
    auth: {
        root: "/api/auth",
        login: "/api/auth/login",
        me: "/api/auth/me",
        subs: {
            login: "/login",
            me: "/me",
        },
    },

    testing: "/api/testing/all-data",
} as const
