import { Server as SocketIOServer } from 'socket.io';
import { db } from '../config/firebase';

export class WebSocketService {
  private io: SocketIOServer;
  private usersRef: any;

  constructor(server: any) {
    this.io = new SocketIOServer(server, {
      cors: { 
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    if (db) {
      this.usersRef = db.ref("users");
      this.setupFirebaseListeners();
      this.setupSocketHandlers();
    } else {
      console.warn('Firebase database not configured. WebSocket real-time features disabled.');
    }
  }

  private setupFirebaseListeners() {
    // Listen to all user changes
    this.usersRef.on('child_added', (snapshot: any) => {
      const userData = { id: snapshot.key, ...snapshot.val() };
      console.log('User created:', userData);
      this.broadcastUserChange('user_created', userData);
    });

    this.usersRef.on('child_changed', (snapshot: any) => {
      const userData = { id: snapshot.key, ...snapshot.val() };
      console.log('User updated:', userData);
      this.broadcastUserChange('user_updated', userData);
    });

    this.usersRef.on('child_removed', (snapshot: any) => {
      const userData = { id: snapshot.key, ...snapshot.val() };
      console.log('User deleted:', userData);
      this.broadcastUserChange('user_deleted', userData);
    });
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });

      // Send current users list to newly connected client
      socket.on('request_users', async () => {
        try {
          const snap = await this.usersRef.get();
          const val = (snap.val() || {}) as Record<string, any>;
          const allUsers = Object.entries(val).map(([id, payload]) => ({ id, ...payload }));
          socket.emit('users_list', allUsers);
        } catch (error) {
          console.error('Error fetching users for client:', error);
          socket.emit('error', { message: 'Failed to fetch users' });
        }
      });
    });
  }

  private broadcastUserChange(event: string, userData: any) {
    this.io.emit(event, userData);
  }

  public getIO() {
    return this.io;
  }

  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }
}
