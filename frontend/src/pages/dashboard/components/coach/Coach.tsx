import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, ArrowRight, Pause, Check, X, Play } from 'lucide-react';
import './Coach.css';
import { authFetch } from '../../../auth/token/authFetch';
import { useAuth } from '../../../auth/auth-context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'initial';
  timestamp: Date;
}

// New formatting component to handle bold and lists

const MessageContent = ({ content }: { content: string }) => {
  const blocks: Array<{ type: 'list'; items: string[] } | { type: 'line'; content: string }> = [];
  let currentList: string[] | null = null;
  let previousWasHeading = false;

  content.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    const isListItem = line.trimStart().startsWith('* ');
    const isHeading = /^\*\*.*\*\*$/.test(trimmedLine); // Updated heading detection

    // Process line with proper colon placement
    let processedLine = line
      // Move colons after bold markers into the bold section
      .replace(/\*\*([^*]+)\*\*(\s*:)/g, '**$1$2**')
      // Fix colon spacing in regular text
      .replace(/(\S)\s*:\s*(\S)/g, '$1: $2');

    if (isListItem) {
      const cleaned = processedLine.replace(/^\s*\*\s+/, '');
      currentList = currentList || [];
      currentList.push(cleaned);
      previousWasHeading = false;
    } else {
      if (currentList) {
        blocks.push({ type: 'list', items: currentList });
        currentList = null;
      }

      blocks.push({ type: 'line', content: processedLine });
      previousWasHeading = isHeading;
    }
  });

  if (currentList) blocks.push({ type: 'list', items: currentList });

  // Enhanced text processing
  const processLine = (text: string) => {
    const parts = text.split(/(\*\*)/g);
    let isBold = false;
    const elements: React.ReactNode[] = [];
    
    parts.forEach((part, i) => {
      if (part === '**') {
        isBold = !isBold;
        return;
      }
      if (isBold) {
        elements.push(<strong key={i}>{part.replace(/\s*:\s*$/, ':')}</strong>);
      } else {
        elements.push(part);
      }
    });
    
    return elements;
  };

  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === 'list') {
          return (
            <ul key={`list-${index}`} className="message-list">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{processLine(item)}</li>
              ))}
            </ul>
          );
        }
        
        return (
          <div key={`line-${index}`} className="message-line">
            {processLine(block.content)}
          </div>
        );
      })}
    </>
  );
};

const Coach = () => {
  // State variable to hold the user ID. We set this once we have the user's info.
  const [userId, setUserId] = useState<string>("");

  // Loading state (for data fetching or any async ops).
  const [loading, setLoading] = useState<boolean>(true);

  // Error state, if something goes wrong during data fetch or other operations.
  const [error, setError] = useState<string | null>(null);

  // Example of a metric boolean you might use for toggling or tracking something.
  const [metric, setMetric] = useState<boolean>(true);

  // Feedback message state, which could be used for displaying user feedback in your UI.
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // The main array of messages in the chat.
  // We start with an empty array.
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // The text the user is currently typing in the input box.
  const [inputMessage, setInputMessage] = useState<string>('');

  // Tracks whether the AI is "thinking" or processing a response.
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Tracks whether the user has sent the first message yet.
  // We use this to remove the big text header once the user starts chatting.
  const [hasFirstMessageSent, setHasFirstMessageSent] = useState<boolean>(false);

  // We grab user information from our auth context, if available.
  const { userInfo, userInfoLoading, refreshUserInfo } = useAuth();

  // A reference to the bottom of the chat messages,
  // so we can automatically scroll into view when new messages arrive.
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Function to scroll to the bottom of the chat message list.
  // We call this whenever messages change.
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Whenever our 'messages' state updates, scroll to the newest message.
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Once user info is available, set the user ID.
  // This effect runs whenever userInfo changes.
  useEffect(() => {
    if (userInfo && userInfo.id) {
      setUserId(userInfo.id);
    } else {
      console.error('No valid user ID found yet.');
    }
  }, [userInfo]);

  /**
   * Called when the user clicks the send button or presses Enter.
   * Sends the user's message to the chat and requests an AI response.
   * This function now uses streaming to handle partial responses from the API.
   */
  const handleSendMessage = async () => {
    // Prevent sending empty messages
    if (!inputMessage.trim()) {
      console.warn('Attempted to send an empty message. Aborting send.');
      return;
    }

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
      // Make a POST request to our AI chat endpoint.
      // This sends the user message along with the user ID.
      const response = await authFetch(`${API_BASE_URL}/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // You can include additional authorization headers here if required.
        },
        body: JSON.stringify({ 
          question: userMessage.content, // Notice we send 'question' as our field name.
          userId: userId
        })
      });

      // If the response is not OK (status code 200-299), throw an error.
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      // Create an empty AI message and add it to our messages array.
      // We will update this message incrementally as new data arrives from the stream.
      const aiMessageId = `ai-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: aiMessageId,
        content: '',
        sender: 'ai',
        timestamp: new Date()
      }]);

      // Set up the streaming reader to process the NDJSON response.
      if (!response.body) {
        throw new Error("Response body is null");
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      // Loop to read the response stream chunk by chunk.
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        
        // Decode the current chunk of bytes into a string.
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        // Split the accumulated text into lines (NDJSON is line-delimited)
        const lines = accumulated.split('\n');
        // Save any incomplete line back to the buffer.
        accumulated = lines.pop() || '';

// Inside the loop where lines are processed:
for (const line of lines) {
  if (!line.trim()) continue; // Skip empty lines

  try {
    // Parse the line directly as JSON (no 'data:' prefix)
    const data = JSON.parse(line.trim());

    if (data.content) { // Check for the 'content' field sent by the server
      const newContent = data.content;
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId ? { ...msg, content: msg.content + newContent } : msg
        )
      );
    }
  } catch (err) {
    console.error('Client parse error:', err);
  }


          
        }
      }
    } catch (err) {
      // If there's an error, log it and show a placeholder message.
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: 'Sorry, not enough tokens.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // We are no longer waiting for a response.
      setIsThinking(false);
    }
  };

  /**
   * Render the Coach component.
   */
  return (
    <div className="Coach-Main-Container">
      <div className="Coach-container">
        <div className="chat-messages-container">
          {!hasFirstMessageSent && (
            <div className='default-ai-message'>
              <h1>How can I help?</h1>
            </div>
          )}

          {messages.map((message) => (
            <div 
              key={message.id}
              className={`chat-message ${
                message.sender === 'user' 
                  ? 'chat-message-user' 
                  : 'chat-message-ai'
              }`}
            >
              <MessageContent content={message.content} />
            </div>
          ))}

          {isThinking && (
            <div className="chat-message chat-message-ai">
              ...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-container">
          <input 
            type="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
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
