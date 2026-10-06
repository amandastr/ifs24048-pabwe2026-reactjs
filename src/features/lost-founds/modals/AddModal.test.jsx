import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Swal from "sweetalert2";
import AddModal from "./AddModal";
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

const isiForm = async () => {
  await userEvent.type(screen.getByPlaceholderText("Judul"), "Dompet hitam");
  await userEvent.type(screen.getByPlaceholderText("Deskripsi"), "Hilang di kantin");
};

describe("AddModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    lostFoundApi.getAll.mockResolvedValue([]);
  });

  it("menampilkan form dengan jenis laporan default 'hilang'", () => {
    renderWithProviders(<AddModal onClose={() => {}} />);

    expect(
      screen.getByRole("heading", { name: "Tambah Laporan" })
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("lost");
  });

  it("menyimpan laporan, memuat ulang daftar, dan menutup modal", async () => {
    lostFoundApi.add.mockResolvedValue({ lost_found_id: 9 });
    const onClose = vi.fn();
    renderWithProviders(<AddModal onClose={onClose} />);

    await isiForm();
    await userEvent.selectOptions(screen.getByRole("combobox"), "found");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(lostFoundApi.add).toHaveBeenCalledWith({
      title: "Dompet hitam",
      description: "Hilang di kantin",
      status: "found",
    });
    expect(lostFoundApi.getAll).toHaveBeenCalledWith({});
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "success", title: "Laporan ditambahkan" })
    );
  });

  it("menonaktifkan tombol selama penyimpanan berjalan", async () => {
    let selesai;
    lostFoundApi.add.mockReturnValue(
      new Promise((resolve) => {
        selesai = resolve;
      })
    );
    const onClose = vi.fn();
    renderWithProviders(<AddModal onClose={onClose} />);

    await isiForm();
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));

    expect(
      await screen.findByRole("button", { name: "Menyimpan..." })
    ).toBeDisabled();

    selesai({});
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("menampilkan dialog error dan tidak menutup modal saat gagal", async () => {
    lostFoundApi.add.mockRejectedValue(new Error("Data tidak valid"));
    const onClose = vi.fn();
    renderWithProviders(<AddModal onClose={onClose} />);

    await isiForm();
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "error",
          title: "Gagal",
          text: "Data tidak valid",
        })
      )
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(
      await screen.findByRole("button", { name: "Simpan" })
    ).toBeEnabled();
  });
});
