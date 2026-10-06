import { describe, it, expect } from "vitest";
import { formatDateTime, isDone, reporterOf } from "./lostFoundUtils";

describe("lostFoundUtils", () => {
  describe("formatDateTime", () => {
    it("memformat tanggal ke bahasa Indonesia", () => {
      const hasil = formatDateTime("2024-02-28T07:49:32.000000Z");

      expect(hasil).toContain("2024");
      expect(hasil).toContain("Februari");
    });

    it("mengembalikan '-' untuk nilai kosong", () => {
      expect(formatDateTime(null)).toBe("-");
      expect(formatDateTime(undefined)).toBe("-");
      expect(formatDateTime("")).toBe("-");
    });
  });

  describe("isDone", () => {
    it("true untuk is_completed 1 (angka atau teks)", () => {
      expect(isDone({ is_completed: 1 })).toBe(true);
      expect(isDone({ is_completed: "1" })).toBe(true);
    });

    it("false untuk is_completed 0, kosong, atau item tidak ada", () => {
      expect(isDone({ is_completed: 0 })).toBe(false);
      expect(isDone({ is_completed: "0" })).toBe(false);
      expect(isDone({})).toBe(false);
      expect(isDone(undefined)).toBe(false);
    });
  });

  describe("reporterOf", () => {
    it("memakai properti user jika ada", () => {
      expect(reporterOf({ user: { name: "A" }, author: { name: "B" } })).toEqual({
        name: "A",
      });
    });

    it("memakai author jika user tidak ada", () => {
      expect(reporterOf({ author: { name: "B" } })).toEqual({ name: "B" });
    });

    it("mengembalikan null jika tidak ada pelapor atau item", () => {
      expect(reporterOf({})).toBeNull();
      expect(reporterOf(undefined)).toBeNull();
    });
  });
});
