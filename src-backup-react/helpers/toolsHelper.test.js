import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import {
  showSuccessDialog,
  showErrorDialog,
  showWarningDialog,
  showConfirmDialog,
  formatDate,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn() },
}));

describe("toolsHelper - dialog", () => {
  beforeEach(() => {
    Swal.fire.mockReset();
    Swal.fire.mockResolvedValue({ isConfirmed: true });
  });

  it("showSuccessDialog memakai ikon success dan judul default", async () => {
    await showSuccessDialog("Tersimpan");

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "success",
        title: "Berhasil",
        text: "Tersimpan",
      })
    );
  });

  it("showSuccessDialog menerima judul kustom", async () => {
    await showSuccessDialog("Tersimpan", "Mantap");

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Mantap" })
    );
  });

  it("showErrorDialog memakai ikon error dan judul default", async () => {
    await showErrorDialog("Ada masalah");

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "error",
        title: "Gagal",
        text: "Ada masalah",
      })
    );
  });

  it("showErrorDialog menerima judul kustom", async () => {
    await showErrorDialog("Ada masalah", "Oops");

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Oops" })
    );
  });

  it("showWarningDialog memakai ikon warning dan judul default", async () => {
    await showWarningDialog("Hati-hati");

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "warning",
        title: "Perhatian",
        text: "Hati-hati",
      })
    );
  });

  it("showWarningDialog menerima judul kustom", async () => {
    await showWarningDialog("Hati-hati", "Awas");

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Awas" })
    );
  });

  it("showConfirmDialog mengembalikan true jika dikonfirmasi", async () => {
    const result = await showConfirmDialog("Hapus data?");

    expect(result).toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "question",
        title: "Konfirmasi",
        text: "Hapus data?",
        showCancelButton: true,
      })
    );
  });

  it("showConfirmDialog mengembalikan false jika dibatalkan", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });

    expect(await showConfirmDialog("Hapus data?", "Yakin?")).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Yakin?" })
    );
  });
});

describe("toolsHelper - formatDate", () => {
  it("memformat tanggal ISO ke bahasa Indonesia", () => {
    const result = formatDate("2024-02-28T07:49:32.000000Z");

    expect(result).toContain("2024");
    expect(result).toContain("Februari");
  });

  it("mengembalikan '-' untuk nilai kosong", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate("")).toBe("-");
    expect(formatDate(undefined)).toBe("-");
  });

  it("mengembalikan '-' untuk tanggal tidak valid", () => {
    expect(formatDate("bukan-tanggal")).toBe("-");
  });
});