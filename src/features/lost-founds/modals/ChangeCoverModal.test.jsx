import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Swal from "sweetalert2";
import ChangeCoverModal from "./ChangeCoverModal";
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

const item = { id: 4, title: "Dompet" };
const file = new File(["x"], "cover.png", { type: "image/png" });

const ambilInputFile = () =>
  document.querySelector('input[type="file"]');

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    lostFoundApi.getById.mockResolvedValue(item);
    globalThis.URL.createObjectURL = vi.fn(() => "blob:pratinjau");
  });

  it("awalnya tanpa pratinjau dan tombol unggah nonaktif", () => {
    renderWithProviders(<ChangeCoverModal item={item} onClose={() => {}} />);

    expect(screen.getByRole("heading", { name: "Ganti Cover" })).toBeInTheDocument();
    expect(screen.queryByAltText("Pratinjau cover")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unggah" })).toBeDisabled();
  });

  it("menampilkan pratinjau setelah memilih gambar", async () => {
    renderWithProviders(<ChangeCoverModal item={item} onClose={() => {}} />);

    await userEvent.upload(ambilInputFile(), file);

    expect(screen.getByAltText("Pratinjau cover")).toHaveAttribute(
      "src",
      "blob:pratinjau"
    );
    expect(screen.getByRole("button", { name: "Unggah" })).toBeEnabled();
  });

  it("mengabaikan pemilihan file yang dibatalkan", () => {
    renderWithProviders(<ChangeCoverModal item={item} onClose={() => {}} />);

    fireEvent.change(ambilInputFile(), { target: { files: [] } });
    fireEvent.change(ambilInputFile(), { target: { files: undefined } });

    expect(screen.queryByAltText("Pratinjau cover")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unggah" })).toBeDisabled();
  });

  it("tidak mengirim apa pun jika form dikirim tanpa file", () => {
    renderWithProviders(<ChangeCoverModal item={item} onClose={() => {}} />);

    fireEvent.submit(screen.getByRole("button", { name: "Unggah" }).closest("form"));

    expect(lostFoundApi.changeCover).not.toHaveBeenCalled();
  });

  it("mengunggah cover, memuat ulang detail, dan menutup modal", async () => {
    lostFoundApi.changeCover.mockResolvedValue({});
    const onClose = vi.fn();
    renderWithProviders(<ChangeCoverModal item={item} onClose={onClose} />);

    await userEvent.upload(ambilInputFile(), file);
    await userEvent.click(screen.getByRole("button", { name: "Unggah" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(lostFoundApi.changeCover).toHaveBeenCalledWith(4, file);
    expect(lostFoundApi.getById).toHaveBeenCalledWith(4);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "success", title: "Cover diperbarui" })
    );
  });

  it("menonaktifkan tombol selama unggahan berjalan", async () => {
    let selesai;
    lostFoundApi.changeCover.mockReturnValue(
      new Promise((resolve) => {
        selesai = resolve;
      })
    );
    const onClose = vi.fn();
    renderWithProviders(<ChangeCoverModal item={item} onClose={onClose} />);

    await userEvent.upload(ambilInputFile(), file);
    await userEvent.click(screen.getByRole("button", { name: "Unggah" }));

    expect(
      await screen.findByRole("button", { name: "Mengunggah..." })
    ).toBeDisabled();

    selesai({});
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("menampilkan dialog error dan tidak menutup modal saat gagal", async () => {
    lostFoundApi.changeCover.mockRejectedValue(new Error("File terlalu besar"));
    const onClose = vi.fn();
    renderWithProviders(<ChangeCoverModal item={item} onClose={onClose} />);

    await userEvent.upload(ambilInputFile(), file);
    await userEvent.click(screen.getByRole("button", { name: "Unggah" }));

    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "error", text: "File terlalu besar" })
      )
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});
