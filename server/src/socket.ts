import jwt from 'jsonwebtoken';
import { Server as HttpServer } from 'node:http';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import User, { IUser } from './models/User.js';
import Workspace from './models/Workspace.js';

interface JwtPayload {
  userId: string;
  role: string;
}

interface SocketData {
  user: IUser;
}

type WorkspaceSocket = Socket<Record<string, never>, Record<string, never>, Record<string, never>, SocketData>;
let socketServer: Server | null = null;

export function workspaceRoom(workspaceId: string) {
  return `workspace:${workspaceId}`;
}

export function emitWorkspaceEvent(
  workspaceId: string,
  event: string,
  payload: unknown
) {
  socketServer?.to(workspaceRoom(workspaceId)).emit(event, payload);
}

export function initializeSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });
  socketServer = io;

  io.use(async (socket, next) => {
    const token = getSocketToken(socket);
    if (!token) {
      next(new Error('Not authorized, no token provided'));
      return;
    }

    try {
      const secret = process.env.JWT_SECRET || 'your-fallback-secret-key';
      const decoded = jwt.verify(token, secret) as JwtPayload;
      const user = await User.findById(decoded.userId).select('-passwordHash');

      if (!user) {
        next(new Error('User no longer exists'));
        return;
      }

      socket.data.user = user;
      next();
    } catch {
      next(new Error('Not authorized, token failed'));
    }
  });

  io.on('connection', (socket) => {
    let roomsBeforeDisconnect: string[] = [];

    socket.on('joinWorkspace', async (workspaceId: unknown, acknowledge?: (response: JoinResponse) => void) => {
      try {
        const response = await joinWorkspace(socket, workspaceId, io);
        acknowledge?.(response);
      } catch {
        acknowledge?.({ ok: false, message: 'Unable to join workspace' });
      }
    });

    socket.on('leaveWorkspace', async (workspaceId: unknown) => {
      if (typeof workspaceId !== 'string') return;
      try {
        await leaveWorkspace(socket, workspaceId, io);
      } catch {
      }
    });

    socket.on('disconnecting', () => {
      roomsBeforeDisconnect = [...socket.rooms]
        .filter((room) => room.startsWith('workspace:'))
        .map((room) => room.slice('workspace:'.length));
    });

    socket.on('disconnect', () => {
      for (const room of roomsBeforeDisconnect) {
        void broadcastPresence(io, room);
      }
    });
  });

  return io;
}

interface JoinResponse {
  ok: boolean;
  message?: string;
  workspaceId?: string;
  users?: PresenceUser[];
}

interface PresenceUser {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

async function joinWorkspace(
  socket: WorkspaceSocket,
  workspaceId: unknown,
  io: Server
): Promise<JoinResponse> {
  if (typeof workspaceId !== 'string' || !mongoose.isValidObjectId(workspaceId)) {
    return { ok: false, message: 'Invalid workspace ID' };
  }

  const workspace = await Workspace.findOne({
    _id: workspaceId,
    $or: [{ ownerId: socket.data.user._id }, { 'members.userId': socket.data.user._id }],
  });

  if (!workspace) {
    return { ok: false, message: 'You are not a member of this workspace' };
  }

  const room = workspaceRoom(workspaceId);
  await socket.join(room);
  const users = await getPresence(io, workspaceId);
  io.to(room).emit('presence:updated', { workspaceId, users });

  return { ok: true, workspaceId, users };
}

async function leaveWorkspace(socket: WorkspaceSocket, workspaceId: string, io: Server) {
  const room = workspaceRoom(workspaceId);
  if (!socket.rooms.has(room)) return;
  await socket.leave(room);
  await broadcastPresence(io, workspaceId);
}

async function broadcastPresence(io: Server, workspaceId: string) {
  const users = await getPresence(io, workspaceId);
  io.to(workspaceRoom(workspaceId)).emit('presence:updated', { workspaceId, users });
}

async function getPresence(io: Server, workspaceId: string): Promise<PresenceUser[]> {
  const sockets = await io.in(workspaceRoom(workspaceId)).fetchSockets();
  const users = new Map<string, PresenceUser>();

  for (const socket of sockets) {
    const user = socket.data.user as IUser | undefined;
    if (!user) continue;
    users.set(user._id.toString(), {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    });
  }

  return [...users.values()];
}

function getSocketToken(socket: Socket) {
  const token = socket.handshake.auth?.token;
  if (typeof token !== 'string') return undefined;
  return token.startsWith('Bearer ') ? token.slice('Bearer '.length).trim() : token;
}