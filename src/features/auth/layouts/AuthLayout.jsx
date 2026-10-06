import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { IconMapSearch } from "@tabler/icons-react";

const tabClass = ({ isActive }) =>
  `rounded-lg px-4 py-2 text-center text-sm font-semibold transition ${
    isActive
      ? "bg-white text-slate-900 shadow-sm"
      : "text-slate-600 hover:text-slate-900"
  }`;

// Kerangka halaman login dan register.
// Pengguna yang sudah login dialihkan ke dashboard.
export default function AuthLayout() {
  const isAuthLogin = useSelector((state) => state.auth.isAuthLogin);

  if (isAuthLogin) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <IconMapSearch size={30} />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">
            Delcom Lost &amp; Founds
          </h1>
          <p className="mt-1 text-slate-500">
            Laporkan dan temukan barang hilang dengan mudah
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            <NavLink to="/auth/login" className={tabClass}>
              Masuk
            </NavLink>
            <NavLink to="/auth/register" className={tabClass}>
              Daftar
            </NavLink>
          </div>
          <Outlet />
        </div>
      </div>
    </main>
  );
}
