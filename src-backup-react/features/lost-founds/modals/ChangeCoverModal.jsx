import { useState } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import {
  asyncChangeCoverLostFound,
  asyncGetLostFound,
} from "../states/action";
import ModalShell from "./ModalShell";

export default function ChangeCoverModal({ item, onClose }) {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected)); // pratinjau langsung
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    try {
      await dispatch(
        asyncChangeCoverLostFound({ id: item.id, cover: file })
      ).unwrap();
      await dispatch(asyncGetLostFound(item.id));
      await Swal.fire({ icon: "success", title: "Cover diperbarui" });
      onClose();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Gagal", text: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Ganti Cover" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {preview && (
          <img
            src={preview}
            alt="Pratinjau cover"
            className="max-h-60 w-full rounded-lg object-cover"
          />
        )}
        <input type="file" accept="image/*" onChange={handleFile} />
        <button
          type="submit"
          disabled={!file || loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Mengunggah..." : "Unggah"}
        </button>
      </form>
    </ModalShell>
  );
}
