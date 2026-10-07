import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Swal from "sweetalert2";
import ChangeModal from "./ChangeModal";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";

vi.mock("../api/lostFoundApi", () => ({
  default: {
    getAll: vi.fn(),
    getById: vi.fn(),
    add: vi.fn(),
    change: vi.fn(),
    changeCover: vi.fn(),
    remove: vi.fn(),
    getStats: vi.fn(),
  },
}));

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn() },
}));

const item = {
  id: 3,
  title: "Dompet",
  description: "Warna hitam",
  status: "lost",
  is_completed: 0,
};

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    lostFoundApi.getAll.mockResolvedValue([]);
    lostFoundApi.getById.mockResolvedValue(item);
  });

  it("mengisi form dengan data laporan", () => {
    renderWithProviders(<ChangeModal item={item} onClose={() => {}} />);

    expect(screen.getByRole("heading", { name: "Ubah Laporan" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Dompet")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Warna hitam")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("lost");
    expect(screen.getByRole("checkbox", { name: "Tandai selesai" })).not.toBeChecked();
  });

  it("mencentang 'Tandai selesai' untuk laporan yang sudah selesai", () => {
    renderWithProviders(
      <ChangeModal item={{ ...item, is_completed: "1" }} onClose={() => {}} />
    );

    expect(screen.getByRole("checkbox", { name: "Tandai selesai" })).toBeChecked();
  });

  it("memakai nilai default jika data laporan tidak lengkap", () => {
    renderWithProviders(<ChangeModal item={{ id: 3 }} onClose={() => {}} />);

    expect(screen.getByRole("combobox")).toHaveValue("lost");
    expect(screen.getByRole("checkbox", { name: "Tandai selesai" })).not.toBeChecked();
  });

  it("menyimpan perubahan, memuat ulang data, dan menutup modal", async () => {
    lostFoundApi.change.mockResolvedValue(null);
    const onClose = vi.fn();
    renderWithProviders(<ChangeModal item={item} onClose={onClose} />);

    const judul = screen.getByDisplayValue("Dompet");
    await userEvent.clear(judul);
    await userEvent.type(judul, "Dompet coklat");
    await userEvent.selectOptions(screen.getByRole("combobox"), "found");
    await userEvent.click(screen.getByRole("checkbox", { name: "Tandai selesai" }));
    await userEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(lostFoundApi.change).toHaveBeenCalledWith(3, {
      title: "Dompet coklat",
      description: "Warna hitam",
      status: "found",
      is_completed: 1,
    });
    expect(lostFoundApi.getById).toHaveBeenCalledWith(3);
    expect(lostFoundApi.getAll).toHaveBeenCalledWith({});
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "success", title: "Laporan diperbarui" })
    );
  });

  it("mengubah deskripsi dan mengirim is_completed 0 jika tidak dicentang", async () => {
    lostFoundApi.change.mockResolvedValue(null);
    const onClose = vi.fn();
    renderWithProviders(<ChangeModal item={item} onClose={onClose} />);

    const deskripsi = screen.getByDisplayValue("Warna hitam");
    await userEvent.clear(deskripsi);
    await userEvent.type(deskripsi, "Ada kartu di dalamnya");
    await userEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(lostFoundApi.change).toHaveBeenCalledWith(
      3,
      expect.objectContaining({
        description: "Ada kartu di dalamnya",
        is_completed: 0,
      })
    );
  });

  it("menonaktifkan tombol selama penyimpanan berjalan", async () => {
    let selesai;
    lostFoundApi.change.mockReturnValue(
      new Promise((resolve) => {
        selesai = resolve;
      })
    );
    const onClose = vi.fn();
    renderWithProviders(<ChangeModal item={item} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

    expect(
      await screen.findByRole("button", { name: "Menyimpan..." })
    ).toBeDisabled();

    selesai(null);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("menampilkan dialog error dan tidak menutup modal saat gagal", async () => {
    lostFoundApi.change.mockRejectedValue(new Error("Gagal menyimpan"));
    const onClose = vi.fn();
    renderWithProviders(<ChangeModal item={item} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "error", text: "Gagal menyimpan" })
      )
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});
