import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { asyncGetProfile } from "../../users/states/action";
import NavbarComponent from "../components/NavbarComponent";
import SidebarComponent from "../components/SidebarComponent";

export default function LostFoundLayout() {
  const dispatch = useDispatch();
  const isAuthLogin = useSelector((state) => state.auth.isAuthLogin);
  const profile = useSelector((state) => state.users.profile);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthLogin) dispatch(asyncGetProfile());
  }, [dispatch, isAuthLogin]);

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
