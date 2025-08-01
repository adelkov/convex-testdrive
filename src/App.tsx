import "./App.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const tasks = useQuery(api.tasks.get);
  const addTask = useMutation(api.tasks.post);
  return (
    <div className="App">
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => addTask({ text, isCompleted: false })}>
        Add Task
      </button>
      {tasks?.map(({ _id, text }) => <div key={_id}>{text}</div>)}
    </div>
  );
}

export default App;
