import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Export the hash function for testing purposes
export { hashPassword };

export async function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "crypto-mining-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Trim whitespace from username
        const trimmedUsername = username.trim();
        const user = await storage.getUserByUsername(trimmedUsername);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Trim whitespace from username and email
      const trimmedUsername = req.body.username.trim();
      const trimmedEmail = req.body.email.trim();
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(trimmedUsername);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(trimmedEmail);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Set admin flag for admin users (for demo purposes)
      // In production, you would use a more secure approach
      const isAdmin = trimmedUsername.toLowerCase() === "admin";

      const user = await storage.createUser({
        ...req.body,
        username: trimmedUsername,
        email: trimmedEmail,
        password: await hashPassword(req.body.password),
        isAdmin: isAdmin, // Set admin flag based on username
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  app.put("/api/user/wallet", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { walletAddress } = req.body;
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }

      // Check if wallet address is valid (basic Ethereum address validation)
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({ message: "Invalid wallet address format" });
      }

      const updatedUser = await storage.updateUserWallet(req.user.id, walletAddress);
      
      // Add activity for wallet connection (if first time connecting)
      if (!req.user.walletAddress && walletAddress) {
        await storage.createActivity({
          userId: req.user.id,
          type: "WALLET_CONNECTED",
          amount: 0,
        });
      }

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update wallet address" });
    }
  });
}
