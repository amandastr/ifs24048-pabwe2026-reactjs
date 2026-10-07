import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IconInput from "./IconInput";

const FakeIcon = ({ size }) => <svg data-testid="ikon" data-size={size} />;

describe("IconInput", () => {
  it("menampilkan label, ikon, dan input yang terhubung dengan label", () => {
    render(
      <IconInput label="Alamat Email" icon={FakeIcon} placeholder="nama@email.com" />
    );

    expect(screen.getByText("Alamat Email")).toBeInTheDocument();
    expect(screen.getByTestId("ikon")).toHaveAttribute("data-size", "18");
    expect(screen.getByLabelText("Alamat Email")).toBe(
      screen.getByPlaceholderText("nama@email.com")
    );
  });

  it("meneruskan props ke elemen input", async () => {
    const onChange = vi.fn();
    render(
      <IconInput
        label="Kata Sandi"
        icon={FakeIcon}
        type="password"
        id="kata-sandi"
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText("Kata Sandi");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("id", "kata-sandi");

    await userEvent.type(input, "ab");
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
