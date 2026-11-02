import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function Chat() {
  const { userId } = useParams();

  const savedUser = localStorage.getItem("user");
  const currentUser = savedUser
    ? JSON.parse(savedUser)
    : null;

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [receiverName, setReceiverName] =
    useState("Student");

  const [loading, setLoading] = useState(true);
  const [chatAllowed, setChatAllowed] =
    useState(true);

  // Fetch the other student's name
  const fetchReceiver = async () => {
    if (!userId) {
      return;
    }

    try {
      const response = await fetch(
        `https://skillswap-backend-jjao.onrender.com/api/auth/user/${userId}`
      );

      const data = await response.json();

      if (response.ok) {
        setReceiverName(data.name);
      }
    } catch (error) {
      console.error(
        "Error fetching student details:",
        error
      );
    }
  };

  // Fetch chat messages
  const fetchMessages = async () => {
    if (!currentUser || !userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://skillswap-backend-jjao.onrender.com/api/messages/${currentUser.id}/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to access chat"
        );
      }

      setMessages(data);
      setChatAllowed(true);
      setLoading(false);
    } catch (error) {
      console.error(
        "Chat access error:",
        error
      );

      setChatAllowed(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceiver();
    fetchMessages();

    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [userId]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) {
      return;
    }

    if (!currentUser) {
      alert("Please login first");
      return;
    }

    try {
      const response = await fetch(
        "https://skillswap-backend-jjao.onrender.com/api/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: currentUser.id,
            receiver: userId,
            message: messageText,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessageText("");

        setMessages((previousMessages) => [
          ...previousMessages,
          {
            ...data.chatMessage,
            sender: {
              _id: currentUser.id,
              name: currentUser.name,
            },
          },
        ]);
      } else {
        alert(
          data.message ||
            "Failed to send message"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Unable to send message");
    }
  };

  // Not logged in
  if (!currentUser) {
    return (
      <div className="chat-page">
        <h1>Chat</h1>
        <p>
          Please login to use chat.
        </p>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="chat-page">
        <div className="chat-header">
          <h1>Chat</h1>
          <p>
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  // Chat not allowed
  if (!chatAllowed) {
    return (
      <div className="chat-page">
        <div className="chat-access-denied">
          <h1>Chat Unavailable</h1>

          <p>
            Chat is available only after your
            skill swap request has been accepted.
          </p>

          <Link to="/requests">
            <button className="back-to-requests-button">
              Go to Requests
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">

      {/* Chat Header */}
      <div className="chat-header">
        <h1>
          Chat with {receiverName}
        </h1>

        <p>
          Discuss your skill exchange and
          learning plans.
        </p>
      </div>

      {/* Messages */}
      <div className="chat-box">

        {messages.length === 0 ? (
          <div className="no-messages">
            <p>
              No messages yet.
            </p>

            <p>
              Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {

            const isMyMessage =
              message.sender?._id ===
              currentUser.id;

            return (
              <div
                key={message._id}
                className={
                  isMyMessage
                    ? "message my-message"
                    : "message received-message"
                }
              >
                <div className="message-content">

                  <p>
                    {message.message}
                  </p>

                  <span>
                    {new Date(
                      message.createdAt
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                </div>
              </div>
            );
          })
        )}

      </div>

      {/* Message Input */}
      <form
        className="chat-input-area"
        onSubmit={sendMessage}
      >
        <input
          type="text"
          placeholder="Type your message..."
          value={messageText}
          onChange={(e) =>
            setMessageText(e.target.value)
          }
        />

        <button type="submit">
          Send
        </button>
      </form>

    </div>
  );
}

export default Chat;