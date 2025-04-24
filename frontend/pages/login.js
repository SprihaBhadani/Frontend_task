import { useState } from "react";
import { useRouter } from "next/router";
export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const res = await fetch(`${apiUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      router.push("/courses");
    } else {
      setMsg(data.error);
    }
  };
  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Login</button>
        {msg && <p className="error">{msg}</p>}
      </form>
    </div>
  );
}