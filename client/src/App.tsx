import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { BottomNav } from "@/components/bottom-nav";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import SignupPage from "@/pages/signup";
import LoginPage from "@/pages/login";
import HomePage from "@/pages/home";
import CatalogPage from "@/pages/catalog";
import ItemDetailsPage from "@/pages/item-details";
import ChatbotPage from "@/pages/chatbot";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import ConfirmationPage from "@/pages/confirmation";
import TrackerPage from "@/pages/tracker";
import RewardPage from "@/pages/reward";
import LossPage from "@/pages/loss";
import FeedbackPage from "@/pages/feedback";
import ProfilePage from "@/pages/profile";
import FriendsPage from "@/pages/friends";

function AuthenticatedRoutes() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/home" component={HomePage} />
        <Route path="/catalog" component={CatalogPage} />
        <Route path="/item/:id" component={ItemDetailsPage} />
        <Route path="/chatbot/:id" component={ChatbotPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/confirmation/:id" component={ConfirmationPage} />
        <Route path="/tracker" component={TrackerPage} />
        <Route path="/reward" component={RewardPage} />
        <Route path="/loss" component={LossPage} />
        <Route path="/feedback" component={FeedbackPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/friends" component={FriendsPage} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </>
  );
}

function UnauthenticatedRoutes() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/login" component={LoginPage} />
      <Route component={LandingPage} />
    </Switch>
  );
}

function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <AuthenticatedRoutes /> : <UnauthenticatedRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <div className="max-w-lg mx-auto min-h-screen bg-background">
              <AppRouter />
            </div>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
