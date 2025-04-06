import { users, activities, type User, type InsertUser, type Activity, type InsertActivity, coinRates } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUserCount(): Promise<number>; // Nuovo metodo per contare gli utenti totali
  updateUserWallet(id: number, walletAddress: string): Promise<User>;
  updateUserAfterClick(id: number, timestamp: Date): Promise<User>;
  updateUserAfterPassiveReward(id: number, timestamp: Date): Promise<User>;
  resetUserDailyStats(id: number, timestamp: Date): Promise<User>;
  
  // Activity methods
  createActivity(activity: InsertActivity): Promise<Activity>;
  getUserActivities(userId: number, limit?: number): Promise<Activity[]>;
  
  // Session store
  sessionStore: any; // Use any type to avoid SessionStore type error
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private activities: Map<number, Activity>;
  currentUserId: number;
  currentActivityId: number;
  sessionStore: any; // Use any type to avoid SessionStore type error

  constructor() {
    this.users = new Map();
    this.activities = new Map();
    this.currentUserId = 1;
    this.currentActivityId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Trim whitespace from username for lookup
    const trimmedUsername = username.trim();
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === trimmedUsername.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    // Trim whitespace from email for lookup
    const trimmedEmail = email.trim();
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === trimmedEmail.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    
    // Ensure all required properties are properly set
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      walletAddress: insertUser.walletAddress || null,
      isAdmin: insertUser.isAdmin || false,
      totalCoins: 0,
      todayCoins: 0,
      passiveCoins: 0,
      clickCoins: 0,
      clicksToday: 0,
      lastHourlyReward: null,
      lastClickTime: null,
      lastDayReset: now,
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUserCount(): Promise<number> {
    return this.users.size;
  }
  
  async updateUserWallet(id: number, walletAddress: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = {
      ...user,
      walletAddress,
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserAfterClick(id: number, timestamp: Date): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Ensure daily stats are reset if needed
    const resetUser = await this.checkAndResetDailyStatsIfNeeded(user, timestamp);
    
    const updatedUser = {
      ...resetUser,
      totalCoins: resetUser.totalCoins + coinRates.COINS_PER_CLICK,
      todayCoins: resetUser.todayCoins + coinRates.COINS_PER_CLICK,
      clickCoins: resetUser.clickCoins + coinRates.COINS_PER_CLICK,
      clicksToday: resetUser.clicksToday + 1,
      lastClickTime: timestamp,
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserAfterPassiveReward(id: number, timestamp: Date): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Ensure daily stats are reset if needed
    const resetUser = await this.checkAndResetDailyStatsIfNeeded(user, timestamp);
    
    const updatedUser = {
      ...resetUser,
      totalCoins: resetUser.totalCoins + coinRates.PASSIVE_COINS_PER_HOUR,
      todayCoins: resetUser.todayCoins + coinRates.PASSIVE_COINS_PER_HOUR,
      passiveCoins: resetUser.passiveCoins + coinRates.PASSIVE_COINS_PER_HOUR,
      lastHourlyReward: timestamp,
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async resetUserDailyStats(id: number, timestamp: Date): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = {
      ...user,
      todayCoins: 0,
      clicksToday: 0,
      lastDayReset: timestamp,
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Helper method to check and reset daily stats if needed
  private async checkAndResetDailyStatsIfNeeded(user: User, now: Date): Promise<User> {
    const lastReset = user.lastDayReset ? new Date(user.lastDayReset) : null;
    
    if (!lastReset || !this.isSameDay(now, lastReset)) {
      return await this.resetUserDailyStats(user.id, now);
    }
    
    return user;
  }
  
  // Helper method to check if two dates are on the same day
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const now = new Date();
    
    // Ensure all required properties are properly set
    const activity: Activity = {
      id,
      type: insertActivity.type,
      userId: insertActivity.userId,
      amount: insertActivity.amount !== undefined ? insertActivity.amount : null,
      createdAt: now,
    };
    
    this.activities.set(id, activity);
    return activity;
  }
  
  async getUserActivities(userId: number, limit: number = 10): Promise<Activity[]> {
    const userActivities = Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return userActivities.slice(0, limit);
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const trimmedUsername = username.trim();
    const [user] = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.username}) = LOWER(${trimmedUsername})`);
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const trimmedEmail = email.trim();
    const [user] = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.email}) = LOWER(${trimmedEmail})`);
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        totalCoins: 0,
        todayCoins: 0,
        passiveCoins: 0,
        clickCoins: 0,
        clicksToday: 0,
        lastDayReset: now,
      })
      .returning();
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async getUserCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return result[0].count;
  }
  
  async updateUserWallet(id: number, walletAddress: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ walletAddress })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }
  
  async updateUserAfterClick(id: number, timestamp: Date): Promise<User> {
    // First get the user and check if we need to reset daily stats
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Ensure daily stats are reset if needed
    const resetUser = await this.checkAndResetDailyStatsIfNeeded(user, timestamp);
    
    // Update the user with new values
    const [updatedUser] = await db
      .update(users)
      .set({
        totalCoins: resetUser.totalCoins + coinRates.COINS_PER_CLICK,
        todayCoins: resetUser.todayCoins + coinRates.COINS_PER_CLICK,
        clickCoins: resetUser.clickCoins + coinRates.COINS_PER_CLICK,
        clicksToday: resetUser.clicksToday + 1,
        lastClickTime: timestamp,
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error("Failed to update user");
    }
    
    return updatedUser;
  }
  
  async updateUserAfterPassiveReward(id: number, timestamp: Date): Promise<User> {
    // First get the user and check if we need to reset daily stats
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Ensure daily stats are reset if needed
    const resetUser = await this.checkAndResetDailyStatsIfNeeded(user, timestamp);
    
    // Update the user with new values
    const [updatedUser] = await db
      .update(users)
      .set({
        totalCoins: resetUser.totalCoins + coinRates.PASSIVE_COINS_PER_HOUR,
        todayCoins: resetUser.todayCoins + coinRates.PASSIVE_COINS_PER_HOUR,
        passiveCoins: resetUser.passiveCoins + coinRates.PASSIVE_COINS_PER_HOUR,
        lastHourlyReward: timestamp,
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error("Failed to update user");
    }
    
    return updatedUser;
  }
  
  async resetUserDailyStats(id: number, timestamp: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        todayCoins: 0,
        clicksToday: 0,
        lastDayReset: timestamp,
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }
  
  private async checkAndResetDailyStatsIfNeeded(user: User, now: Date): Promise<User> {
    const lastReset = user.lastDayReset ? new Date(user.lastDayReset) : null;
    
    if (!lastReset || !this.isSameDay(now, lastReset)) {
      return await this.resetUserDailyStats(user.id, now);
    }
    
    return user;
  }
  
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    
    return activity;
  }
  
  async getUserActivities(userId: number, limit: number = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }
}

// Cambia questa riga per utilizzare DatabaseStorage invece di MemStorage
export const storage = new DatabaseStorage();
