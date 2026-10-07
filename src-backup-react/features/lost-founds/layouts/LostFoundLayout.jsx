import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiRequest } from "../../../helpers/apiHelper";
import NavbarComponent from "../components/NavbarComponent";
import SidebarComponent from "../components/SidebarComponent";

export default function LostFoundLayout() {
  const isAuthLogin = useSelector((state) => state.auth.isAuthLogin);
  const [profile, setProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLogin) return;
    apiRequest("/users/me")
      .then((json) => setProfile(json.data?.user ?? null))
      .catch(() => setProfile(null));
  }, [isAuthLogin]);

  if (!isAuthLogin) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarComponent
        profile={profile}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
      <SidebarComponent open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="p-4 md:ml-64 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
