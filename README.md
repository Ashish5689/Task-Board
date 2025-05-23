# Real-Time Collaborative Task Board

A real-time collaborative task board application similar to Trello, built with React, TypeScript, and Firebase. This application allows multiple users to create, edit, delete, and reorder tasks and columns in real-time, with advanced task management and collaboration features.

## Features

### Core Functionality
- Create, edit, and delete columns (e.g., "To Do", "In Progress", "Done")
- Create, edit, and delete tasks with titles and descriptions
- Drag and drop tasks between columns
- Reorder tasks within columns
- Real-time synchronization across all connected clients

### User Authentication & Profiles
- User authentication with email/password and Google sign-in
- User profiles with customizable display names and avatars
- Protected routes for authenticated users
- User presence detection showing the number of online users

### Task Ownership & Tracking
- Track task creation and modification by users
- Display user information on tasks they've created or modified

### Enhanced Task Management (Coming Soon)
- Due dates and priority levels for tasks
- Task labels/tags with color coding
- File attachments to tasks (images, documents)
- Task checklists for subtasks

### Collaboration Features (Coming Soon)
- Comments on tasks for team discussions
- Task assignment to specific users
- @mentions in comments
- Activity history for each task

### Workspace Organization (Coming Soon)
- Multiple boards for different projects
- Board templates for quick setup
- Board sharing with specific permissions
- Archived/completed tasks section

### Visual Enhancements (Coming Soon)
- Custom background options for boards
- Card cover images
- Compact/expanded view options
- Progress bars for columns or projects

## Tech Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Drag and Drop**: @dnd-kit library
- **Backend**: Firebase Realtime Database
- **Other**: UUID for generating unique IDs

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd task-board
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase project:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Set up a Realtime Database
   - Set up authentication (if needed)
   - Get your Firebase configuration

4. Configure environment variables:
   - Create a `.env` file in the project root
   - Add your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Architecture and Data Flow

### Data Models

- **Column**: `{ id: string, title: string, taskIds: string[] }`
- **Task**: `{ id: string, title: string, description?: string, createdAt: string, updatedAt: string }`
- **Presence**: `{ userId: string, online: boolean, lastActive: string }`

### Real-time Synchronization

The application uses Firebase Realtime Database to synchronize data across clients:

1. When a user makes a change (create/edit/delete/move), the change is sent to Firebase
2. Firebase updates the database and notifies all connected clients
3. All clients receive the update and update their UI accordingly

### Optimistic Updates

The application implements optimistic updates to provide a smooth user experience:

1. When a user makes a change, the UI is updated immediately
2. The change is sent to Firebase in the background
3. If the operation fails, the UI is rolled back to the previous state

## Trade-offs and Limitations

- **Scalability**: The current implementation works well for small to medium-sized boards. For larger boards with hundreds of tasks, performance optimizations would be needed.
- **Offline Support**: The application requires an internet connection to function properly. Offline support could be added using Firebase's offline capabilities.
- **Conflict Resolution**: In case of concurrent edits, the last write wins. A more sophisticated conflict resolution strategy could be implemented for production use.
- **Authentication**: The current implementation uses a simple user ID stored in localStorage. For a production application, proper authentication should be implemented.

## License

MIT
