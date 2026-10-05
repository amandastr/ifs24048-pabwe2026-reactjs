import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { asyncAuthLogin } from "../states/action";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(asyncAuthLogin({ email, password })).unwrap();
      navigate("/");
    } catch (error) {
      Swal.fire({ icon: "error", title: "Login gagal", text: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-extrabold">Masuk</h2>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="rounded-lg border border-slate-300 px-3 py-2"
      />
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Kata sandi"
        className="rounded-lg border border-slate-300 px-3 py-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Memproses..." : "Masuk"}
      </button>
      <p className="text-sm text-slate-600">
        Belum punya akun?{" "}
        <Link to="/auth/register" className="font-semibold text-indigo-600">
          Daftar
        </Link>
      </p>
    </form>
  );
}
