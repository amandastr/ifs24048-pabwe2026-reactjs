import { describe, it, expect, vi, beforeEach } from "vitest";
import authApi from "./authApi";
import { apiRequest } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({
  apiRequest: vi.fn(),
}));

describe("authApi", () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it("login memanggil POST /auth/login tanpa token dan mengembalikan data", async () => {
    const data = { user: { id: 1, name: "Amanda" }, token: "1|abc" };
    apiRequest.mockResolvedValue({ status: "success", data });

    const result = await authApi.login({
      email: "a@b.c",
      password: "123456",
      ekstra: "diabaikan",
    });

    expect(apiRequest).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      auth: false,
      body: { email: "a@b.c", password: "123456" },
    });
    expect(result).toEqual(data);
  });

  it("login meneruskan error dari apiRequest", async () => {
    apiRequest.mockRejectedValue(new Error("Kredensial akun tidak ditemukan"));

    await expect(
      authApi.login({ email: "a@b.c", password: "salah" })
    ).rejects.toThrow("Kredensial akun tidak ditemukan");
  });

  it("register memanggil POST /auth/register dan mengembalikan pesan", async () => {
    apiRequest.mockResolvedValue({
      status: "success",
      message: "Berhasil melakukan pendaftaran",
    });

    const result = await authApi.register({
      name: "Amanda",
      email: "a@b.c",
      password: "123456",
    });

    expect(apiRequest).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      auth: false,
      body: { name: "Amanda", email: "a@b.c", password: "123456" },
    });
    expect(result).toBe("Berhasil melakukan pendaftaran");
  });

  it("register meneruskan error dari apiRequest", async () => {
    apiRequest.mockRejectedValue(new Error("Data tidak valid"));

    await expect(
      authApi.register({ name: "A", email: "x", password: "1" })
    ).rejects.toThrow("Data tidak valid");
  });
});