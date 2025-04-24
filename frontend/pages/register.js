import { useState } from "react";
export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setMsg(data.message || data.error);
    } catch (error) {
      setMsg("Failed to connect to server. Please try again later.");
      console.error("Registration error:", error);
    }
  };
  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}