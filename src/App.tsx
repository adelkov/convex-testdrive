import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function App() {
  const [text, setText] = useState("");
  const tasks = useQuery(api.tasks.get);
  const addTask = useMutation(api.tasks.post);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <SignedOut>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">My Task App</h1>
              <div className="flex gap-3">
                <SignInButton mode="modal">
                  <Button variant="outline">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Sign Up</Button>
                </SignUpButton>
              </div>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">My Task App</h1>
                <Badge variant="secondary">shadcn/ui ✨</Badge>
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <SignedOut>
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to the Task App</CardTitle>
                <CardDescription>
                  Please sign in to manage your tasks.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Tasks</CardTitle>
                <CardDescription>
                  Add and manage your daily tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter a new task..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && text.trim()) {
                        addTask({ text, isCompleted: false });
                        setText("");
                      }
                    }}
                  />
                  <Button 
                    onClick={() => {
                      if (text.trim()) {
                        addTask({ text, isCompleted: false });
                        setText("");
                      }
                    }}
                    disabled={!text.trim()}
                  >
                    Add Task
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  {tasks?.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No tasks yet. Add your first task above!
                    </p>
                  ) : (
                    tasks?.map(({ _id, text }) => (
                      <Card key={_id} className="bg-muted/50">
                        <CardContent className="p-4">
                          <p className="text-foreground">{text}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </SignedIn>
      </main>
    </div>
  );
}

export default App;
