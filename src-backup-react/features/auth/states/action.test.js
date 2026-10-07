import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  asyncAuthLogin,
  asyncAuthRegister,
  asyncAuthLogout,
  resetAuthStatus,
} from "./action";
import authApi from "../api/authApi";
import { putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";

vi.mock("../api/authApi", () => ({
  default: { login: vi.fn(), register: vi.fn() },
}));

vi.mock("../../../helpers/apiHelper", () => ({
  putAccessToken: vi.fn(),
  removeAccessToken: vi.fn(),
}));

const run = (thunk) => thunk(vi.fn(), vi.fn(), undefined);

describe("auth action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resetAuthStatus menghasilkan action bertipe auth/resetStatus", () => {
    expect(resetAuthStatus()).toEqual({ type: "auth/resetStatus" });
  });

  describe("asyncAuthLogin", () => {
    it("menyimpan token dan mengembalikan user saat berhasil", async () => {
      const user = { id: 1, name: "Amanda" };
      authApi.login.mockResolvedValue({ user, token: "1|abc" });

      const result = await run(
        asyncAuthLogin({ email: "a@b.c", password: "123456" })
      );

      expect(authApi.login).toHaveBeenCalledWith({
        email: "a@b.c",
        password: "123456",
      });
      expect(putAccessToken).toHaveBeenCalledWith("1|abc");
      expect(asyncAuthLogin.fulfilled.match(result)).toBe(true);
      expect(result.payload).toEqual(user);
    });

    it("menolak dengan pesan error dan tidak menyimpan token saat gagal", async () => {
      authApi.login.mockRejectedValue(
        new Error("Kredensial akun tidak ditemukan")
      );

      const result = await run(
        asyncAuthLogin({ email: "a@b.c", password: "salah" })
      );

      expect(asyncAuthLogin.rejected.match(result)).toBe(true);
      expect(result.payload).toBe("Kredensial akun tidak ditemukan");
      expect(putAccessToken).not.toHaveBeenCalled();
    });
  });

  describe("asyncAuthRegister", () => {
    it("mengembalikan pesan sukses saat berhasil", async () => {
      authApi.register.mockResolvedValue("Berhasil melakukan pendaftaran");

      const result = await run(
        asyncAuthRegister({ name: "Amanda", email: "a@b.c", password: "123456" })
      );

      expect(authApi.register).toHaveBeenCalledWith({
        name: "Amanda",
        email: "a@b.c",
        password: "123456",
      });
      expect(asyncAuthRegister.fulfilled.match(result)).toBe(true);
      expect(result.payload).toBe("Berhasil melakukan pendaftaran");
    });

    it("menolak dengan pesan error saat gagal", async () => {
      authApi.register.mockRejectedValue(new Error("Data tidak valid"));

      const result = await run(
        asyncAuthRegister({ name: "A", email: "x", password: "1" })
      );

      expect(asyncAuthRegister.rejected.match(result)).toBe(true);
      expect(result.payload).toBe("Data tidak valid");
    });
  });

  describe("asyncAuthLogout", () => {
    it("menghapus token dari penyimpanan", async () => {
      const result = await run(asyncAuthLogout());

      expect(removeAccessToken).toHaveBeenCalledTimes(1);
      expect(asyncAuthLogout.fulfilled.match(result)).toBe(true);
    });
  });
});