import { colorFor, initials } from '../lib/userColors';

export default function MessageList({ messages, myId, bottomRef }) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4">
      <div className="flex flex-col justify-end min-h-full">
        <ul className="space-y-3">
          {messages.map((msg, i) => {
            if (msg.type === 'system') {
              return (
                <li key={i} className="flex justify-center my-1">
                  <span className="text-[11px] text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">
                    {msg.text}
                  </span>
                </li>
              );
            }

            const isMe = msg.from === myId;
            const color = colorFor(msg.from);

            return (
              <li key={i} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMe && (
                  <div className={`shrink-0 w-7 h-7 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold`}>
                    {initials(msg.name)}
                  </div>
                )}
                <div className={`flex flex-col gap-1 max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-[11px] font-medium text-zinc-500 px-1">{msg.name}</span>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-snug break-words ${
                      isMe
                        ? 'bg-violet-600 text-white rounded-br-md'
                        : 'bg-white text-zinc-800 border border-zinc-200 rounded-bl-md shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
