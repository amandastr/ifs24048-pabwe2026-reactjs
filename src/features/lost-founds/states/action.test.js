import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  asyncGetLostFounds,
  asyncGetLostFound,
  asyncAddLostFound,
  asyncChangeLostFound,
  asyncChangeLostFoundCover,
  asyncDeleteLostFound,
  asyncGetLostFoundStatsDaily,
  asyncGetLostFoundStatsMonthly,
  resetLostFoundStatus,
} from "./action";
import lostFoundApi from "../api/lostFoundApi";

vi.mock("../api/lostFoundApi", () => ({
  default: {
    getLostFounds: vi.fn(),
    getLostFound: vi.fn(),
    addLostFound: vi.fn(),
    updateLostFound: vi.fn(),
    updateCover: vi.fn(),
    deleteLostFound: vi.fn(),
    getStatsDaily: vi.fn(),
    getStatsMonthly: vi.fn(),
  },
}));

const run = (thunk) => thunk(vi.fn(), vi.fn(), undefined);

const file = new File(["x"], "cover.jpg", { type: "image/jpeg" });
const filters = { status: "lost", isCompleted: 0, isMe: 1 };
const newData = { title: "Dompet", description: "Hitam", status: "lost" };
const changeArg = { id: 3, ...newData, isCompleted: true };
const coverArg = { id: 4, file };
const statsOptions = { endDate: "2024-10-05 22:00:00", totalData: 7 };

// [nama, thunk, method lostFoundApi, argumen thunk, argumen yang diteruskan ke API]
const cases = [
  ["asyncGetLostFounds", asyncGetLostFounds, "getLostFounds", filters, [filters]],
  ["asyncGetLostFound", asyncGetLostFound, "getLostFound", 5, [5]],
  ["asyncAddLostFound", asyncAddLostFound, "addLostFound", newData, [newData]],
  [
    "asyncChangeLostFound",
    asyncChangeLostFound,
    "updateLostFound",
    changeArg,
    [3, { ...newData, isCompleted: true }],
  ],
  ["asyncChangeLostFoundCover", asyncChangeLostFoundCover, "updateCover", coverArg, [4, file]],
  ["asyncDeleteLostFound", asyncDeleteLostFound, "deleteLostFound", 9, [9]],
  ["asyncGetLostFoundStatsDaily", asyncGetLostFoundStatsDaily, "getStatsDaily", statsOptions, [statsOptions]],
  ["asyncGetLostFoundStatsMonthly", asyncGetLostFoundStatsMonthly, "getStatsMonthly", statsOptions, [statsOptions]],
];

describe("lost-founds action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resetLostFoundStatus menghasilkan action bertipe lostFounds/resetStatus", () => {
    expect(resetLostFoundStatus()).toEqual({ type: "lostFounds/resetStatus" });
  });

  describe.each(cases)("%s", (_name, thunk, method, arg, expectedArgs) => {
    it("memanggil lostFoundApi dan mengembalikan hasilnya saat berhasil", async () => {
      lostFoundApi[method].mockResolvedValue("hasil-api");

      const result = await run(thunk(arg));

      expect(lostFoundApi[method]).toHaveBeenCalledWith(...expectedArgs);
      expect(thunk.fulfilled.match(result)).toBe(true);
      expect(result.payload).toBe("hasil-api");
    });

    it("menolak dengan pesan error saat gagal", async () => {
      lostFoundApi[method].mockRejectedValue(new Error("Gagal dari API"));

      const result = await run(thunk(arg));

      expect(thunk.rejected.match(result)).toBe(true);
      expect(result.payload).toBe("Gagal dari API");
    });
  });
});
