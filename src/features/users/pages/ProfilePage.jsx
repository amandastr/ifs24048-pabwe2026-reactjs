import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "../../../helpers/toolsHelper";
import {
  asyncChangeProfile,
  asyncChangeProfilePassword,
  asyncChangeProfilePhoto,
  asyncGetProfile,
} from "../states/action";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.users.profile);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    dispatch(asyncGetProfile());
  }, [dispatch]);

  // Isi form dengan data profil terbaru
  useEffect(() => {
    setName(profile?.name ?? "");
    setEmail(profile?.email ?? "");
  }, [profile]);

  const handleProfile = async (e) => {
    e.preventDefault();
    try {
      await dispatch(asyncChangeProfile({ name, email })).unwrap();
      await showSuccessDialog("Profil diperbarui");
    } catch (error) {
      await showErrorDialog(String(error));
    }
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await dispatch(asyncChangeProfilePhoto(file)).unwrap();
      await dispatch(asyncGetProfile());
      await showSuccessDialog("Foto diperbarui");
    } catch (error) {
      await showErrorDialog(String(error));
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      await showWarningDialog("Konfirmasi kata sandi baru tidak sama");
      return;
    }

    try {
      await dispatch(
        asyncChangeProfilePassword({
          password: oldPassword,
          newPassword,
          newPasswordConfirmation: confirmPassword,
        })
      ).unwrap();

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      await showSuccessDialog("Kata sandi diubah");
    } catch (error) {
      await showErrorDialog(String(error));
    }
  };

  const input = "rounded-lg border border-slate-300 px-3 py-2";
  const button =
    "rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white";

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Profil Saya</h1>

      <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
          {profile?.photo ? (
            <img
              src={profile.photo}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>

        <input
          aria-label="Unggah foto profil"
          type="file"
          accept="image/*"
          onChange={handlePhoto}
        />
      </div>

      <form
        onSubmit={handleProfile}
        className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm"
      >
        <h2 className="font-bold">Informasi Akun</h2>

        <input
          aria-label="Nama lengkap"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={input}
        />

        <input
          aria-label="Alamat email"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={input}
        />

        <button type="submit" className={button}>
          Simpan
        </button>
      </form>

      <form
        onSubmit={handlePassword}
        className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm"
      >
        <h2 className="font-bold">Ubah Kata Sandi</h2>

        <input
          aria-label="Kata sandi lama"
          required
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Kata sandi lama"
          className={input}
        />

        <input
          aria-label="Kata sandi baru"
          required
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Kata sandi baru"
          className={input}
        />

        <input
          aria-label="Konfirmasi kata sandi baru"
          required
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Konfirmasi kata sandi baru"
          className={input}
        />

        <button type="submit" className={button}>
          Ubah Kata Sandi
        </button>
      </form>
    </div>
  );
}
