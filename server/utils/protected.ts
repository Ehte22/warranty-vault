import { NextFunction, Request, Response } from "express"
import passport from "../services/passport";
import dotenv from "dotenv"

dotenv.config()

export interface IUserProtected {
    userId: string;
    name: string;
    role: string;
    [key: string]: any;
}

export const protectedRoute = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', { session: false }, async (err: Error, user: any, info: any) => {
        if (err) {
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }

        if (!user) {
            return res.status(401).json({ message: "Unauthorized: Invalid or missing token", info });
        }

        // const loggedUser = await User.findById(user.userId).lean()

        // if (loggedUser && loggedUser.sessionToken !== req.headers.authorization?.split(" ")[1]) {
        //     return res.status(401).json({ message: "Session has expired. Please log in again." });
        // }

        req.user = user
        next()
    })(req, res, next)
};

export const restrict = (role: string[]) => {
    return (req: Request, res: Response, next: NextFunction): any => {
        const user = req.user as IUserProtected
        if (!user || !role.includes(user.role)) {
            return res.status(403).json({ message: "You don't have permission to perform this action" })
        }
        next()
    }
}


// export const protectedRoute = (req: Request, res: Response, next: NextFunction) => {
//     const authHeader = req.headers.authorization;

//     // Check if it's a JWT token request
//     if (authHeader && authHeader.startsWith("Bearer ")) {
//         return passport.authenticate("jwt", { session: false }, async (err: Error, user: any, info: any) => {
//             if (err) {
//                 return res.status(500).json({ message: "Internal Server Error", error: err.message });
//             }
//             if (!user) {
//                 return res.status(401).json({ message: "Unauthorized: Invalid or missing token", info });
//             }

//             req.user = user;
//             return next();
//         })(req, res, next);
//     }

//     // If no JWT token is provided, assume it's Google OAuth authentication
//     return passport.authenticate("google", { session: false }, async (err: Error, user: any, info: any) => {
//         if (err) {
//             return res.status(500).json({ message: "Internal Server Error", error: err.message });
//         }
//         if (!user) {
//             return res.status(401).json({ message: "Unauthorized: Invalid or missing token", info });
//         }

//         req.user = user;
//         return next();
//     })(req, res, next);
// };
