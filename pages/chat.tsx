import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import styles from '../styles/Chat.module.css'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const Chat: NextPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chatgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      })

      const data = await response.json()

      if (data.error) {
        console.error('Error:', data.error)
        setMessages([
          ...newMessages,
          { role: 'assistant', content: `Error: ${data.error}` },
        ])
      } else {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: data.message },
        ])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Error: Failed to send message' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>ChatGPT - Next.js App</title>
        <meta name="description" content="Chat with ChatGPT" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>ChatGPT</h1>

        <div className={styles.chatContainer}>
          <div className={styles.messagesContainer}>
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                <p>Start a conversation with ChatGPT</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${styles.message} ${
                  message.role === 'user' ? styles.userMessage : styles.assistantMessage
                }`}
              >
                <div className={styles.messageRole}>
                  {message.role === 'user' ? 'You' : 'ChatGPT'}
                </div>
                <div className={styles.messageContent}>{message.content}</div>
              </div>
            ))}
            {loading && (
              <div className={`${styles.message} ${styles.assistantMessage}`}>
                <div className={styles.messageRole}>ChatGPT</div>
                <div className={styles.messageContent}>Thinking...</div>
              </div>
            )}
          </div>

          <div className={styles.inputContainer}>
            <textarea
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              disabled={loading}
              rows={3}
            />
            <button
              className={styles.sendButton}
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Chat
