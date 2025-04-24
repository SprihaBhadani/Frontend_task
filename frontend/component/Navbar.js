import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();
  const loggedIn = typeof window !== "undefined" && localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav>
      <Link href="/">Home</Link>
      {loggedIn ? (
        <>
          <Link href="/courses">Courses</Link>
          <Link href="/enrollments">My Enrollments</Link>
          <button style={{marginLeft: "1rem"}} onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link href="/register">Register</Link>
          <Link href="/login">Login</Link>
        </>
      )}
    </nav>
  );
}