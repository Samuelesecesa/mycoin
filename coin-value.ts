import type { Express } from "express";
import { calculateCoinValue, getNextGrowthTier, valueGrowthTiers, coinName } from "@shared/schema";
import { storage } from "./storage";

export function setupCoinValueRoutes(app: Express) {
  // Get current coin value and info
  app.get("/api/coin/value", async (req, res) => {
    try {
      // Ottieni il numero totale di utenti
      const totalUsers = await storage.getUserCount();
      
      // Calcola il valore attuale della moneta
      const currentValue = calculateCoinValue(totalUsers);
      
      // Ottieni info sul prossimo tier
      const nextTier = getNextGrowthTier(totalUsers);
      
      // Restituisci tutte le informazioni
      res.json({
        name: coinName,
        totalUsers,
        currentValue,
        nextTier,
        allTiers: valueGrowthTiers
      });
    } catch (error: any) {
      console.error("Error retrieving coin value:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get the logo for the coin (we'll use a simple URL here)
  app.get("/api/coin/logo", (req, res) => {
    // Qui potremmo restituire un'immagine, ma per semplicità restituiamo un URL
    res.json({
      logoUrl: "/api/static/smeraldo-coin-logo.png"
    });
  });
}