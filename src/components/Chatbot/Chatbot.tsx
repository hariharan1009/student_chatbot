'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.css';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  id: string;
};

export default function CareerAdvisor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: input },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content,
        id: Date.now().toString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I couldn't process your career question. Please try again.",
          id: Date.now().toString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <h2>Student Chatbot</h2>
        <p>Get expert advice on your academic questions</p>
      </div>
      
      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.welcomeMessage}>
            <p>Hello! I'm your student chatbot. How can I help with your academic questions today?</p>

          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.role === 'user' ? styles.userMessage : styles.assistantMessage
              }`}
            >
              <p>{message.content}</p>
            </div>
          ))
        )}
        {isLoading && (
          <div className={styles.message}>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your career question..."
          disabled={isLoading}
          className={styles.inputField}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={styles.sendButton}
        >
          {isLoading ? (
            <span className={styles.spinner}></span>
          ) : (
            'Ask'
          )}
        </button>
      </form>
    </div>
  );
}