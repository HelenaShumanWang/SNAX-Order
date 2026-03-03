import { db } from "./db";
import { items } from "@shared/schema";
import { eq } from "drizzle-orm";

const seedItems = [
  {
    name: "Lemon-Almond Bar",
    description: "A zesty, protein-packed bar with real lemon zest and roasted almonds. Perfect for an afternoon energy boost.",
    price: "3.99",
    imageUrl: "/images/lemon-almond-bar.png",
    category: "Bars",
    nutritionalInfo: { calories: 220, protein: 12, carbs: 28, fat: 8 },
    isAvailable: true,
  },
  {
    name: "Blueberry Oats Cup",
    description: "Warm oatmeal topped with fresh blueberries and a drizzle of honey. A comforting and nutritious late-night snack.",
    price: "4.49",
    imageUrl: "/images/blueberry-oats.png",
    category: "Oats",
    nutritionalInfo: { calories: 280, protein: 8, carbs: 48, fat: 6 },
    isAvailable: true,
  },
  {
    name: "Dark Chocolate Trail Mix",
    description: "A mix of dark chocolate chips, almonds, cashews, and dried cranberries. Satisfyingly crunchy and rich.",
    price: "3.49",
    imageUrl: "/images/trail-mix.png",
    category: "Snacks",
    nutritionalInfo: { calories: 310, protein: 9, carbs: 32, fat: 18 },
    isAvailable: true,
  },
  {
    name: "Greek Yogurt Parfait",
    description: "Creamy Greek yogurt layered with crunchy granola and mixed berries. High in protein and naturally sweet.",
    price: "5.29",
    imageUrl: "/images/yogurt-parfait.png",
    category: "Dairy",
    nutritionalInfo: { calories: 250, protein: 18, carbs: 30, fat: 7 },
    isAvailable: true,
  },
  {
    name: "Avocado Toast Bites",
    description: "Mini whole-grain toasts topped with smashed avocado and everything seasoning. Savory and satisfying.",
    price: "4.99",
    imageUrl: "/images/avocado-toast.png",
    category: "Savory",
    nutritionalInfo: { calories: 200, protein: 5, carbs: 22, fat: 12 },
    isAvailable: true,
  },
  {
    name: "Banana Peanut Butter Wrap",
    description: "A whole wheat tortilla with banana slices and natural peanut butter. Simple, filling, and delicious.",
    price: "3.79",
    imageUrl: "/images/banana-pb-wrap.png",
    category: "Wraps",
    nutritionalInfo: { calories: 340, protein: 11, carbs: 42, fat: 15 },
    isAvailable: true,
  },
  {
    name: "Matcha Energy Balls",
    description: "No-bake energy balls with matcha, oats, and white chocolate chips. A gentle caffeine boost with great flavor.",
    price: "4.29",
    imageUrl: "/images/matcha-balls.png",
    category: "Snacks",
    nutritionalInfo: { calories: 180, protein: 6, carbs: 24, fat: 8 },
    isAvailable: true,
  },
  {
    name: "Veggie Hummus Cup",
    description: "Baby carrots, celery, and bell pepper strips with classic hummus. Crunchy, fresh, and full of fiber.",
    price: "3.99",
    imageUrl: "/images/veggie-hummus.png",
    category: "Savory",
    nutritionalInfo: { calories: 160, protein: 6, carbs: 20, fat: 7 },
    isAvailable: true,
  },
  {
    name: "Mixed Berry Smoothie",
    description: "A blend of strawberries, blueberries, banana, and almond milk. Refreshing and vitamin-packed.",
    price: "5.49",
    imageUrl: "/images/berry-smoothie.png",
    category: "Drinks",
    nutritionalInfo: { calories: 190, protein: 4, carbs: 42, fat: 2 },
    isAvailable: true,
  },
  {
    name: "Coconut Chia Pudding",
    description: "Creamy chia pudding made with coconut milk and topped with mango. A tropical, omega-3-rich treat.",
    price: "4.79",
    imageUrl: "/images/chia-pudding.png",
    category: "Desserts",
    nutritionalInfo: { calories: 230, protein: 7, carbs: 28, fat: 11 },
    isAvailable: true,
  },
];

export async function seedDatabase() {
  try {
    const existing = await db.select().from(items);
    if (existing.length > 0) {
      console.log("Database already seeded with items");
      return;
    }

    for (const item of seedItems) {
      await db.insert(items).values(item);
    }
    console.log(`Seeded ${seedItems.length} snack items`);
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}
