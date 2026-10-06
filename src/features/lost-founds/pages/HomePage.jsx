import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  IconBox,
  IconCircleCheck,
  IconEye,
  IconFilter,
  IconLayoutGrid,
  IconListDetails,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTable,
  IconTrash,
} from "@tabler/icons-react";
import Swal from "sweetalert2";
import { asyncDeleteLostFound, asyncGetLostFounds } from "../states/action";
import { formatDateTime, isDone } from "../lostFoundUtils";
import AddModal from "../modals/AddModal";
import ChangeModal from "../modals/ChangeModal";

const Segment = ({ options, value, onChange }) => (
  <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
    {options.map(([val, label]) => (
      <button
        key={val}
        type="button"
        onClick={() => onChange(val)}
        className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${
          value === val ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

const TypeBadge = ({ status }) => (
  <span
    className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
      status === "lost" ? "bg-rose-50 text-rose-600" : "bg-sky-50 text-sky-700"
    }`}
  >
    {status === "lost" ? "Hilang" : "Ditemukan"}
  </span>
);

const StateBadge = ({ done }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
      done ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
    }`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-emerald-500" : "bg-amber-500"}`} />
    {done ? "Selesai" : "Proses"}
  </span>
);

const Thumb = ({ item }) =>
  item.cover ? (
    <img src={item.cover} alt={item.title} className="h-11 w-11 shrink-0 rounded-lg object-cover" />
  ) : null;

export default function HomePage() {
  const dispatch = useDispatch();
  const { lostFounds, isLostFound, error } = useSelector((s) => s.lostFounds);
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("all");
  const [state, setState] = useState("all");
  const [view, setView] = useState("table");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    dispatch(asyncGetLostFounds({}));
  }, [dispatch]);

  const stats = useMemo(
    () => [
      ["Total Laporan", lostFounds.length, "text-slate-900", "bg-indigo-50 text-indigo-600", IconListDetails],
      ["Barang Hilang", lostFounds.filter((i) => i.status === "lost").length, "text-rose-600", "bg-rose-50 text-rose-600", IconSearch],
      ["Barang Ditemukan", lostFounds.filter((i) => i.status === "found").length, "text-blue-600", "bg-sky-50 text-sky-600", IconBox],
      ["Selesai", lostFounds.filter(isDone).length, "text-emerald-600", "bg-emerald-50 text-emerald-600", IconCircleCheck],
    ],
    [lostFounds]
  );

  const filtered = lostFounds.filter((item) => {
    const text = `${item.title} ${item.description}`.toLowerCase();
    return (
      text.includes(keyword.toLowerCase()) &&
      (type === "all" || item.status === type) &&
      (state === "all" || (state === "done") === isDone(item))
    );
  });

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Hapus laporan ini?",
      text: item.title,
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await dispatch(asyncDeleteLostFound(item.id)).unwrap();
      dispatch(asyncGetLostFounds({}));
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: String(err) });
    }
  };

  const actions = (item) => (
    <div className="flex items-center justify-end gap-4 text-slate-500">
      <Link to={`/lost-founds/${item.id}`} aria-label="Lihat" className="hover:text-indigo-600"><IconEye size={18} /></Link>
      <button type="button" aria-label="Ubah" onClick={() => setEditItem(item)} className="hover:text-amber-600"><IconPencil size={18} /></button>
      <button type="button" aria-label="Hapus" onClick={() => handleDelete(item)} className="hover:text-red-600"><IconTrash size={18} /></button>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Laporan Lost &amp; Founds</h1>
          <p className="text-slate-500">Kelola dan pantau laporan barang hilang dan barang temuan.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
        >
          <IconPlus size={20} /> Tambah Laporan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, color, tint, Icon]) => (
          <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6">
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{label}</p>
              <p className={`mt-1 text-4xl font-extrabold ${color}`}>{value}</p>
            </div>
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tint}`}>
              <Icon size={26} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative min-w-60 flex-1 md:max-w-xl">
              <IconSearch size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Cari judul atau deskripsi laporan..."
                className="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-11 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
              {[["table", "Tabel", IconTable], ["card", "Kartu", IconLayoutGrid]].map(([val, label, Icon]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setView(val)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold ${
                    view === val ? "bg-white shadow-sm" : "text-slate-600"
                  }`}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
            <span className="flex items-center gap-2">
              <IconFilter size={16} /> Jenis:
              <Segment value={type} onChange={setType} options={[["all", "Semua"], ["lost", "Hilang"], ["found", "Ditemukan"]]} />
            </span>
            <span className="flex items-center gap-2">
              Penyelesaian:
              <Segment value={state} onChange={setState} options={[["all", "Semua"], ["process", "Proses"], ["done", "Selesai"]]} />
            </span>
          </div>
        </div>

        {error && <p className="px-6 pb-4 text-sm text-red-600">{error}</p>}
        {isLostFound && <p className="px-6 pb-4 text-sm text-slate-500">Memuat...</p>}
        {!isLostFound && filtered.length === 0 && (
          <p className="px-6 pb-6 text-sm text-slate-500">Belum ada laporan.</p>
        )}

        {view === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-3 py-4">Judul</th>
                  <th className="px-3 py-4">Jenis</th>
                  <th className="px-3 py-4">Dilaporkan</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-6 py-4 text-slate-500">#{item.id}</td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <Thumb item={item} />
                        <div className="min-w-0">
                          <p className="font-bold">{item.title}</p>
                          <p className="max-w-md truncate text-slate-500">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4"><TypeBadge status={item.status} /></td>
                    <td className="px-3 py-4 text-slate-600">{formatDateTime(item.created_at)}</td>
                    <td className="px-3 py-4"><StateBadge done={isDone(item)} /></td>
                    <td className="px-6 py-4">{actions(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-5 p-6 pt-0 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200">
                {item.cover ? (
                  <img src={item.cover} alt={item.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-slate-100 text-sm text-slate-400">Tanpa foto</div>
                )}
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex gap-2"><TypeBadge status={item.status} /><StateBadge done={isDone(item)} /></div>
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="line-clamp-2 text-sm text-slate-500">{item.description}</p>
                  </div>
                  <p className="text-xs text-slate-500">{formatDateTime(item.created_at)}</p>
                  {actions(item)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} />}
      {editItem && <ChangeModal item={editItem} onClose={() => setEditItem(null)} />}
    </div>
  );
}
