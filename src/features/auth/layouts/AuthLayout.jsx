import { IconMapSearch } from "@tabler/icons-react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const tab = ({ isActive }) =>
  `rounded-lg px-4 py-2.5 text-center text-sm font-bold transition ${
    isActive ? "bg-white text-indigo-700 shadow-sm" : "text-slate-700"
  }`;

export default function AuthLayout() {
  const isAuthLogin = useSelector((state) => state.auth.isAuthLogin);

  if (isAuthLogin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-200">
          <IconMapSearch size={30} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Delcom Lost &amp; Founds
        </h1>
        <p className="mt-1 text-slate-500">
          Laporkan dan temukan barang hilang dengan mudah
        </p>
      </div>

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/70">
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          <NavLink to="/auth/login" className={tab}>
            Masuk Akun
          </NavLink>
          <NavLink to="/auth/register" className={tab}>
            Daftar Baru
          </NavLink>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
