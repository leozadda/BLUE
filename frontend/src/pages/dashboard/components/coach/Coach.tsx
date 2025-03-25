import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, ArrowRight, Pause, Check, X, Play } from 'lucide-react';
import './Coach.css';
import { authFetch } from '../../../auth/token/authFetch';
import { useAuth } from '../../../auth/auth-context/AuthContext';

// Base URL for API calls, pulled from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Interface defining the structure of a chat message
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'initial';
  timestamp: Date;
}

const Coach = () => {
  /**
   * State variable to hold the user ID. We set this once we have the user's info.
   */
  const [userId, setUserId] = useState<string>("");

  /**
   * Loading state (for data fetching or any async ops).
   */
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Error state, if something goes wrong during data fetch or other operations.
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * Example of a metric boolean you might use for toggling or tracking something.
   */
  const [metric, setMetric] = useState<boolean>(true);

  /**
   * Feedback message state, which could be used for displaying user feedback in your UI.
   */
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  /**
   * The main array of messages in the chat. 
   * We start with an empty array. 
   * (We used to have an 'initial' message here, but we removed it 
   *  in favor of a big header that displays conditionally.)
   */
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  /**
   * The text the user is currently typing in the input box.
   */
  const [inputMessage, setInputMessage] = useState<string>('');

  /**
   * Tracks whether the AI is "thinking" or processing a response.
   */
  const [isThinking, setIsThinking] = useState<boolean>(false);

  /**
   * Tracks whether the user has sent the first message yet. 
   * We use this to remove the big text header once the user starts chatting.
   */
  const [hasFirstMessageSent, setHasFirstMessageSent] = useState<boolean>(false);

  /**
   * We grab user information from our auth context, if available.
   */
  const { userInfo, userInfoLoading, refreshUserInfo } = useAuth();

  /**
   * A reference to the bottom of the chat messages, 
   * so we can automatically scroll into view when new messages arrive.
   */
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  /**
   * Function to scroll to the bottom of the chat message list.
   * We call this whenever messages change.
   */
  const scrollToBottom = () => {
    console.log('Scrolling to bottom of messages');
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * Whenever our 'messages' state updates, scroll to the newest message.
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Once user info is available, set the user ID. 
   * This effect runs whenever userInfo changes.
   */
  useEffect(() => {
    if (userInfo && userInfo.id) {
      console.log('User ID set:', userInfo.id);
      setUserId(userInfo.id);
    } else {
      console.log('No valid user ID found yet.');
    }
  }, [userInfo]);

  /**
   * Called when the user clicks the send button or presses Enter.
   * Sends the user's message to the chat and requests an AI response.
   */
  const handleSendMessage = async () => {
    // Prevent sending empty messages
    if (!inputMessage.trim()) {
      console.warn('Attempted to send an empty message. Aborting send.');
      return;
    }

    console.log('Sending message:', inputMessage);

    // Create a ChatMessage object for the user's message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    // Add the user's message to the list of messages
    setMessages(prev => [...prev, userMessage]);

    // Clear out the input field
    setInputMessage('');

    // Let the UI know we are waiting for an AI response
    setIsThinking(true);

    // Mark that the first message has now been sent (removes the big header)
    setHasFirstMessageSent(true);

    try {
      console.log('Attempting to fetch AI response from API:', API_BASE_URL);

      // Make a POST request to our AI chat endpoint
      // You might replace this with your actual LLM or AI endpoint
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include an authorization header here if your endpoint requires it
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          userId: userId
        })
      });

      // If the response is not 200-299, throw an error
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      // Parse the JSON response from the AI
      const aiResponseData = await response.json();
      console.log('Received AI response:', aiResponseData);

      // Create a ChatMessage object for the AI's response
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: aiResponseData.message,
        sender: 'ai',
        timestamp: new Date()
      };

      // Add the AI's message to the chat
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      // If there's an error, log it and show a placeholder message
      console.error('Chat error:', err);

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: 'Coming Soon!',
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // We are no longer waiting for a response
      setIsThinking(false);
    }
  };

  /**
   * Render the Coach component.
   */
  return (
    <div className="Coach-Main-Container">
      <div className="Coach-container">
        {/* Chat Messages Container */}
        <div className="chat-messages-container">
          {/* 
            A large text header (like ChatGPT) that displays 
            ONLY before the user sends their first message.
          */}
          {!hasFirstMessageSent && (
            <div className='default-ai-message'>
              <h1>How can I help?</h1>
            </div>
          )}

          {/* 
            Loop over our messages array and render each message.
          */}
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`chat-message ${
                message.sender === 'user' 
                  ? 'chat-message-user' 
                  : 'chat-message-ai'
              }`}
            >
              {message.content}
            </div>
          ))}

          {/* 
            If the AI is still processing, display a "Thinking..." message.
          */}
          {isThinking && (
            <div className="chat-message chat-message-ai">
              Thinking...
            </div>
          )}

          {/* 
            This is an empty div we scroll into view so the newest message is always visible.
          */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-container">
          <input 
            type="text"
            value={inputMessage}
            onChange={(e) => {
              console.log('User typing:', e.target.value);
              setInputMessage(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                console.log('Enter key pressed. Sending message...');
                handleSendMessage();
              }
            }}
            placeholder="Ask Anything..."
            className="chat-input"
          />
          <button 
            onClick={handleSendMessage}
            disabled={isThinking}
            className="chat-send-button"
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  );
};

export default Coach;
