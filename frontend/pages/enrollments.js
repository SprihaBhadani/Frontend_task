import { useEffect, useState } from "react";

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [msg, setMsg] = useState("");
  const [rating, setRating] = useState({});
  const [submitting, setSubmitting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch enrollments");
        return res.json();
      })
      .then(data => {
        setEnrollments(data.enrollments || []);
        setError("");
      })
      .catch(err => {
        setError("Failed to load enrollments. Please try again.");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [msg]);

  const handleRatingChange = (courseId, value) => {
    // Validate that the input is a number between 0-100
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      setRating({ ...rating, [courseId]: "" });
    } else {
      const clampedValue = Math.max(0, Math.min(100, numValue));
      setRating({ ...rating, [courseId]: clampedValue.toString() });
    }
  };

  const rate = async (course_id) => {
    if (!rating[course_id] || isNaN(Number(rating[course_id]))) {
      setMsg("Please enter a valid rating between 0 and 100");
      return;
    }
    
    setSubmitting(course_id);
    setMsg("");
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ course_id, rating: Number(rating[course_id]) }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit rating");
      }
      
      setMsg(data.message || "Rating submitted successfully!");
    } catch (err) {
      setMsg(err.message || "An error occurred while submitting your rating");
      console.error(err);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div>
      <h2>My Enrollments</h2>
      
      {loading ? (
        <p>Loading your enrollments...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : enrollments.length === 0 ? (
        <p>You are not enrolled in any courses yet.</p>
      ) : (
        <ul>
          {enrollments.map(e => (
            <li key={e.course_id} style={{ marginBottom: "15px", padding: "10px", border: "1px solid #eee", borderRadius: "5px" }}>
              <b>{e.course_name}</b> 
              <div style={{ margin: "5px 0" }}>
                <span>Your Rating: {e.rating || "Not rated"}</span>
                <span style={{ marginLeft: "10px" }}>Average Rating: {e.course_rating ? e.course_rating.toFixed(1) : "N/A"}</span>
              </div>
              
              {e.rating == null && (
                <div style={{ marginTop: "5px" }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Rate 0-100"
                    value={rating[e.course_id] || ""}
                    onChange={ev => handleRatingChange(e.course_id, ev.target.value)}
                    style={{width: "80px", marginRight: "10px"}}
                  />
                  <button 
                    onClick={() => rate(e.course_id)} 
                    disabled={submitting === e.course_id || !rating[e.course_id]}
                    style={{
                      padding: "3px 10px",
                      backgroundColor: submitting === e.course_id ? "#ccc" : "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: submitting === e.course_id ? "not-allowed" : "pointer"
                    }}
                  >
                    {submitting === e.course_id ? "Submitting..." : "Submit Rating"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      
      {msg && (
        <p style={{ 
          padding: "10px", 
          backgroundColor: msg.includes("error") || msg.includes("failed") ? "#ffdddd" : "#ddffdd",
          border: "1px solid",
          borderColor: msg.includes("error") || msg.includes("failed") ? "#f44336" : "#4CAF50",
          borderRadius: "5px"
        }}>
          {msg}
        </p>
      )}
    </div>
  );
}