# Enterprise Task Manager

An interactive, full-stack Kanban workspace for managing sprint work across customizable columns. The project pairs a responsive Next.js board with an Express API and MongoDB persistence, giving teams a fast way to create, prioritize, move, and remove tasks.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248?logo=mongodb&logoColor=white)

## Highlights

- Drag and drop tasks between columns with optimistic UI updates.
- Create custom columns and tasks directly from the board.
- Assign task priorities from `LOW` through `URGENT` with clear visual states.
- Persist board changes through a REST API backed by MongoDB.
- Keep frontend state predictable with Zustand and typed domain models.
- Use a focused component structure built around the Next.js App Router.

## Architecture

```text
Next.js 16 + React 19
	|
	| REST / JSON
	v
Express 5 API + CORS
	|
	v
MongoDB via Mongoose
```

The repository contains two applications:

- `app/`, `components/`, and `lib/` contain the Next.js frontend.
- `server/` contains the standalone Express and Mongoose backend.

## Tech Stack

| Area | Tools |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Interaction | `@dnd-kit/core`, `@dnd-kit/sortable` |
| State | Zustand |
| Backend | Express, TypeScript, CORS |
| Database | MongoDB, Mongoose |
| Tooling | ESLint, PostCSS, Next.js App Router |

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- A running MongoDB instance, local or hosted

### 1. Install frontend dependencies

From the repository root:

```bash
npm install
```

### 2. Install backend dependencies

```bash
cd server
npm install
cd ..
```

### 3. Configure the backend

Create `server/.env` when you need to override the defaults:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/enterprise-task-manager
```

The server uses the values above by default, so a local MongoDB installation requires no additional configuration.

### 4. Start the applications

Run the API in one terminal:

```bash
cd server
npm run dev
```

Run the Next.js frontend in a second terminal from the repository root:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend uses `http://localhost:5000/api` as its default API URL. To point it elsewhere, create `.env.local` in the repository root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## API Reference

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check API availability |
| `GET` | `/api/tasks` | List tasks |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `GET` | `/api/columns` | List columns |
| `POST` | `/api/columns` | Create a column |

## Available Scripts

From the repository root:

```bash
npm run dev      # Start the Next.js development server
npm run lint     # Run ESLint
npm run build    # Build the frontend for production
npm run start    # Serve the production frontend
```

From `server/`:

```bash
npm run dev      # Start the API with file watching
npm run build    # Compile the API to dist/
npm run start    # Start the compiled API
```

## Project Structure

```text
app/                    Next.js routes and global styles
components/kanban/      Board, column, and task UI
lib/store.ts             Zustand state and API synchronization
lib/api.ts               Typed API helpers
types/                   Shared domain models
server/src/controllers/  Task and column request handlers
server/src/models/       Mongoose models
server/src/routes/       Express route definitions
```

## Project Status

The core board workflow is implemented. Authentication, multi-user workspaces, and richer task editing are natural next steps for evolving this into a broader team productivity platform.

## License

This project is currently unlicensed. Add a license before distributing it for reuse.


