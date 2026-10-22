import React, { useCallback, useEffect, useMemo, useReducer, useState } from "react";

const STATUSES = ["todo", "in-progress", "done"];
const PRIORITIES = { low: 1, medium: 2, high: 3 };
const STORAGE_KEY = "task-board";

export const taskLogic = {
  createTask(id, title, priority = "medium", dueDate = null) {
    return {
      id,
      title: title.trim(),
      priority,
      dueDate,
      status: "todo",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
  },

  validateTask(title, priority) {
    const errors = [];
    if (!title.trim()) errors.push("Title is required");
    if (title.trim().length > 100) errors.push("Title must be 100 characters or fewer");
    if (!(priority in PRIORITIES)) errors.push("Invalid priority");
    return errors;
  },

  nextStatus(status) {
    const index = STATUSES.indexOf(status);
    return STATUSES[Math.min(index + 1, STATUSES.length)];
  },

  previousStatus(status) {
    const index = STATUSES.indexOf(status);
    return STATUSES[Math.max(index - 1, 0)];
  },

  isOverdue(task, now = new Date()) {
    if (!task.dueDate || task.status === "done") return false;
    return new Date(task.dueDate) <= now;
  },

  sortTasks(tasks, key = "priority") {
    return [...tasks].sort((a, b) => {
      if (key === "priority") return PRIORITIES[b.priority] - PRIORITIES[a.priority];
      if (key === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return a.title.localeCompare(b.title);
    });
  },

  filterTasks(tasks, { query = "", priority = "" } = {}) {
    const term = query.trim().toLowerCase();
    return tasks.filter((task) =>
      (!term || task.title.toLowerCase().includes(term)) &&
      (!priority || task.priority === priority)
    );
  },

  groupByStatus(tasks) {
    return STATUSES.reduce((groups, status) => {
      groups[status] = tasks.filter((task) => task.status === status);
      return groups;
    }, {});
  },

  stats(tasks) {
    const done = tasks.filter((task) => task.status === "done").length;
    return {
      total: tasks.length,
      done,
      overdue: tasks.filter((task) => this.isOverdue(task)).length,
      progress: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    };
  },
};

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function tasksReducer(tasks, action) {
  switch (action.type) {
    case "add":
      return [...tasks, action.task];
    case "remove":
      return tasks.filter((task) => task.id !== action.id);
    case "move":
      return tasks.map((task) => {
        if (task.id !== action.id) return task;
        const status = action.direction === "forward"
          ? taskLogic.nextStatus(task.status)
          : taskLogic.previousStatus(task.status);
        return { ...task, status, completedAt: status === "done" ? new Date().toISOString() : null };
      });
    case "rename":
      return tasks.map((task) => task.id === action.id ? { ...task, title: action.title.trim() } : task);
    case "clearDone":
      return tasks.filter((task) => task.status !== "done");
    default:
      return tasks;
  }
}

export function useTasks() {
  const [tasks, dispatch] = useReducer(tasksReducer, [], loadTasks);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Storage can be unavailable (private mode); the board still works in memory.
    }
  }, [tasks]);

  const nextId = useMemo(() => tasks.length + 1, [tasks]);

  const addTask = useCallback((title, priority, dueDate) => {
    const errors = taskLogic.validateTask(title, priority);
    if (errors.length) return errors;
    dispatch({ type: "add", task: taskLogic.createTask(nextId, title, priority, dueDate || null) });
    return [];
  }, [nextId]);

  const removeTask = useCallback((id) => dispatch({ type: "remove", id }), []);
  const moveTask = useCallback((id, direction) => dispatch({ type: "move", id, direction }), []);
  const renameTask = useCallback((id, title) => {
    if (title.trim()) dispatch({ type: "rename", id, title });
  }, []);
  const clearDone = useCallback(() => dispatch({ type: "clearDone" }), []);

  return { tasks, addTask, removeTask, moveTask, renameTask, clearDone };
}

export function useTaskView(tasks) {
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("");
  const [sortKey, setSortKey] = useState("priority");

  const visible = useMemo(() => {
    const filtered = taskLogic.filterTasks(tasks, { query, priority });
    return taskLogic.groupByStatus(taskLogic.sortTasks(filtered, sortKey));
  }, [tasks, query, priority, sortKey]);

  const stats = useMemo(() => taskLogic.stats(tasks), [tasks]);

  return { query, setQuery, priority, setPriority, sortKey, setSortKey, visible, stats };
}

export function useTaskForm(onSubmit) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState([]);

  const submit = useCallback((event) => {
    event.preventDefault();
    const result = onSubmit(title, priority, dueDate);
    setErrors(result);
    if (result.length === 0) {
      setTitle("");
      setDueDate("");
    }
  }, [onSubmit, title, priority, dueDate]);

  return { title, setTitle, priority, setPriority, dueDate, setDueDate, errors, submit };
}

export function useKeyboardShortcut(key, handler) {
  useEffect(() => {
    const listener = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === key) {
        event.preventDefault();
        handler();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [key, handler]);
}

export default function TaskBoard() {
  const { tasks, addTask, removeTask, moveTask, clearDone } = useTasks();
  const view = useTaskView(tasks);
  const form = useTaskForm(addTask);

  useKeyboardShortcut("k", clearDone);

  return (
    <div>
      <h1>Task Board</h1>
      <p>{view.stats.done}/{view.stats.total} done · {view.stats.progress}% · {view.stats.overdue} overdue</p>
      <form onSubmit={form.submit}>
        <input value={form.title} placeholder="New task" onChange={(e) => form.setTitle(e.target.value)} />
        <select value={form.priority} onChange={(e) => form.setPriority(e.target.value)}>
          {Object.keys(PRIORITIES).map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <input type="date" value={form.dueDate} onChange={(e) => form.setDueDate(e.target.value)} />
        <button type="submit">Add</button>
        {form.errors.map((error) => <p key={error}>{error}</p>)}
      </form>
      <input value={view.query} placeholder="Search" onChange={(e) => view.setQuery(e.target.value)} />
      <select value={view.sortKey} onChange={(e) => view.setSortKey(e.target.value)}>
        <option value="priority">Priority</option>
        <option value="dueDate">Due date</option>
        <option value="title">Title</option>
      </select>
      <button onClick={clearDone}>Clear done (Ctrl+K)</button>
      {STATUSES.map((status) => (
        <section key={status}>
          <h2>{status} ({view.visible[status].length})</h2>
          {view.visible[status].map((task) => (
            <div key={task.id}>
              <span>{task.title} [{task.priority}]{taskLogic.isOverdue(task) && " ⚠ overdue"}</span>
              <button disabled={status === "todo"} onClick={() => moveTask(task.id, "back")}>←</button>
              <button disabled={status === "done"} onClick={() => moveTask(task.id, "forward")}>→</button>
              <button onClick={() => removeTask(task.id)}>Delete</button>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
