# Peer-to-Peer File Sharing App

> Status: Still under active development. Features are being added and improved regularly.

This is a real-time peer-to-peer file sharing web application built using WebRTC, Socket.IO, React, and TypeScript. It allows two users to join the same room and share files directly through a secure, serverless data channel — no file is stored on the server.

---

## Tech Stack

- Frontend: React + TypeScript + TailwindCSS
- Backend: Node.js + Express + Socket.IO
- Real-Time Communication: WebRTC (peer-to-peer data channel)
- Styling/UI Components: TailwindCSS, custom components like `HoverBorderGradient`

---

## Current Features

- Room-based connection: Users connect by entering the same room ID.
- File upload: Upload a file using drag-and-drop or file picker.
- Live peer detection: "Waiting for peer..." until connection is established.
- Chunked file transfer: Files are split and sent as chunks for efficiency.
- Direct P2P file sharing: Files are sent directly via WebRTC without going through the server.
- Send confirmation: Send button changes to “Sent” with a checkmark.
- Download received files: Users can download transferred files immediately.

---

## Planned Enhancements

These are features planned or under development.

- Login and Authentication  
  Allow users to create accounts and log in for secure, personalized access.

- Transfer History  
  Store and display a history of received and sent files (name, size, timestamp).

- Progress Indicator  
  Show progress during file upload and transfer.

- Multiple File Support  
  Send multiple files in one session.

- Connection Timeout/Error Handling  
  Notify users when a peer disconnects or connection fails.

- Dark/Light Mode Toggle  
  Provide an option to switch between themes.

---

## How It Works

1. User A and User B join the same room using a URL like:  
   `http://localhost:3000/fileshare?room=abc123`

2. Socket.IO handles the signaling process, letting each peer know when the other joins.

3. WebRTC uses that signal to create a direct connection between users.

4. Files are uploaded in the UI and sent in 16KB chunks via the WebRTC data channel.

5. The receiving peer reconstructs the chunks and gets a download link.

---

## Project Structure (Major Files)

```
/components
  └── ui/bordergradient/hover-border-gradient.tsx  # Stylish gradient upload button

/pages
  └── fileshare.tsx                                # Main file sharing logic and UI

/socket.ts                                         # Socket.IO client setup

/server.js                                        # Backend Express server + Socket.IO

/lib/utils.ts                                     # Utility functions like cn()
```

---

## Getting Started

### 1. Clone the Repo

```
git clone https://github.com/yourusername/p2p-file-share.git
cd p2p-file-share
```

### 2. Install Dependencies

```
npm install
```

### 3. Start the Backend

```
node server.js
```

### 4. Start the Frontend (Next.js / React)

```
npm run dev
```

Open `http://localhost:3000/fileshare?room=yourRoomId` to test.

---

## Contribution

Pull requests are welcome. Whether it's bug fixes, feature suggestions, or styling improvements — all contributions are appreciated.

---

## License

MIT License

---

## Demo (Coming Soon)

Live version will be deployed soon using Vercel or Netlify for frontend and Render or Railway for backend.
