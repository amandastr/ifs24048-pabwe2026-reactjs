import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  asyncGetLostFounds,
  asyncGetLostFound,
  asyncAddLostFound,
  asyncChangeLostFound,
  asyncChangeCoverLostFound,
  asyncDeleteLostFound,
  asyncGetLostFoundStats,
  resetLostFoundStatus,
} from "./action";
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

const run = (thunk) => thunk(vi.fn(), vi.fn(), undefined);

const file = new File(["x"], "cover.jpg", { type: "image/jpeg" });
const filters = { status: "lost", is_completed: 0, is_me: 1 };
const newData = { title: "Dompet", description: "Hitam", status: "lost" };
const changeData = { ...newData, is_completed: 1 };
const statsArg = { type: "monthly", params: { total_data: 3 } };

// [nama, thunk, method lostFoundApi, argumen thunk, argumen yang diteruskan ke API]
const cases = [
  ["asyncGetLostFounds", asyncGetLostFounds, "getAll", filters, [filters]],
  ["asyncGetLostFound", asyncGetLostFound, "getById", 5, [5]],
  ["asyncAddLostFound", asyncAddLostFound, "add", newData, [newData]],
  [
    "asyncChangeLostFound",
    asyncChangeLostFound,
    "change",
    { id: 3, ...changeData },
    [3, changeData],
  ],
  [
    "asyncChangeCoverLostFound",
    asyncChangeCoverLostFound,
    "changeCover",
    { id: 4, cover: file },
    [4, file],
  ],
  ["asyncDeleteLostFound", asyncDeleteLostFound, "remove", 9, [9]],
  [
    "asyncGetLostFoundStats",
    asyncGetLostFoundStats,
    "getStats",
    statsArg,
    ["monthly", { total_data: 3 }],
  ],
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

  it("asyncGetLostFoundStats tanpa argumen memakai default API", async () => {
    lostFoundApi.getStats.mockResolvedValue({});

    const result = await run(asyncGetLostFoundStats());

    expect(lostFoundApi.getStats).toHaveBeenCalledWith(undefined, undefined);
    expect(asyncGetLostFoundStats.fulfilled.match(result)).toBe(true);
  });
});
