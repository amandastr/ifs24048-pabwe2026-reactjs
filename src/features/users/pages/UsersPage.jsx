import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { asyncGetUsers } from "../states/action";

export default function UsersPage() {
  const dispatch = useDispatch();
  const { users, isLoading, error } = useSelector((state) => state.users);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    dispatch(asyncGetUsers());
  }, [dispatch]);

  const filtered = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">
        Daftar Pengguna
      </h1>

      <input
        aria-label="Cari pengguna"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Cari pengguna..."
        className="max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2"
      />

      {isLoading && (
        <p className="text-sm text-slate-500">Memuat...</p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <p className="text-sm text-slate-500">Pengguna tidak ditemukan.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-bold text-indigo-700">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                user.name?.charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold">
                {user.name}
              </p>
              <p className="truncate text-sm text-slate-500">
                {user.email}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
