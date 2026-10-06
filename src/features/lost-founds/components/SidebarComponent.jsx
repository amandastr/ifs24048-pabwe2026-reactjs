import {
  IconChartBar,
  IconChevronRight,
  IconLayoutDashboard,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";
import { NavLink, useLocation } from "react-router-dom";

const menus = [
  { to: "/", label: "Dashboard / Laporan", icon: IconLayoutDashboard, end: true },
  { to: "/stats", label: "Statistik", icon: IconChartBar },
  { to: "/users", label: "Pengguna", icon: IconUsers },
  { to: "/profile", label: "Profil Saya", icon: IconUserCircle },
];

export default function SidebarComponent({ open, onClose }) {
  const { pathname } = useLocation();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-[68px] bottom-0 left-0 z-40 flex w-64 flex-col justify-between border-r border-slate-200 bg-white p-4 transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <p className="mb-3 px-2 pt-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
            Menu Utama
          </p>
          <nav className="flex flex-col gap-1.5">
            {menus.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold ${
                    isActive || (to === "/" && pathname.startsWith("/lost-founds"))
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-3">
                      <Icon size={20} /> {label}
                    </span>
                    {(isActive || (to === "/" && pathname.startsWith("/lost-founds"))) && (
                      <IconChevronRight size={16} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="rounded-xl bg-indigo-50/70 px-4 py-3 text-sm">
          <p className="font-semibold">Delcom Lost &amp; Founds</p>
          <p className="text-indigo-600">Praktikum PABWE 2026</p>
        </div>
      </aside>
    </>
  );
}
