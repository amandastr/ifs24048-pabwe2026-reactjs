import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IconLock, IconMail, IconUser, IconUserPlus } from "@tabler/icons-react";
import Swal from "sweetalert2";
import { asyncAuthRegister, resetAuthStatus } from "../states/action";
import IconInput from "../components/IconInput";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <IconInput
        id="register-name-input"
        name="name"
        label="Nama Lengkap"
        icon={IconUser}
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama kamu"
      />
      <IconInput
        id="register-email-input"
        name="email"
        label="Alamat Email"
        icon={IconMail}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="nama@email.com"
      />
      <IconInput
        id="register-password-input"
        name="password"
        label="Kata Sandi"
        icon={IconLock}
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Minimal 6 karakter"
      />
      <button
        id="register-submit-button"
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-60"
      >
        <IconUserPlus size={20} />
        {loading ? "Memproses..." : "Daftar Sekarang"}
      </button>
    </form>
  );
}
