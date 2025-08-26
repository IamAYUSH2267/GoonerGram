import express, { type Express, type RequestHandler } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy, type Profile } from "passport-google-oauth20";
import { storage } from "./storage";

/**
 * Google OAuth 2.0 replacement for ReplitAuth.
 * Exposes the same endpoints used by the client:
 *   - GET /api/login
 *   - GET /api/callback
 *   - GET /api/logout
 * Also exports `isAuthenticated` and `setupAuth(app)` similar to the original.
 */

// Simple in-memory session store (OK for a single Render instance / free tier)
const SESSION_SECRET = process.env.SESSION_SECRET || "dev_secret_change_me";

// Make a safe username slug from a base string
function toUsername(base: string) {
  return base
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20) || "user";
}

// Ensure a unique username using storage.checkUsernameAvailability
async function ensureUniqueUsername(desired: string, userId: string): Promise<string> {
  let candidate = toUsername(desired);
  let suffix = 0;
  // Try up to a reasonable number of variants
  while (true) {
    const available = await storage.checkUsernameAvailability(candidate, userId);
    if (available) return candidate;
    suffix += 1;
    candidate = toUsername(`${desired}${suffix}`);
  }
}

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
};

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: app.get("env") === "production",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn("[auth] Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET env vars");
  }

  passport.use(new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID || "",
      clientSecret: GOOGLE_CLIENT_SECRET || "",
      callbackURL: "/api/callback",
    },
    async (accessToken, refreshToken, profile: Profile, done) => {
      try {
        const id = `google:${profile.id}`;
        const email = profile.emails?.[0]?.value;
        const firstName = profile.name?.givenName || "";
        const lastName = profile.name?.familyName || "";
        const photo = profile.photos?.[0]?.value;

        // Username base: email prefix or displayName or "user"
        const base = (email ? email.split("@")[0] : profile.displayName || "user");
        const username = await ensureUniqueUsername(base, id);

        // Upsert user into DB
        await storage.upsertUser({
          id,
          email,
          firstName,
          lastName,
          profileImageUrl: photo,
          username,
          updatedAt: new Date(),
        } as any);

        // What we keep in the session
        const userSession = { id, email, displayName: profile.displayName, photo };
        return done(null, userSession);
      } catch (err) {
        return done(err as any);
      }
    }
  ));

  // Start login
  app.get("/api/login", passport.authenticate("google", { scope: ["profile", "email"] }));

  // OAuth callback
  app.get("/api/callback",
    passport.authenticate("google", { failureRedirect: "/api/login" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  // Logout
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      // Destroy session cookie
      (req.session as any)?.destroy?.(() => {
        res.redirect("/");
      });
    });
  });
}
