import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { apiRequest } from "../../../helpers/apiHelper";

const showError = (error) =>
  Swal.fire({ icon: "error", title: "Gagal", text: error.message });

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const loadProfile = () =>
    apiRequest("/users/me")
      .then((json) => {
        const user = json.data?.user;
        setName(user?.name ?? "");
        setEmail(user?.email ?? "");
        setPhoto(user?.photo ?? null);
      })
      .catch(showError);

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfile = async (e) => {
    e.preventDefault();
    try {
      await apiRequest("/users/me", { method: "PUT", body: { name, email } });
      Swal.fire({ icon: "success", title: "Profil diperbarui" });
    } catch (error) {
      showError(error);
    }
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append("photo", file);
    try {
      await apiRequest("/users/me/photo", { method: "POST", body });
      await loadProfile();
      Swal.fire({ icon: "success", title: "Foto diperbarui" });
    } catch (error) {
      showError(error);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    try {
      await apiRequest("/users/me/password", {
        method: "PUT",
        body: { password: oldPassword, new_password: newPassword },
      });
      setOldPassword("");
      setNewPassword("");
      Swal.fire({ icon: "success", title: "Kata sandi diubah" });
    } catch (error) {
      showError(error);
    }
  };

  const input = "rounded-lg border border-slate-300 px-3 py-2";
  const button = "rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white";

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Profil Saya</h1>

      <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
          {photo ? (
            <img src={photo} alt={name} className="h-full w-full object-cover" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
        <input type="file" accept="image/*" onChange={handlePhoto} />
      </div>

      <form onSubmit={handleProfile} className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-bold">Informasi Akun</h2>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={input} />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        <button type="submit" className={button}>Simpan</button>
      </form>

      <form onSubmit={handlePassword} className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-bold">Ubah Kata Sandi</h2>
        <input required type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Kata sandi lama" className={input} />
        <input required type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Kata sandi baru" className={input} />
        <button type="submit" className={button}>Ubah Kata Sandi</button>
      </form>
    </div>
  );
}
