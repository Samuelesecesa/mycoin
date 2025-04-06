import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword } from "./auth";
import { setupMiningRoutes } from "./mining";
import { setupAdminRoutes } from "./admin";
import { setupCoinValueRoutes } from "./coin-value";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup pre-defined admin user
  const admin01 = await storage.getUserByUsername("admin01");
  if (!admin01) {
    // Create admin01 user with hashed password
    const hashedPassword = await hashPassword("m1905087");
    await storage.createUser({
      username: "admin01",
      password: hashedPassword,
      email: "admin01@example.com",
      isAdmin: true,
    });
    
    console.log("Admin user 'admin01' created successfully.");
  }
  
  // Setup authentication routes
  await setupAuth(app);
  
  // Setup mining routes
  setupMiningRoutes(app);
  
  // Setup admin routes
  setupAdminRoutes(app);
  
  // Setup coin value routes
  setupCoinValueRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
