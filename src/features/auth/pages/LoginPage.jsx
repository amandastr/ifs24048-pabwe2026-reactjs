import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IconLock, IconLogin2, IconMail } from "@tabler/icons-react";
import Swal from "sweetalert2";
import { asyncAuthLogin } from "../states/action";
import IconInput from "../components/IconInput";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <IconInput
        id="login-email-input"
        label="Alamat Email"
        icon={IconMail}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="nama@email.com"
      />
      <IconInput
        id="login-password-input"
        label="Kata Sandi"
        icon={IconLock}
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />
      <button
        id="login-submit-button"
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-60"
      >
        <IconLogin2 size={20} />
        {loading ? "Memproses..." : "Masuk Sekarang"}
      </button>
    </form>
  );
}