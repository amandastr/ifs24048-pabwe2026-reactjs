import { useState } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import {
  asyncAddLostFound,
  asyncGetLostFounds,
} from "../states/action";
import ModalShell from "./ModalShell";

export default function AddModal({ onClose }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("lost");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(
        asyncAddLostFound({ title, description, status })
      ).unwrap();
      await dispatch(asyncGetLostFounds({}));
      await Swal.fire({ icon: "success", title: "Laporan ditambahkan" });
      onClose();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Gagal", text: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Tambah Laporan" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul"
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi"
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
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </ModalShell>
  );
}
