import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, UserPlus, Bell, Flame, Check, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function FriendsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchUsername, setSearchUsername] = useState("");

  const { data: friendsData, isLoading } = useQuery<any>({
    queryKey: ["/api/friends"],
    enabled: !!user,
  });

  const addFriendMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await apiRequest("POST", "/api/friends/add", { username });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Friend request sent!" });
      setSearchUsername("");
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: string }) => {
      const res = await apiRequest("PUT", `/api/friends/${id}/respond`, { action });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
    },
  });

  const nudgeMutation = useMutation({
    mutationFn: async (friendId: number) => {
      const res = await apiRequest("POST", `/api/friends/${friendId}/nudge`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Nudge sent!", description: "Your friend has been notified" });
    },
  });

  const friends = friendsData?.friends || [];
  const pendingRequests = friendsData?.pending || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-muted-foreground mb-4" data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-2xl font-bold mb-6" data-testid="text-friends-title">Friends</h1>

        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-3">Add a Friend</p>
            <div className="flex gap-2">
              <Input
                placeholder="Search by username"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                data-testid="input-add-friend"
              />
              <Button
                onClick={() => searchUsername.trim() && addFriendMutation.mutate(searchUsername.trim())}
                disabled={addFriendMutation.isPending || !searchUsername.trim()}
                data-testid="button-add-friend"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {pendingRequests.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Pending Requests ({pendingRequests.length})
            </h2>
            <div className="space-y-3">
              {pendingRequests.map((req: any) => (
                <Card key={req.id} data-testid={`pending-${req.id}`}>
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {req.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-semibold text-sm">{req.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => respondMutation.mutate({ id: req.friendshipId, action: "accept" })}
                        data-testid={`button-accept-${req.friendshipId}`}
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => respondMutation.mutate({ id: req.friendshipId, action: "reject" })}
                        data-testid={`button-reject-${req.friendshipId}`}
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Your Friends ({friends.length})
          </h2>
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground" data-testid="text-no-friends">No friends yet. Add someone above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend: any) => (
                <Card key={friend.id} data-testid={`friend-${friend.id}`}>
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {friend.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{friend.username}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span>{friend.streakCount || 0} streak</span>
                          <span>|</span>
                          <span>{parseFloat(friend.avgEatRate || "0").toFixed(0)}% eat rate</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => nudgeMutation.mutate(friend.friendshipId)}
                      data-testid={`button-nudge-${friend.id}`}
                    >
                      <Bell className="w-3.5 h-3.5 mr-1" />
                      Nudge
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
