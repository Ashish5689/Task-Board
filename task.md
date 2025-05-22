# Real-Time Collaborative Task Board – AI Prompt

## 🧩 Project Overview

Build a **real-time collaborative task board** similar to **Trello** using:
- **Vite + React (with Hooks)**
- **Tailwind CSS** for styling
- **Firebase Realtime Database** for backend

The board should allow **multiple users** to:
- Create, edit, delete **columns**
- Create, edit, delete **tasks**
- Drag and drop tasks between columns
- See **real-time updates** instantly across clients

---

## ✅ Requirements

### 🔹 Frontend
- Use **Vite** for project setup
- **React Hooks** for UI logic
- **Tailwind CSS** for styling
- Use `react-beautiful-dnd` or `dnd-kit` for drag-and-drop

### 🔹 Features

#### 📁 Columns
- Create, update, delete columns (e.g., "To Do", "In Progress", "Done")
- Store tasks in a specific order using `taskIds`

#### ✅ Tasks
- Create, edit, delete tasks
- Each task must include:
  - `id`: UUID
  - `title`: string (required)
  - `description`: optional
  - `createdAt`: ISO timestamp
  - `updatedAt`: ISO timestamp

#### 🔄 Drag-and-Drop
- Tasks can be reordered within a column
- Tasks can be moved between columns
- Optional bonus: allow column reordering

### 🔹 Real-Time Sync with Firebase
- Use **Firebase Realtime Database**
- Sync all operations (add, edit, delete, move) in **real-time**
- Handle:
  - Multiple users connected simultaneously
  - Correct update order (avoid race conditions)
  - Reconnection logic (on refresh or disconnect)
- Apply **optimistic UI updates**

### 🔹 User Presence
- Show number of users online
- (Optional) Show which user is editing a task
- Use Firebase presence system with `onDisconnect()`

---

## 🧩 Data Models

### Column
```ts
{
  id: string;
  title: string;
  taskIds: string[]; // ordered list of task IDs
}
```

### TASK
{
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

### (Optional) Presence
{
  userId: string;
  online: boolean;
  lastActive: string;
}
```

### Tech Setup (AI should do this)
	1.	Initialize React app with Vite
	2.	Install dependencies:
     - npm install tailwindcss react-beautiful-dnd firebase uuid
    3.	Set up Tailwind CSS with PostCSS and Vite
	4.	Initialize Firebase:
	    - Setup project on Firebase Console
	    - Enable Realtime Database
	    - Setup public rules for dev/testing (read/write allowed)
	5.	Create folders:
	    src/
├── components/
├── context/
├── hooks/
├── firebase/
├── types/
└── utils/

### Firebase Integration Tasks
	•	Create a firebase.js file to initialize Firebase
	•	Create utility functions for:
	•	Reading/writing tasks and columns
	•	Subscribing to data changes in real-time
	•	Handle presence detection on user connection/disconnection



### UX Expectations
	•	Use optimistic updates to provide fast feedback
	•	On failure, rollback changes and show error
	•	On page load or reconnect, fetch the latest state
	•	Use transitions for smoother UI (optional)
	    
### Final Deliverables
	•	GitHub repository with:
	•	Full source code
	•	Clear commit history
	•	README including:
	•	Setup and run instructions
	•	Explanation of real-time architecture and data flow
	•	Trade-offs and limitations