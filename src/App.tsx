import "./App.css";
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

function App() {
  const [text, setText] = useState("");
  const tasks = useQuery(api.tasks.get);
  const addTask = useMutation(api.tasks.post);

  return (
    <div className="App">
      <header style={{ padding: "20px", borderBottom: "1px solid #ccc", marginBottom: "20px" }}>
        <SignedOut>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <h1>My Task App</h1>
            <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
              <SignInButton mode="modal">
                <button style={{ padding: "8px 16px", cursor: "pointer" }}>
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button style={{ padding: "8px 16px", cursor: "pointer" }}>
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </div>
        </SignedOut>
        <SignedIn>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h1>My Task App</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </header>

      <SignedOut>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h2>Welcome to the Task App</h2>
          <p>Please sign in to manage your tasks.</p>
        </div>
      </SignedOut>

      <SignedIn>
        <div style={{ padding: "20px" }}>
          <h2>Your Tasks</h2>
          <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
            <input 
              type="text" 
              value={text} 
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter a new task..."
              style={{ flex: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <button 
              onClick={() => {
                if (text.trim()) {
                  addTask({ text, isCompleted: false });
                  setText("");
                }
              }}
              style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Add Task
            </button>
          </div>
          <div>
            {tasks?.map(({ _id, text }) => (
              <div key={_id} style={{ padding: "10px", border: "1px solid #eee", borderRadius: "4px", marginBottom: "8px" }}>
                {text}
              </div>
            ))}
          </div>
        </div>
      </SignedIn>
    </div>
  );
}

export default App;
