import { useState } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import {
  asyncChangeLostFound,
  asyncGetLostFound,
  asyncGetLostFounds,
} from "../states/action";
import ModalShell from "./ModalShell";

export default function ChangeModal({ item, onClose }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(item.title ?? "");
  const [description, setDescription] = useState(item.description ?? "");
  const [status, setStatus] = useState(item.status ?? "lost");
  const [isCompleted, setIsCompleted] = useState(Boolean(Number(item.is_completed)));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(
        asyncChangeLostFound({
          id: item.id,
          title,
          description,
          status,
          is_completed: isCompleted ? 1 : 0,
        })
      ).unwrap();
      await dispatch(asyncGetLostFound(item.id));
      await dispatch(asyncGetLostFounds({}));
      await Swal.fire({ icon: "success", title: "Laporan diperbarui" });
      onClose();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Gagal", text: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Ubah Laporan" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="lost">Barang Hilang</option>
          <option value="found">Barang Ditemukan</option>
        </select>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
          />
          Tandai selesai
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </ModalShell>
  );
}
