import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StreakBadge } from "@/components/streak-badge";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { LogOut, Settings, Users, Package, TrendingUp, ClipboardCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: orders } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) return null;

  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" data-testid="text-profile-title">Profile</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-lg" data-testid="text-username">{user.username}</h2>
            <p className="text-sm text-muted-foreground" data-testid="text-email">{user.email}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold" data-testid="text-streak">{user.streakCount || 0}</p>
              <p className="text-[10px] text-muted-foreground">Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <ClipboardCheck className="w-4 h-4 text-orange-500 mx-auto mb-1" />
              <p className="text-xl font-bold" data-testid="text-avg-eat-rate">{parseFloat(user.avgEatRate || "0").toFixed(0)}%</p>
              <p className="text-[10px] text-muted-foreground">Eat Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Package className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold" data-testid="text-orders-count">{orders?.length || 0}</p>
              <p className="text-[10px] text-muted-foreground">Orders</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="orders" className="flex-1" data-testid="tab-orders">Orders</TabsTrigger>
            <TabsTrigger value="friends" className="flex-1" data-testid="tab-friends">Friends</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4">
            {!orders || orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order: any) => (
                  <Link key={order.id} href={`/confirmation/${order.id}`}>
                    <Card className="hover-elevate cursor-pointer" data-testid={`order-${order.id}`}>
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm">Order #{order.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-primary">${parseFloat(order.totalCost || "0").toFixed(2)}</p>
                          <Badge variant="secondary" className="text-[10px]">{order.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="friends" className="mt-4">
            <Link href="/friends">
              <Button className="w-full mb-4" variant="outline" data-testid="button-manage-friends">
                <Users className="w-4 h-4 mr-2" />
                Manage Friends
              </Button>
            </Link>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Dietary Preferences</p>
                  <div className="flex flex-wrap gap-2">
                    {(user.dietaryPreferences as string[] || []).length > 0 ? (
                      (user.dietaryPreferences as string[]).map((pref) => (
                        <Badge key={pref} variant="secondary">{pref}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No preferences set</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
