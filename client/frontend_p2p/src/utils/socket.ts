// src/socket.ts
import { io, Socket } from 'socket.io-client';

export interface ServerToClientEvents {
  'user-joined': () => void;
  'offer': (offer: RTCSessionDescriptionInit) => void;
  'answer': (answer: RTCSessionDescriptionInit) => void;
  'ice-candidate': (candidate: RTCIceCandidateInit) => void;
}

export interface ClientToServerEvents {
  'join-room': (roomId: string) => void;
  'offer': (data: { roomId: string; offer: RTCSessionDescriptionInit }) => void;
  'answer': (data: { roomId: string; answer: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: { roomId: string; candidate: RTCIceCandidateInit }) => void;
}

// Create and export the socket instance
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:5000');

export default socket;
