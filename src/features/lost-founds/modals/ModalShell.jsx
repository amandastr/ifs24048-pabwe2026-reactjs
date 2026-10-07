import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModalShell from "./ModalShell";

describe("ModalShell", () => {
  it("menampilkan judul dan isi", () => {
    render(
      <ModalShell title="Judul Modal" onClose={() => {}}>
        <p>isi modal</p>
      </ModalShell>
    );

    expect(screen.getByText("Judul Modal")).toBeInTheDocument();
    expect(screen.getByText("isi modal")).toBeInTheDocument();
  });

  it("menutup modal saat tombol tutup diklik", async () => {
    const onClose = vi.fn();
    render(
      <ModalShell title="Judul Modal" onClose={onClose}>
        <p>isi modal</p>
      </ModalShell>
    );

    await userEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menutup modal saat latar belakang diklik, tetapi tidak saat isi diklik", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <ModalShell title="Judul Modal" onClose={onClose}>
        <p>isi modal</p>
      </ModalShell>
    );

    await userEvent.click(screen.getByText("isi modal"));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(container.querySelector("button[aria-hidden='true']"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});