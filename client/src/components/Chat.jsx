import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import MessageList from './MessageList';
import UserList from './UserList';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3700';

const ADJECTIVES = ['Swift', 'Brave', 'Clever', 'Happy', 'Calm', 'Bold', 'Keen', 'Witty', 'Odd', 'Jolly'];
const NOUNS = ['Panda', 'Falcon', 'Otter', 'Gecko', 'Lemur', 'Ferret', 'Capybara', 'Axolotl', 'Quokka', 'Narwhal'];
const randomName = () =>
  `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]}${NOUNS[Math.floor(Math.random() * NOUNS.length)]}`;

export default function Chat() {
  const { socket, connected } = useSocket(SERVER_URL);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [input, setInput] = useState('');
  const [placeholder] = useState(randomName);
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    socket.on('message', (data) => setMessages((prev) => [...prev, data]));
    socket.on('users', (list) => setUsers(list));
    return () => {
      socket.off('message');
      socket.off('users');
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function join(e) {
    e.preventDefault();
    if (!socket) return;
    socket.emit('join', username.trim() || placeholder);
    setJoined(true);
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    socket.emit('send', { text: input });
    setInput('');
  }

  if (!joined) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50">
        <form
          onSubmit={join}
          className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 w-80"
        >
          <h1 className="text-xl font-semibold text-zinc-800">Join the chat</h1>
          <input
            autoFocus
            className="border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"
            placeholder={placeholder}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            Join
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-100 font-sans">
      <UserList users={users} myId={socket?.id} />
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-zinc-200 shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800">General</span>
            <span className="text-xs text-zinc-400">{users.length} member{users.length !== 1 ? 's' : ''}</span>
          </div>
          <span className={`flex items-center gap-1.5 text-xs font-medium ${
            connected ? 'text-emerald-600' : 'text-red-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              connected ? 'bg-emerald-500' : 'bg-red-500'
            }`} />
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </header>

        <MessageList messages={messages} myId={socket?.id} bottomRef={bottomRef} />

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="flex items-center gap-2 px-4 py-3 bg-white border-t border-zinc-200 shrink-0"
        >
          <input
            autoFocus
            className="flex-1 bg-zinc-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-colors"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
          />
          <button
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 active:scale-95 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

