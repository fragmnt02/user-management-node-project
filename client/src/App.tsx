import { useState } from "react";
import { createUser } from "./lib/api";
import UserForm from "./components/molecules/UserForm";
import UsersList from "./components/organisms/UsersList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Alert, AlertDescription } from "@/components/atoms/alert";
import { CheckCircle, Users, Plus } from "lucide-react";

export default function App() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-soft-lg">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold gradient-text">
              User Management
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Manage users with location data powered by Express, Firebase RTDB, and OpenWeather API
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-2">
          <Card className="h-fit shadow-soft-lg border-0 bg-white/80 backdrop-blur-sm animate-slide-in-right">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl">Create New User</CardTitle>
              </div>
              <CardDescription className="text-base">
                Add a new user to the system with their location information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserForm
                onSubmit={async (data) => {
                  await createUser(data);
                  setMessage("User created successfully!");
                  setTimeout(() => setMessage(null), 3000);
                }}
              />
              {message && (
                <Alert className="mt-6 border-green-200 bg-green-50/80 backdrop-blur-sm dark:border-green-800 dark:bg-green-950/80 animate-fade-in-up">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <UsersList />
          </div>
        </div>
      </main>
    </div>
  );
}
