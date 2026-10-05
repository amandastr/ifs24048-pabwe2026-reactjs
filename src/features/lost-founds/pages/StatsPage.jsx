import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { asyncGetLostFounds } from "../states/action";

// Mengelompokkan laporan berdasarkan kunci tanggal (hari / bulan)
const group = (items, keyOf, limit) => {
  const map = new Map();
  items.forEach((item) => {
    if (!item.created_at) return;
    const key = keyOf(new Date(item.created_at));
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, limit);
};

const Bars = ({ title, rows }) => {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 font-bold">{title}</h2>
      {rows.length === 0 && <p className="text-sm text-slate-500">Belum ada data.</p>}
      <div className="flex flex-col gap-3">
        {rows.map(([label, count]) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <span className="w-24 shrink-0 text-slate-500">{label}</span>
            <div className="h-3 flex-1 rounded-full bg-slate-100">
              <div className="h-3 rounded-full bg-indigo-600" style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <span className="w-6 text-right font-bold">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function StatsPage() {
  const dispatch = useDispatch();
  const lostFounds = useSelector((s) => s.lostFounds.lostFounds);

  useEffect(() => {
    dispatch(asyncGetLostFounds({}));
  }, [dispatch]);

  const daily = useMemo(
    () => group(lostFounds, (d) => d.toISOString().slice(0, 10), 7),
    [lostFounds]
  );
  const monthly = useMemo(
    () => group(lostFounds, (d) => d.toISOString().slice(0, 7), 6),
    [lostFounds]
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Statistik</h1>
        <p className="text-slate-500">Jumlah laporan per hari dan per bulan.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Bars title="7 Hari Terakhir" rows={daily} />
        <Bars title="6 Bulan Terakhir" rows={monthly} />
      </div>
    </div>
  );
}
