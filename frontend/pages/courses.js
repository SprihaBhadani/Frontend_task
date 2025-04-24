import { useEffect, useState } from "react";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [msg, setMsg] = useState("");
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCourses(data.courses || []));
  }, []);

  const enroll = async (course_id) => {
    setEnrolling(course_id);
    setMsg("");
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ course_id }),
    });
    const data = await res.json();
    setMsg(data.message || data.error);
    setEnrolling(null);
  };

  return (
    <div>
      <h2>All Courses</h2>
      <ul>
        {courses.map(c => (
          <li key={c.ID}>
            <b>{c.name}</b> (Avg Rating: {c.rating ? c.rating.toFixed(1) : "N/A"})
            <button style={{marginLeft: "1rem"}} onClick={() => enroll(c.ID)} disabled={enrolling === c.ID}>
              Enroll
            </button>
          </li>
        ))}
      </ul>
      <p>{msg}</p>
    </div>
  );
}