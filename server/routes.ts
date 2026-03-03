import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgStore = connectPgSimple(session);

  app.use(
    session({
      store: new PgStore({ pool, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "snax-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: false, sameSite: "lax" },
    })
  );

  function requireAuth(req: any, res: any, next: any) {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, email, phoneNumber, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({ username, email, phoneNumber, passwordHash });

      req.session.userId = user.id;
      const { passwordHash: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user || !(await comparePasswords(password, user.passwordHash))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      const { passwordHash: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  // Profile
  app.get("/api/profile", requireAuth, async (req, res) => {
    const user = await storage.getUserById(req.session.userId!);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.put("/api/profile", requireAuth, async (req, res) => {
    const user = await storage.updateUser(req.session.userId!, req.body);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  });

  // Items
  app.get("/api/items", async (req, res) => {
    const category = req.query.category as string | undefined;
    const itemsList = await storage.getItems(category);
    res.json(itemsList);
  });

  app.get("/api/items/:id", async (req, res) => {
    const item = await storage.getItemById(parseInt(req.params.id));
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  });

  // Orders
  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const { deliveryAddress, deliveryTime, pledgeConfirmed, items: orderItemsList, totalCost } = req.body;

      const order = await storage.createOrder({
        userId: req.session.userId!,
        deliveryAddress,
        deliveryTime: new Date(deliveryTime),
        totalCost,
        pledgeConfirmed: pledgeConfirmed || false,
      });

      if (orderItemsList && orderItemsList.length > 0) {
        await storage.createOrderItems(order.id, orderItemsList);
      }

      setTimeout(() => storage.updateOrderStatus(order.id, "preparing"), 5000);
      setTimeout(() => storage.updateOrderStatus(order.id, "out_for_delivery"), 15000);
      setTimeout(() => storage.updateOrderStatus(order.id, "delivered"), 30000);

      res.status(201).json(order);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    const ordersList = await storage.getOrdersByUserId(req.session.userId!);
    res.json(ordersList);
  });

  app.get("/api/orders/pending", requireAuth, async (req, res) => {
    const pending = await storage.getDeliveredOrdersForTracker(req.session.userId!);
    res.json(pending);
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    const order = await storage.getOrderById(parseInt(req.params.id));
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  // Eat-rate confirmation
  app.post("/api/orders/:id/confirm-eat-rate", requireAuth, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { percentageEaten } = req.body;

      const confirmation = await storage.createEatRateConfirmation({
        orderId,
        userId: req.session.userId!,
        percentageEaten,
      });

      await storage.updateOrderStatus(orderId, "completed");

      const user = await storage.getUserById(req.session.userId!);
      if (user) {
        let newStreak = user.streakCount || 0;
        if (percentageEaten >= 50) {
          newStreak += 1;
        } else {
          newStreak = 0;
        }

        const allConfirmations = await storage.getUserById(req.session.userId!);
        const newAvg = user.avgEatRate
          ? ((parseFloat(user.avgEatRate) + percentageEaten) / 2).toFixed(2)
          : percentageEaten.toFixed(2);

        await storage.updateUser(user.id, {
          streakCount: newStreak,
          avgEatRate: newAvg,
        });
      }

      res.json(confirmation);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Friends
  app.get("/api/friends", requireAuth, async (req, res) => {
    const result = await storage.getFriends(req.session.userId!);
    res.json(result);
  });

  app.post("/api/friends/add", requireAuth, async (req, res) => {
    try {
      const { username } = req.body;
      const targetUser = await storage.getUserByUsername(username);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      if (targetUser.id === req.session.userId) {
        return res.status(400).json({ message: "Cannot add yourself" });
      }

      const friendship = await storage.sendFriendRequest(req.session.userId!, targetUser.id);
      res.status(201).json(friendship);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/friends/:id/respond", requireAuth, async (req, res) => {
    try {
      const { action } = req.body;
      await storage.respondToFriendRequest(parseInt(req.params.id), action);
      res.json({ message: `Friend request ${action}ed` });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/friends/:id/nudge", requireAuth, async (req, res) => {
    res.json({ message: "Nudge sent successfully" });
  });

  // Feedback
  app.post("/api/feedback", requireAuth, async (req, res) => {
    try {
      const { rating, comment, orderId } = req.body;
      const fb = await storage.createFeedback({
        userId: req.session.userId!,
        orderId,
        rating,
        comment,
      });
      res.status(201).json(fb);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  return httpServer;
}
