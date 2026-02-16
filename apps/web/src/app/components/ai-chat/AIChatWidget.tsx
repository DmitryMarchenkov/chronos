import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type ClientSummaryState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; title: string | null; extract: string | null; url: string | null }
  | { status: 'error'; message: string };

type Props = {
  clientId: string;
  getSummary: (clientId: string) => Promise<{
    title?: string | null;
    extract?: string | null;
    url?: string | null;
  }>;
  sendChat: (clientId: string, message: string) => Promise<{ reply: string }>;
};

const ChatIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
  </svg>
);

const CloseIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const makeId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()));

export const AIChatWidget = ({ clientId, getSummary, sendChat }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: makeId(),
      role: 'assistant',
      content:
        "Hi — I can help with a high-level client assessment. I don't have access to your internal Chronos data yet, but I can use a public Wikipedia summary as context.",
    },
  ]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ClientSummaryState>({ status: 'idle' });

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (summary.status !== 'idle') {
      return;
    }

    let cancelled = false;
    setSummary({ status: 'loading' });
    getSummary(clientId)
      .then((response) => {
        if (cancelled) return;
        setSummary({
          status: 'loaded',
          title: response.title ?? null,
          extract: response.extract ?? null,
          url: response.url ?? null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setSummary({ status: 'error', message: (err as Error).message });
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, isOpen, summary.status]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) {
      return;
    }

    const text = input.trim();
    setInput('');
    setError(null);
    setSending(true);

    const userMessage: ChatMessage = { id: makeId(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await sendChat(clientId, text);
      const assistantMessage: ChatMessage = {
        id: makeId(),
        role: 'assistant',
        content: response.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError((err as Error).message);
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: 'assistant',
          content: "I couldn't send that message. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="ai-chat-root" aria-live="polite">
      {isOpen ? (
        <div className="ai-chat-panel card" role="dialog" aria-label="AI chat">
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <span>AI chat</span>
              <span className="muted ai-chat-subtitle">Client context (Wikipedia)</span>
            </div>
            <button
              type="button"
              className="ai-chat-icon-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="ai-chat-context muted">
            {summary.status === 'idle' ? 'Not specified' : null}
            {summary.status === 'loading' ? 'Loading summary…' : null}
            {summary.status === 'error' ? `Summary unavailable: ${summary.message}` : null}
            {summary.status === 'loaded' ? (
              <span>
                {summary.title ? <strong>{summary.title}:</strong> : null}{' '}
                {summary.extract?.trim().length ? summary.extract : 'Not specified'}
                {summary.url ? (
                  <>
                    {' '}
                    <a href={summary.url} target="_blank" rel="noreferrer">
                      Source
                    </a>
                  </>
                ) : null}
              </span>
            ) : null}
          </div>

          <div className="ai-chat-messages" ref={listRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === 'user' ? 'ai-chat-message ai-chat-message-user' : 'ai-chat-message'
                }
              >
                <div className="ai-chat-bubble">{message.content}</div>
              </div>
            ))}
          </div>

          {error ? <div className="error">{error}</div> : null}

          <form className="ai-chat-input-row" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about this client…"
              aria-label="Chat message"
              disabled={sending}
            />
            <button type="submit" disabled={!canSend}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        className="ai-chat-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
      >
        <ChatIcon />
      </button>
    </div>
  );
};

