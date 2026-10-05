import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { asyncAuthRegister, resetAuthStatus } from "../states/action";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      Swal.fire({ icon: "warning", title: "Kata sandi minimal 6 karakter" });
      return;
    }
    setLoading(true);
    try {
      await dispatch(asyncAuthRegister({ name, email, password })).unwrap();
      await Swal.fire({ icon: "success", title: "Registrasi berhasil" });
      dispatch(resetAuthStatus());
      navigate("/auth/login");
    } catch (error) {
      Swal.fire({ icon: "error", title: "Registrasi gagal", text: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-extrabold">Daftar</h2>
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama"
        className="rounded-lg border border-slate-300 px-3 py-2"
      />
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
        {loading ? "Memproses..." : "Daftar"}
      </button>
      <p className="text-sm text-slate-600">
        Sudah punya akun?{" "}
        <Link to="/auth/login" className="font-semibold text-indigo-600">
          Masuk
        </Link>
      </p>
    </form>
  );
}
