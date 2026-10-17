import { useState } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  ArrowLeft,
  Shield,
  Info,
  Clock,
  CheckCheck,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import { useMatch } from '../context/MatchContext';
import { useAuth } from '../context/AuthContext';

export function ChatPage() {
  const { conversations, sendMessage } = useMatch();
  const { user } = useAuth();

  const [activeConvId, setActiveConvId] = useState(
    conversations[0]?.id || null
  );
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  const filteredConversations = conversations.filter((c) =>
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    sendMessage(activeConvId, inputText);
    setInputText('');
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4 animate-in fade-in duration-150">
      {/* Simulation Notice Banner */}
      <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <Info className="w-4 h-4 text-brand-600 shrink-0" />
          <span>Interactive Chat Demonstration — Messages are preserved in local session state.</span>
        </span>
        <span className="text-[10px] uppercase font-bold text-stone-400 hidden sm:inline">
          Phase 1 Mock UI
        </span>
      </div>

      {/* Main Chat Container */}
      <Card className="flex-1 flex overflow-hidden border-stone-200/90 shadow-subtle min-h-[500px]">
        {/* Left Panel: Conversation List */}
        <div
          className={`w-full md:w-80 border-r border-stone-200 bg-white flex flex-col ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-4 border-b border-stone-100 space-y-3">
            <h2 className="font-extrabold text-base text-charcoal">
              Connected Messages
            </h2>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Search accepted roommates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs text-charcoal placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400">
                No active conversations found. Accept a roommate request to unlock messaging.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      setMobileShowChat(true);
                    }}
                    className={`w-full text-left p-4 flex items-start gap-3 transition ${
                      isActive
                        ? 'bg-brand-50/60 border-l-2 border-brand-600'
                        : 'hover:bg-stone-50'
                    }`}
                  >
                    <Avatar
                      src={conv.user.profileImage}
                      name={conv.user.name}
                      size="md"
                      status="online"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-xs text-charcoal truncate">
                          {conv.user.name}
                        </h3>
                        <span className="text-[10px] text-stone-400 shrink-0">
                          {conv.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Chat Thread */}
        <div
          className={`flex-1 flex flex-col bg-stone-50/40 ${
            !mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-4 bg-white border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden p-1 rounded-lg text-stone-500 hover:bg-stone-100 mr-1"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar
                    src={activeConversation.user.profileImage}
                    name={activeConversation.user.name}
                    size="sm"
                    status="online"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-charcoal">
                      {activeConversation.user.name}
                    </h3>
                    <p className="text-[11px] text-emerald-600 font-medium">
                      Connected Roommate • Online
                    </p>
                  </div>
                </div>

                <div className="text-xs text-stone-400">
                  {activeConversation.user.college}
                </div>
              </div>

              {/* Message Bubble Stream */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5">
                {activeConversation.messages.map((msg) => {
                  if (msg.isSystem) {
                    return (
                      <div key={msg.id} className="text-center my-4">
                        <span className="text-[11px] bg-stone-200 text-stone-700 px-3 py-1 rounded-full font-medium">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.isMe ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                          msg.isMe
                            ? 'bg-brand-600 text-white rounded-br-none'
                            : 'bg-white border border-stone-200 text-charcoal rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-stone-400 mt-1 px-1 flex items-center gap-1">
                        <span>{msg.timestamp}</span>
                        {msg.isMe && <CheckCheck className="w-3 h-3 text-brand-600" />}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleSend}
                className="p-3.5 bg-white border-t border-stone-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Message ${activeConversation.user.name.split(' ')[0]}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs sm:text-sm text-charcoal placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!inputText.trim()}
                  icon={Send}
                >
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="Select a Conversation"
                description="Choose an accepted roommate connection from the sidebar to coordinate room hunting."
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default ChatPage;
