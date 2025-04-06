import { Express } from "express";
import { storage } from "./storage";
import { coinRates } from "@shared/schema";

export function setupMiningRoutes(app: Express) {
  // Claim mining reward from clicking
  app.post("/api/mining/click", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has reached max clicks for today
      if (user.clicksToday >= coinRates.MAX_CLICKS_PER_DAY) {
        return res.status(400).json({ message: "Maximum clicks for today reached" });
      }
      
      // Check if today's total would exceed max daily coins
      if (user.todayCoins + coinRates.COINS_PER_CLICK > coinRates.MAX_COINS_PER_DAY) {
        return res.status(400).json({ message: "Maximum daily coin limit reached" });
      }
      
      // Update click count and coins
      const now = new Date();
      const updatedUser = await storage.updateUserAfterClick(user.id, now);
      
      // Create activity record
      await storage.createActivity({
        userId: user.id,
        type: "CLICK",
        amount: coinRates.COINS_PER_CLICK
      });
      
      res.json({
        user: updatedUser,
        reward: coinRates.COINS_PER_CLICK,
        clicksRemaining: coinRates.MAX_CLICKS_PER_DAY - updatedUser.clicksToday
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process click mining" });
    }
  });
  
  // Check for passive rewards
  app.get("/api/mining/passive", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const now = new Date();
      const lastReward = user.lastHourlyReward ? new Date(user.lastHourlyReward) : null;
      
      // If first time or an hour has passed since last reward
      if (!lastReward || (now.getTime() - lastReward.getTime() >= 60 * 60 * 1000)) {
        // Check if today's total would exceed max daily coins
        if (user.todayCoins + coinRates.PASSIVE_COINS_PER_HOUR > coinRates.MAX_COINS_PER_DAY) {
          return res.json({
            user,
            nextRewardTime: null,
            message: "Maximum daily coin limit reached"
          });
        }
        
        // Update user with passive reward
        const updatedUser = await storage.updateUserAfterPassiveReward(user.id, now);
        
        // Create activity record
        await storage.createActivity({
          userId: user.id,
          type: "PASSIVE",
          amount: coinRates.PASSIVE_COINS_PER_HOUR
        });
        
        // Calculate next reward time
        const nextRewardTime = new Date(now.getTime() + 60 * 60 * 1000);
        
        return res.json({
          user: updatedUser,
          reward: coinRates.PASSIVE_COINS_PER_HOUR,
          nextRewardTime
        });
      } else {
        // Calculate time remaining until next reward
        const timeToNextReward = 60 * 60 * 1000 - (now.getTime() - lastReward.getTime());
        const nextRewardTime = new Date(now.getTime() + timeToNextReward);
        
        return res.json({
          user,
          nextRewardTime,
          timeRemaining: Math.ceil(timeToNextReward / 1000) // in seconds
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to process passive mining check" });
    }
  });
  
  // Get user activities
  app.get("/api/mining/activities", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const activities = await storage.getUserActivities(req.user.id);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });
  
  // Reset daily stats if needed (should be automatically called when checking status)
  app.post("/api/mining/reset-day", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const now = new Date();
      const lastReset = user.lastDayReset ? new Date(user.lastDayReset) : null;
      
      // Check if we need to reset daily counters
      if (!lastReset || !isSameDay(now, lastReset)) {
        const updatedUser = await storage.resetUserDailyStats(user.id, now);
        res.json({ user: updatedUser, reset: true });
      } else {
        res.json({ user, reset: false });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to reset daily stats" });
    }
  });
}

// Helper function to check if two dates are on the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
