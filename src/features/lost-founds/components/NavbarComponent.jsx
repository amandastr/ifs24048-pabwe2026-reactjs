import { useState } from "react";
import {
  IconChevronDown,
  IconLogout,
  IconMapSearch,
  IconMenu2,
  IconUserCircle,
} from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { asyncAuthLogout } from "../../auth/states/action";

export default function NavbarComponent({ profile, onToggleSidebar }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 hover:bg-slate-100 md:hidden"
          onClick={onToggleSidebar}
          aria-label="Buka menu"
        >
          <IconMenu2 size={22} />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <IconMapSearch size={22} />
        </div>
        <span className="text-xl font-extrabold tracking-tight">
          Delcom Lost &amp; Founds
        </span>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
        >
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-bold text-indigo-700">
            {profile?.photo ? (
              <img src={profile.photo} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              profile?.name?.charAt(0).toUpperCase() ?? "?"
            )}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm leading-tight font-bold">
              {profile?.name ?? "Pengguna"}
            </span>
            <span className="block text-xs text-slate-500">{profile?.email}</span>
          </span>
          <IconChevronDown size={16} className="text-slate-400" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-100"
            >
              <IconUserCircle size={18} /> Profil Saya
            </Link>
            <button
              type="button"
              onClick={() => dispatch(asyncAuthLogout())}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <IconLogout size={18} /> Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
