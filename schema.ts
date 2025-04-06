import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  walletAddress: text("wallet_address"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  totalCoins: integer("total_coins").default(0).notNull(),
  todayCoins: integer("today_coins").default(0).notNull(),
  passiveCoins: integer("passive_coins").default(0).notNull(),
  clickCoins: integer("click_coins").default(0).notNull(),
  clicksToday: integer("clicks_today").default(0).notNull(),
  lastHourlyReward: timestamp("last_hourly_reward"),
  lastClickTime: timestamp("last_click_time"),
  lastDayReset: timestamp("last_day_reset"),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "PASSIVE", "CLICK", "WALLET_CONNECTED"
  amount: integer("amount"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  walletAddress: true,
  isAdmin: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  walletAddress: true,
  totalCoins: true,
  todayCoins: true,
  passiveCoins: true,
  clickCoins: true,
  clicksToday: true,
  lastHourlyReward: true,
  lastClickTime: true,
  lastDayReset: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  type: true,
  amount: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export const coinName = "SmeraldoCoin";

export const coinRates = {
  PASSIVE_COINS_PER_HOUR: 500,
  COINS_PER_CLICK: 10,
  MAX_CLICKS_PER_DAY: 50,
  MAX_COINS_PER_DAY: 12000,
  COIN_VALUE_EUR: 0.00001, // Valore di 1 SmeraldoCoin in EUR (0.00001€)
};

// Sistema di crescita del valore basato sul numero di utenti
export const valueGrowthTiers = [
  { fino_a: 1000, valore: 0.00001 },  // Valore base fino a 1.000 utenti
  { fino_a: 2000, valore: 0.000012 }, // +20% a 2.000 utenti
  { fino_a: 5000, valore: 0.000016 }, // +33% a 5.000 utenti
  { fino_a: 10000, valore: 0.000025 }, // +56% a 10.000 utenti
  { fino_a: 20000, valore: 0.000042 }, // +68% a 20.000 utenti
  { fino_a: 50000, valore: 0.00010 },  // +138% a 50.000 utenti
  { fino_a: 100000, valore: 0.00025 }  // +150% a 100.000 utenti
];

// Funzione per calcolare il valore attuale della coin in base al numero di utenti
export function calculateCoinValue(totalUsers: number): number {
  for (let i = valueGrowthTiers.length - 1; i >= 0; i--) {
    if (totalUsers <= valueGrowthTiers[i].fino_a) {
      return valueGrowthTiers[i].valore;
    }
  }
  // Fallback al valore massimo se il numero di utenti supera tutti i livelli
  return valueGrowthTiers[valueGrowthTiers.length - 1].valore;
}

// Funzione per ottenere il prossimo tier di crescita
export function getNextGrowthTier(totalUsers: number): { users: number, value: number, percentage: number } | null {
  for (let i = 0; i < valueGrowthTiers.length; i++) {
    if (totalUsers < valueGrowthTiers[i].fino_a) {
      const currentValue = i > 0 ? valueGrowthTiers[i-1].valore : valueGrowthTiers[0].valore;
      const nextValue = valueGrowthTiers[i].valore;
      const percentageIncrease = ((nextValue - currentValue) / currentValue) * 100;
      return {
        users: valueGrowthTiers[i].fino_a,
        value: nextValue,
        percentage: Math.round(percentageIncrease)
      };
    }
  }
  return null; // Nessun tier successivo disponibile
};
