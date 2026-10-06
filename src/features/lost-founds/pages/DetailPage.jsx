import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  IconArrowLeft,
  IconCalendar,
  IconCircleCheck,
  IconClock,
  IconEdit,
  IconPhotoEdit,
  IconSearch,
  IconBox,
  IconTrash,
} from "@tabler/icons-react";
import Swal from "sweetalert2";
import { asyncDeleteLostFound, asyncGetLostFound } from "../states/action";
import { formatDateTime, isDone, reporterOf } from "../lostFoundUtils";
import ChangeModal from "../modals/ChangeModal";
import ChangeCoverModal from "../modals/ChangeCoverModal";

export default function DetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lostFound: item, isLostFound, error } = useSelector((s) => s.lostFounds);
  const [showChange, setShowChange] = useState(false);
  const [showCover, setShowCover] = useState(false);

  useEffect(() => {
    dispatch(asyncGetLostFound(id));
  }, [dispatch, id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Hapus laporan ini?",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await dispatch(asyncDeleteLostFound(id)).unwrap();
      await Swal.fire({ icon: "success", title: "Laporan dihapus" });
      navigate("/");
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: String(err) });
    }
  };

  if (isLostFound && !item) return <p>Memuat...</p>;
  if (!item || String(item.id) !== String(id)) {
    return <p className="text-red-600">{error ?? "Laporan tidak ditemukan"}</p>;
  }

  const done = isDone(item);
  const isLost = item.status === "lost";
  const reporter = reporterOf(item);
  const btn = "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-700 hover:text-indigo-600">
          <IconArrowLeft size={18} /> Kembali ke Daftar Laporan
        </Link>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowCover(true)} className={`${btn} border-sky-200 bg-sky-50 text-sky-700`}>
            <IconPhotoEdit size={18} /> Ubah Cover
          </button>
          <button type="button" onClick={() => setShowChange(true)} className={`${btn} border-amber-200 bg-amber-50 text-amber-700`}>
            <IconEdit size={18} /> Ubah Data
          </button>
          <button type="button" onClick={handleDelete} className={`${btn} border-rose-200 bg-rose-50 text-rose-600`}>
            <IconTrash size={18} /> Hapus
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        {item.cover && (
          <img src={item.cover} alt={item.title} className="max-h-96 w-full object-cover" />
        )}
        <div className="flex flex-col gap-4 p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="text-slate-400">#{item.id}</span>
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${isLost ? "bg-rose-50 text-rose-600" : "bg-sky-50 text-sky-700"}`}>
              {isLost ? <IconSearch size={14} /> : <IconBox size={14} />}
              {isLost ? "Barang Hilang" : "Barang Ditemukan"}
            </span>
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${done ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              {done ? <IconCircleCheck size={14} /> : <IconClock size={14} />}
              {done ? "Selesai" : "Belum Selesai"}
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight">{item.title}</h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {reporter?.photo ? (
                  <img src={reporter.photo} alt={reporter.name} className="h-full w-full object-cover" />
                ) : (
                  reporter?.name?.charAt(0).toUpperCase() ?? "?"
                )}
              </span>
              Pelapor: <b className="text-slate-900">{reporter?.name ?? "-"}</b>
            </span>
            <span className="flex items-center gap-1.5">
              <IconCalendar size={16} /> Dilaporkan: <b className="text-slate-900">{formatDateTime(item.created_at)}</b>
            </span>
            <span className="flex items-center gap-1.5">
              <IconCalendar size={16} /> Diperbarui: <b className="text-slate-900">{formatDateTime(item.updated_at)}</b>
            </span>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 whitespace-pre-line">
            {item.description}
          </div>
        </div>
      </div>

      {showChange && <ChangeModal item={item} onClose={() => setShowChange(false)} />}
      {showCover && <ChangeCoverModal item={item} onClose={() => setShowCover(false)} />}
    </div>
  );
}
