import { useEffect, useState } from "react";
import { listUsers, deleteUser, updateUser, type User } from "../../lib/api";
import { useWebSocket } from "../../hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Skeleton } from "@/components/atoms/skeleton";
import { Alert, AlertDescription } from "@/components/atoms/alert";
import { Separator } from "@/components/atoms/separator";
import UserForm from "../molecules/UserForm";
import { 
  RefreshCw, 
  Users, 
  MapPin, 
  Clock, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  ChevronRight,
  User as UserIcon,
} from "lucide-react";

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  
  const { socket, isConnected } = useWebSocket('http://localhost:8080');

  async function refresh() {
    setLoading(true);
    try {
      setUsers(await listUsers());
    } finally {
      setLoading(false);
    }
  }

  // WebSocket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleUserCreated = (newUser: User) => {
      console.log('User created via WebSocket:', newUser);
      setUsers(prev => [newUser, ...prev]);
    };

    const handleUserUpdated = (updatedUser: User) => {
      console.log('User updated via WebSocket:', updatedUser);
      setUsers(prev => prev.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
    };

    const handleUserDeleted = (deletedUser: User) => {
      console.log('User deleted via WebSocket:', deletedUser);
      setUsers(prev => prev.filter(user => user.id !== deletedUser.id));
    };

    const handleUsersList = (usersList: User[]) => {
      console.log('Received users list via WebSocket:', usersList);
      setUsers(usersList);
      setLoading(false);
    };

    const handleError = (error: Error) => {
      console.error('WebSocket error:', error);
    };

    socket.on('user_created', handleUserCreated);
    socket.on('user_updated', handleUserUpdated);
    socket.on('user_deleted', handleUserDeleted);
    socket.on('users_list', handleUsersList);
    socket.on('error', handleError);

    // Request initial users list
    socket.emit('request_users');

    return () => {
      socket.off('user_created', handleUserCreated);
      socket.off('user_updated', handleUserUpdated);
      socket.off('user_deleted', handleUserDeleted);
      socket.off('users_list', handleUsersList);
      socket.off('error', handleError);
    };
  }, [socket]);

  // Fallback to API if WebSocket is not connected
  useEffect(() => {
    if (!isConnected && users.length === 0) {
      refresh();
    }
  }, [isConnected, users.length]);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) return;
    
    setDeletingUser(userId);
    try {
      await deleteUser(userId);
      // No need to call refresh() - WebSocket will handle the update
      setExpandedUser(null);
    } finally {
      setDeletingUser(null);
    }
  };

  const toggleExpanded = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  return (
    <Card className="shadow-soft-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-2xl">
              Users ({users.length})
              {isConnected && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Live
                </span>
              )}
            </CardTitle>
          </div>
          <Button 
            onClick={refresh} 
            variant="outline" 
            size="sm"
            disabled={loading}
            className="transition-all duration-200 hover:scale-105 hover:shadow-md border-primary/20 hover:border-primary/40"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <CardDescription className="text-base">
          Manage existing users and their location information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : users.length === 0 ? (
          <Alert>
            <UserIcon className="h-4 w-4" />
            <AlertDescription>
              No users found. Create your first user to get started!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {users.map((user, index) => (
              <Card 
                key={user.id} 
                className="transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1 bg-gradient-to-r from-white to-slate-50/50 border-0 shadow-soft animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="space-y-5">
                    {/* User Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-soft">
                          <UserIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-xl text-foreground truncate">{user.name}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-full">
                              <MapPin className="h-3 w-3 text-blue-600" />
                              <span className="font-medium">{user.zipCode}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 px-3 py-1 rounded-full">
                              <Clock className="h-3 w-3 text-green-600" />
                              <span className="font-medium">{user.timezone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <Badge variant="secondary" className="text-sm font-medium px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-0">
                          {user.country}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExpanded(user.id)}
                          className="transition-all duration-200 hover:scale-105 hover:shadow-md border-primary/20 hover:border-primary/40 px-2 sm:px-3"
                        >
                          {expandedUser === user.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <Edit3 className="h-4 w-4 ml-1 hidden sm:inline" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          disabled={deletingUser === user.id}
                          className="transition-all duration-200 hover:scale-105 hover:shadow-md px-2 sm:px-3"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Location Details */}
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-950/30 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-orange-100 dark:bg-orange-950/30 rounded-lg">
                          <MapPin className="h-4 w-4 text-orange-600" />
                        </div>
                        <span className="font-semibold text-foreground">Coordinates:</span>
                        <span className="text-muted-foreground font-mono">
                          {user.latitude.toFixed(3)}, {user.longitude.toFixed(3)}
                        </span>
                      </div>
                    </div>

                    {/* Edit Form */}
                    {expandedUser === user.id && (
                      <div className="space-y-6 animate-fade-in-up">
                        <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                        <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                          <div className="space-y-4">
                            <h4 className="font-semibold text-lg flex items-center gap-3 text-foreground">
                              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                                <Edit3 className="h-4 w-4 text-white" />
                              </div>
                              Edit User
                            </h4>
                            <UserForm
                              initial={{
                                name: user.name,
                                zipCode: user.zipCode,
                                country: user.country,
                              }}
                              onSubmit={async (data) => {
                                await updateUser(user.id, {
                                  name: data.name,
                                  zipCode: data.zipCode,
                                  country: data.country,
                                });
                                // No need to call refresh() - WebSocket will handle the update
                                setExpandedUser(null);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
