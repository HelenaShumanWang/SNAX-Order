import { eq, and, or, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users, items, orders, orderItems, eatRateConfirmations, friends, feedback,
  type User, type Item, type Order, type OrderItem, type EatRateConfirmation, type Friend, type Feedback,
} from "@shared/schema";

export interface IStorage {
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(data: { username: string; email: string; phoneNumber?: string; passwordHash: string }): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;

  getItems(category?: string): Promise<Item[]>;
  getItemById(id: number): Promise<Item | undefined>;
  createItem(data: Omit<Item, "id">): Promise<Item>;

  createOrder(data: { userId: number; deliveryAddress: string; deliveryTime: Date; totalCost: string; pledgeConfirmed: boolean }): Promise<Order>;
  getOrdersByUserId(userId: number): Promise<any[]>;
  getOrderById(id: number): Promise<any>;
  getDeliveredOrdersForTracker(userId: number): Promise<any[]>;
  updateOrderStatus(id: number, status: string): Promise<void>;

  createOrderItems(orderId: number, items: { itemId: number; quantity: number }[]): Promise<void>;

  createEatRateConfirmation(data: { orderId: number; userId: number; percentageEaten: number }): Promise<EatRateConfirmation>;
  getEatRateByOrderId(orderId: number): Promise<EatRateConfirmation | undefined>;

  getFriends(userId: number): Promise<any>;
  sendFriendRequest(userId1: number, userId2: number): Promise<Friend>;
  respondToFriendRequest(id: number, action: string): Promise<void>;

  createFeedback(data: { userId: number; orderId?: number; rating: number; comment?: string }): Promise<Feedback>;
}

export class DatabaseStorage implements IStorage {
  async getUserById(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(data: { username: string; email: string; phoneNumber?: string; passwordHash: string }) {
    const [user] = await db.insert(users).values({
      username: data.username,
      email: data.email,
      phoneNumber: data.phoneNumber || null,
      passwordHash: data.passwordHash,
    }).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>) {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async getItems(category?: string) {
    if (category && category !== "All") {
      return db.select().from(items).where(and(eq(items.isAvailable, true), eq(items.category, category)));
    }
    return db.select().from(items).where(eq(items.isAvailable, true));
  }

  async getItemById(id: number) {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async createItem(data: Omit<Item, "id">) {
    const [item] = await db.insert(items).values(data).returning();
    return item;
  }

  async createOrder(data: { userId: number; deliveryAddress: string; deliveryTime: Date; totalCost: string; pledgeConfirmed: boolean }) {
    const [order] = await db.insert(orders).values({
      userId: data.userId,
      deliveryAddress: data.deliveryAddress,
      deliveryTime: data.deliveryTime,
      totalCost: data.totalCost,
      pledgeConfirmed: data.pledgeConfirmed,
      status: "placed",
    }).returning();
    return order;
  }

  async getOrdersByUserId(userId: number) {
    const result = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    return result;
  }

  async getOrderById(id: number) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const ois = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    const itemDetails = await Promise.all(
      ois.map(async (oi) => {
        const item = await this.getItemById(oi.itemId!);
        return {
          ...oi,
          itemName: item?.name,
          itemPrice: item ? (parseFloat(item.price) * (oi.quantity || 1)).toFixed(2) : "0",
        };
      })
    );

    return { ...order, items: itemDetails };
  }

  async getDeliveredOrdersForTracker(userId: number) {
    const result = await db.select().from(orders)
      .where(and(
        eq(orders.userId, userId),
        or(eq(orders.status, "delivered"), eq(orders.status, "placed"), eq(orders.status, "preparing"), eq(orders.status, "out_for_delivery"), eq(orders.status, "completed"))
      ))
      .orderBy(desc(orders.createdAt));

    const ordersWithoutConfirmation = [];
    for (const order of result) {
      const existing = await this.getEatRateByOrderId(order.id);
      if (!existing) {
        const ois = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        const itemDetails = await Promise.all(
          ois.map(async (oi) => {
            const item = await this.getItemById(oi.itemId!);
            return { ...oi, itemName: item?.name };
          })
        );
        ordersWithoutConfirmation.push({ ...order, items: itemDetails });
      }
    }
    return ordersWithoutConfirmation;
  }

  async updateOrderStatus(id: number, status: string) {
    await db.update(orders).set({ status }).where(eq(orders.id, id));
  }

  async createOrderItems(orderId: number, itemsList: { itemId: number; quantity: number }[]) {
    for (const item of itemsList) {
      await db.insert(orderItems).values({
        orderId,
        itemId: item.itemId,
        quantity: item.quantity,
      });
    }
  }

  async createEatRateConfirmation(data: { orderId: number; userId: number; percentageEaten: number }) {
    const [confirmation] = await db.insert(eatRateConfirmations).values({
      orderId: data.orderId,
      userId: data.userId,
      percentageEaten: data.percentageEaten,
    }).returning();
    return confirmation;
  }

  async getEatRateByOrderId(orderId: number) {
    const [confirmation] = await db.select().from(eatRateConfirmations).where(eq(eatRateConfirmations.orderId, orderId));
    return confirmation;
  }

  async getFriends(userId: number) {
    const allFriendships = await db.select().from(friends)
      .where(or(eq(friends.userId1, userId), eq(friends.userId2, userId)));

    const accepted = [];
    const pending = [];

    for (const f of allFriendships) {
      const friendUserId = f.userId1 === userId ? f.userId2! : f.userId1!;
      const friendUser = await this.getUserById(friendUserId);
      if (!friendUser) continue;

      const friendData = {
        id: friendUser.id,
        friendshipId: f.id,
        username: friendUser.username,
        streakCount: friendUser.streakCount,
        avgEatRate: friendUser.avgEatRate,
      };

      if (f.status === "accepted") {
        accepted.push(friendData);
      } else if (f.status === "pending" && f.userId2 === userId) {
        pending.push(friendData);
      }
    }

    return { friends: accepted, pending };
  }

  async sendFriendRequest(userId1: number, userId2: number) {
    const [friendship] = await db.insert(friends).values({
      userId1,
      userId2,
      status: "pending",
    }).returning();
    return friendship;
  }

  async respondToFriendRequest(id: number, action: string) {
    if (action === "accept") {
      await db.update(friends).set({ status: "accepted" }).where(eq(friends.id, id));
    } else {
      await db.delete(friends).where(eq(friends.id, id));
    }
  }

  async createFeedback(data: { userId: number; orderId?: number; rating: number; comment?: string }) {
    const [fb] = await db.insert(feedback).values({
      userId: data.userId,
      orderId: data.orderId || null,
      rating: data.rating,
      comment: data.comment || null,
    }).returning();
    return fb;
  }
}

export const storage = new DatabaseStorage();
