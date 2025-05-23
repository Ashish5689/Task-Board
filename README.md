<div align="center">
  <h1>📋 Real-Time Collaborative Task Board</h1>
  <p>
    <a href="https://task-board-gules-phi.vercel.app/" target="_blank">
      <strong>🌐 Live Demo</strong>
    </a>
    <span> • </span>
    <a href="#getting-started">🚀 Getting Started</a>
    <span> • </span>
    <a href="#features">✨ Features</a>
    <span> • </span>
    <a href="#tech-stack">💻 Tech Stack</a>
  </p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

<br/>

A modern, real-time collaborative task board application inspired by Trello, built with cutting-edge web technologies. This application enables seamless collaboration among team members with features like drag-and-drop task management, real-time updates, and user presence detection.

## 🚀 Quick Start

[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=for-the-badge&logo=codesandbox)](https://codesandbox.io/s/github/yourusername/task-board)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Ftask-board)

## ✨ Features

### 🎯 Core Functionality
- Create, edit, and delete columns (e.g., "To Do", "In Progress", "Done")
- Create, edit, and delete tasks with titles and descriptions
- Drag and drop tasks between columns
- Reorder tasks within columns
- Real-time synchronization across all connected clients

### 👥 User Authentication & Profiles
- User authentication with email/password and Google sign-in
- User profiles with customizable display names and avatars
- Protected routes for authenticated users
- User presence detection showing the number of online users

### 🔍 Task Ownership & Tracking
- Track task creation and modification by users
- Display user information on tasks they've created or modified

### 🚧 Enhanced Task Management (Coming Soon)
- Due dates and priority levels for tasks
- Task labels/tags with color coding
- File attachments to tasks (images, documents)
- Task checklists for subtasks

### 🤝 Collaboration Features (Coming Soon)
- Comments on tasks for team discussions
- Task assignment to specific users
- @mentions in comments
- Activity history for each task

### 📂 Workspace Organization (Coming Soon)
- Multiple boards for different projects
- Board templates for quick setup
- Board sharing with specific permissions
- Archived/completed tasks section

### 🎨 Visual Enhancements (Coming Soon)
- Custom background options for boards
- Card cover images
- Compact/expanded view options
- Progress bars for columns or projects

## 🛠️ Tech Stack

### Frontend
- **React** - JavaScript library for building user interfaces
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next Generation Frontend Tooling
- **Tailwind CSS** - Utility-first CSS framework
- **React DnD Kit** - Modern drag and drop

### Backend
- **Firebase Realtime Database** - Real-time data sync
- **Firebase Authentication** - User management
- **Firebase Hosting** - Production deployment

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Commitlint** - Commit message linting

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn
- Firebase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ashish5689/task-board.git
   cd task-board
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up Firebase**
   - Create a new project at [Firebase Console](https://console.firebase.google.com/)
   - Set up Authentication (Email/Password & Google Sign-In)
   - Create a Realtime Database
   - Get your Firebase configuration

4. **Configure environment**
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

5. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 📚 Documentation

### Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React context providers
├── firebase/       # Firebase configuration and services
├── pages/          # Page components
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

### Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) to get started.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React DnD Kit](https://dndkit.com/)

---

<div align="center">
  Made with ❤️ by [Ashish Jha](https://github.com/Ashish5689) | 
  <a href="https://task-board-gules-phi.vercel.app/">Live Demo</a> | 
  <a href="https://github.com/Ashish5689/task-board/issues">Report Bug</a> | 
  <a href="https://github.com/Ashish5689/task-board/pulls">Request Feature</a>
</div>