import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Admin middleware
function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Not authorized" });
  }
  
  next();
}

export function setupAdminRoutes(app: Express) {
  // Get admin dashboard stats
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const totalUsers = users.length;
      
      let totalCoins = 0;
      for (const user of users) {
        totalCoins += user.totalCoins;
      }
      
      const averageCoins = totalUsers > 0 ? Math.floor(totalCoins / totalUsers) : 0;
      
      res.json({
        totalUsers,
        totalCoins,
        averageCoins
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });
  
  // Get all users for admin
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Export user data for admin
  app.get("/api/admin/export", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      const exportData = users.map(user => ({
        username: user.username,
        walletAddress: user.walletAddress || "Not connected",
        totalCoins: user.totalCoins
      }));
      
      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
      
      // Create CSV header
      let csv = 'Username,Wallet Address,Total Coins\n';
      
      // Add each user as a row
      exportData.forEach(user => {
        csv += `${user.username},${user.walletAddress},${user.totalCoins}\n`;
      });
      
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export user data" });
    }
  });
}
