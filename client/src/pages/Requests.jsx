import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const savedUser = localStorage.getItem("user");
  const user = savedUser
    ? JSON.parse(savedUser)
    : null;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetch(
  `http://localhost:5000/api/requests/${user.id}`
)
      .then((response) => response.json())
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "Error fetching requests:",
          error
        );
        setLoading(false);
      });
  }, []);

  const updateRequest = async (
    requestId,
    action
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/requests/${requestId}/${action}`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);

        setRequests(
          (previousRequests) =>
            previousRequests.map(
              (request) =>
                request._id === requestId
                  ? {
                      ...request,
                      status:
                        action === "accept"
                          ? "Accepted"
                          : "Rejected",
                    }
                  : request
            )
        );
      } else {
        alert(
          data.message ||
            "Something went wrong"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Unable to connect to the server"
      );
    }
  };

  if (!user) {
    return (
      <div className="requests-page">
        <h1>Requests</h1>
        <p>
          Please login to view your requests.
        </p>
      </div>
    );
  }

  const incomingRequests =
    requests.filter(
      (request) =>
        request.receiver?._id === user.id
    );

  const sentRequests =
    requests.filter(
      (request) =>
        request.sender?._id === user.id
    );

  return (
    <div className="requests-page">

      <div className="requests-header">
        <h1>Swap Requests</h1>

        <p>
          Manage your skill exchange requests.
        </p>
      </div>

      {/* Incoming Requests */}
      <section className="request-section">

        <h2>
          📥 Incoming Requests
        </h2>

        {loading ? (
          <p>
            Loading requests...
          </p>
        ) : incomingRequests.length === 0 ? (
          <div className="no-requests">
            <p>
              No incoming requests.
            </p>
          </div>
        ) : (
          <div className="requests-list">

            {incomingRequests.map(
              (request) => (
                <div
                  className="request-card"
                  key={request._id}
                >

                  <div className="request-info">

                    <h3>
                      {request.sender?.name}
                      {" "}wants to exchange
                      skills
                    </h3>

                    <p>
                      <strong>
                        They can teach:
                      </strong>{" "}
                      {request.skillId
                        ?.teachSkill ||
                        "Skill"}
                    </p>

                    <p>
                      <strong>
                        They want to learn:
                      </strong>{" "}
                      {request.skillId
                        ?.learnSkill ||
                        "Skill"}
                    </p>

                    <p>
                      <strong>
                        Status:
                      </strong>{" "}

                      <span
                        className={`request-status ${request.status.toLowerCase()}`}
                      >
                        {request.status}
                      </span>
                    </p>

                  </div>

                  {/* Pending */}
                  {request.status ===
                    "Pending" && (
                    <div className="request-actions">

                      <button
                        className="accept-button"
                        onClick={() =>
                          updateRequest(
                            request._id,
                            "accept"
                          )
                        }
                      >
                        Accept
                      </button>

                      <button
                        className="reject-button"
                        onClick={() =>
                          updateRequest(
                            request._id,
                            "reject"
                          )
                        }
                      >
                        Reject
                      </button>

                    </div>
                  )}

                  {/* Accepted */}
                  {request.status ===
                    "Accepted" && (
                    <div className="request-chat-button">

                      <Link
                        to={`/chat/${request.sender?._id}`}
                      >
                        <button className="chat-button">
                          💬 Chat
                        </button>
                      </Link>

                    </div>
                  )}

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* Sent Requests */}
      <section className="request-section">

        <h2>
          📤 Sent Requests
        </h2>

        {loading ? (
          <p>
            Loading requests...
          </p>
        ) : sentRequests.length === 0 ? (
          <div className="no-requests">
            <p>
              You haven't sent any requests yet.
            </p>
          </div>
        ) : (
          <div className="requests-list">

            {sentRequests.map(
              (request) => (
                <div
                  className="request-card"
                  key={request._id}
                >

                  <div className="request-info">

                    <h3>
                      Request sent to{" "}
                      {request.receiver?.name}
                    </h3>

                    <p>
                      <strong>
                        They can teach:
                      </strong>{" "}
                      {request.skillId
                        ?.teachSkill ||
                        "Skill"}
                    </p>

                    <p>
                      <strong>
                        They want to learn:
                      </strong>{" "}
                      {request.skillId
                        ?.learnSkill ||
                        "Skill"}
                    </p>

                    <p>
                      <strong>
                        Status:
                      </strong>{" "}

                      <span
                        className={`request-status ${request.status.toLowerCase()}`}
                      >
                        {request.status}
                      </span>
                    </p>

                  </div>

                  {/* Accepted */}
                  {request.status ===
                    "Accepted" && (
                    <div className="request-chat-button">

                      <Link
                        to={`/chat/${request.receiver?._id}`}
                      >
                        <button className="chat-button">
                          💬 Chat
                        </button>
                      </Link>

                    </div>
                  )}

                  {/* Rejected */}
                  {request.status ===
                    "Rejected" && (
                    <p className="rejected-message">
                      This request was rejected.
                    </p>
                  )}

                  {/* Pending */}
                  {request.status ===
                    "Pending" && (
                    <p className="pending-message">
                      Waiting for response...
                    </p>
                  )}

                </div>
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}

export default Requests;