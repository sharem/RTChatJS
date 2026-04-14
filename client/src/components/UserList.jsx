import { colorFor, initials } from '../lib/userColors';

export default function UserList({ users, myId }) {
  return (
    <aside className="w-60 bg-zinc-900 flex flex-col shrink-0">
      {/* Sidebar header */}
      <div className="px-5 py-4 border-b border-zinc-700/60">
        <p className="text-lg font-bold text-white tracking-tight">RTChat</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span className="text-xs text-zinc-400">
            {users.length} online
          </span>
        </div>
      </div>

      {/* User list */}
      <div className="px-3 pt-4 pb-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-2 mb-2">Members</p>
      </div>
      <ul className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {users.map((user) => {
          const color = colorFor(user.id);
          const isMe = user.id === myId;
          return (
            <li
              key={user.id}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                isMe ? 'bg-zinc-700/50' : 'hover:bg-zinc-800/60'
              }`}
            >
              <div className={`relative shrink-0 w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold`}>
                {initials(user.name)}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-zinc-900 rounded-full" />
              </div>
              <div className="min-w-0">
                <p className={`text-sm truncate leading-tight ${
                  isMe ? 'text-white font-semibold' : 'text-zinc-300'
                }`}>
                  {user.name}
                </p>
                {isMe && (
                  <p className="text-[10px] text-zinc-500 leading-tight">You</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

