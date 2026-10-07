import { describe, it, expect, beforeEach } from "vitest";
import reducer, { getInitialState } from "./reducer";
import {
  asyncAuthLogin,
  asyncAuthRegister,
  asyncAuthLogout,
  resetAuthStatus,
} from "./action";
import { putAccessToken } from "../../../helpers/apiHelper";

const credentials = { email: "a@b.c", password: "123456" };
const registerPayload = { name: "Amanda", ...credentials };

describe("auth reducer", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("state awal", () => {
    it("isAuthLogin false jika belum ada token", () => {
      const state = reducer(undefined, { type: "tidak-dikenal" });

      expect(state).toEqual({
        isAuthLogin: false,
        isAuthRegister: false,
        isAuthLogout: false,
        isLoading: false,
        error: null,
      });
    });

    it("isAuthLogin true jika token sudah tersimpan", () => {
      putAccessToken("1|abc");

      expect(getInitialState().isAuthLogin).toBe(true);
      expect(reducer(undefined, { type: "tidak-dikenal" }).isAuthLogin).toBe(
        true
      );
    });
  });

  describe("login", () => {
    it("pending: loading aktif dan error dibersihkan", () => {
      const prev = { ...getInitialState(), error: "lama" };
      const state = reducer(prev, asyncAuthLogin.pending("id", credentials));

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("fulfilled: pengguna login dan status logout direset", () => {
      const prev = { ...getInitialState(), isLoading: true, isAuthLogout: true };
      const state = reducer(
        prev,
        asyncAuthLogin.fulfilled({ id: 1 }, "id", credentials)
      );

      expect(state.isLoading).toBe(false);
      expect(state.isAuthLogin).toBe(true);
      expect(state.isAuthLogout).toBe(false);
    });

    it("rejected: menyimpan pesan error dari payload", () => {
      const prev = { ...getInitialState(), isLoading: true };
      const state = reducer(
        prev,
        asyncAuthLogin.rejected(null, "id", credentials, "Kredensial salah")
      );

      expect(state.isLoading).toBe(false);
      expect(state.isAuthLogin).toBe(false);
      expect(state.error).toBe("Kredensial salah");
    });

    it("rejected: memakai pesan dari error jika payload tidak ada", () => {
      const state = reducer(
        getInitialState(),
        asyncAuthLogin.rejected(new Error("Gagal tak terduga"), "id", credentials)
      );

      expect(state.error).toBe("Gagal tak terduga");
    });
  });

  describe("register", () => {
    it("pending: loading aktif dan error dibersihkan", () => {
      const prev = { ...getInitialState(), error: "lama" };
      const state = reducer(
        prev,
        asyncAuthRegister.pending("id", registerPayload)
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("fulfilled: isAuthRegister menjadi true", () => {
      const prev = { ...getInitialState(), isLoading: true };
      const state = reducer(
        prev,
        asyncAuthRegister.fulfilled("Berhasil", "id", registerPayload)
      );

      expect(state.isLoading).toBe(false);
      expect(state.isAuthRegister).toBe(true);
    });

    it("rejected: menyimpan pesan error", () => {
      const state = reducer(
        getInitialState(),
        asyncAuthRegister.rejected(null, "id", registerPayload, "Email dipakai")
      );

      expect(state.isAuthRegister).toBe(false);
      expect(state.error).toBe("Email dipakai");
    });
  });

  describe("logout", () => {
    it("fulfilled: isAuthLogin false dan isAuthLogout true", () => {
      const prev = { ...getInitialState(), isAuthLogin: true };
      const state = reducer(prev, asyncAuthLogout.fulfilled(undefined, "id"));

      expect(state.isAuthLogin).toBe(false);
      expect(state.isAuthLogout).toBe(true);
    });
  });

  describe("resetAuthStatus", () => {
    it("mereset register, logout, dan error tanpa mengubah isAuthLogin", () => {
      const prev = {
        isAuthLogin: true,
        isAuthRegister: true,
        isAuthLogout: true,
        isLoading: false,
        error: "sesuatu",
      };
      const state = reducer(prev, resetAuthStatus());

      expect(state).toEqual({
        isAuthLogin: true,
        isAuthRegister: false,
        isAuthLogout: false,
        isLoading: false,
        error: null,
      });
    });
  });
});