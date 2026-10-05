import { IconSearch } from "@tabler/icons-react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AuthLayout() {
  const isAuthLogin = useSelector((state) => state.auth.isAuthLogin);

  // Sudah login -> langsung ke beranda
  if (isAuthLogin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-lg md:grid-cols-2">
        <div className="hidden flex-col justify-center gap-3 bg-indigo-600 p-10 text-white md:flex">
          <IconSearch size={48} />
          <h1 className="text-3xl font-extrabold">Lost &amp; Founds</h1>
          <p className="text-indigo-100">
            Laporkan barang hilang dan temukan kembali barang yang tertinggal.
          </p>
        </div>
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
