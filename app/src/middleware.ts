import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // /admin requires admin role? For now just being logged in is enough as we only have admin users
      if (req.nextUrl.pathname.startsWith('/admin')) {
        return !!token;
      }
      return true;
    },
  },
})

export const config = { matcher: ["/admin/:path*", "/admin"] }
