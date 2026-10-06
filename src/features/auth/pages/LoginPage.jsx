import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IconLock, IconLogin2, IconMail } from "@tabler/icons-react";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { asyncAuthLogin } from "../states/action";

const wrapper =
  "flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100";
const labelClass =
  "text-xs font-bold tracking-wider text-slate-600 uppercase";
const inputClass =
  "w-full bg-transparent text-sm outline-none placeholder:text-slate-400";

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
      showErrorDialog(String(error), "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="login-email-input" className={labelClass}>
          Alamat Email
        </label>
        <div className={wrapper}>
          <IconMail size={18} className="text-slate-400" />
          <input
            id="login-email-input"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="login-password-input" className={labelClass}>
          Kata Sandi
        </label>
        <div className={wrapper}>
          <IconLock size={18} className="text-slate-400" />
          <input
            id="login-password-input"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </div>
      </div>

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