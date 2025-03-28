import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import dotenv from "dotenv";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../models/User";
import { generateReferralCode } from "../utils/generateReferralCode";

dotenv.config();

passport.use(new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_KEY as string
    },
    async (jwtPayload: JwtPayload, done: any) => {
        try {
            return done(null, jwtPayload);
        } catch (error) {
            done(error, false);
        }
    }
))

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
        scope: ["profile", "email"]
    },
    async (accessToken, refreshToken, profile, cb) => {
        try {
            let user = await User.findOne({ email: profile._json.email }).lean()

            const referralCode = generateReferralCode()

            if (!user) {
                const newUser = await User.create({ name: profile._json.name, email: profile._json.email, profile: profile._json.picture, referralCode })
                return cb(null, { ...newUser.toObject(), new: true }, { message: "Logged in successfully" })
            }

            cb(null, { ...user, new: false }, { message: "Logged in successfully" })
        } catch (error) {
            cb(error, false)
        }
    }
))

export default passport;
