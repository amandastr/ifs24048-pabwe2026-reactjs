import { describe, it, expect, vi, beforeEach } from "vitest";
import lostFoundApi from "./lostFoundApi";
import { apiRequest } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({
  apiRequest: vi.fn(),
}));

const item = { id: 1, title: "Dompet", status: "lost", is_completed: 0 };

describe("lostFoundApi", () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  describe("getAll", () => {
    it("memanggil GET /lost-founds dengan params kosong secara default", async () => {
      apiRequest.mockResolvedValue({ data: { lost_founds: [item] } });

      const result = await lostFoundApi.getAll();

      expect(apiRequest).toHaveBeenCalledWith("/lost-founds", { params: {} });
      expect(result).toEqual([item]);
    });

    it("meneruskan params filter apa adanya", async () => {
      apiRequest.mockResolvedValue({ data: { lost_founds: [] } });
      const params = { status: "found", is_completed: 0, is_me: 1 };

      await lostFoundApi.getAll(params);

      expect(apiRequest).toHaveBeenCalledWith("/lost-founds", { params });
    });

    it("mengembalikan array kosong jika response tidak memuat data", async () => {
      apiRequest.mockResolvedValue({});

      expect(await lostFoundApi.getAll()).toEqual([]);
    });

    it("mengembalikan array kosong jika data tidak memuat lost_founds", async () => {
      apiRequest.mockResolvedValue({ data: {} });

      expect(await lostFoundApi.getAll()).toEqual([]);
    });
  });

  describe("getById", () => {
    it("memanggil GET /lost-founds/:id dan mengembalikan laporan", async () => {
      apiRequest.mockResolvedValue({ data: { lost_found: item } });

      const result = await lostFoundApi.getById(5);

      expect(apiRequest).toHaveBeenCalledWith("/lost-founds/5");
      expect(result).toEqual(item);
    });

    it("mengembalikan null jika response tidak memuat data", async () => {
      apiRequest.mockResolvedValue({});

      expect(await lostFoundApi.getById(5)).toBeNull();
    });

    it("mengembalikan null jika data tidak memuat lost_found", async () => {
      apiRequest.mockResolvedValue({ data: {} });

      expect(await lostFoundApi.getById(5)).toBeNull();
    });
  });

  it("add memanggil POST /lost-founds hanya dengan title, description, status", async () => {
    apiRequest.mockResolvedValue({ data: { lost_found_id: 12 } });

    const result = await lostFoundApi.add({
      title: "Dompet",
      description: "Warna hitam",
      status: "lost",
      ekstra: "diabaikan",
    });

    expect(apiRequest).toHaveBeenCalledWith("/lost-founds", {
      method: "POST",
      body: { title: "Dompet", description: "Warna hitam", status: "lost" },
    });
    expect(result).toEqual({ lost_found_id: 12 });
  });

  it("change memanggil PUT /lost-founds/:id beserta is_completed", async () => {
    apiRequest.mockResolvedValue({ data: null });

    const result = await lostFoundApi.change(3, {
      title: "Dompet",
      description: "Warna hitam",
      status: "found",
      is_completed: 1,
      ekstra: "diabaikan",
    });

    expect(apiRequest).toHaveBeenCalledWith("/lost-founds/3", {
      method: "PUT",
      body: {
        title: "Dompet",
        description: "Warna hitam",
        status: "found",
        is_completed: 1,
      },
    });
    expect(result).toBeNull();
  });

  it("changeCover mengirim FormData berisi field cover", async () => {
    apiRequest.mockResolvedValue({ data: { cover: "img/cover.jpg" } });
    const file = new File(["x"], "cover.jpg", { type: "image/jpeg" });

    const result = await lostFoundApi.changeCover(4, file);

    const [path, options] = apiRequest.mock.calls[0];
    expect(path).toBe("/lost-founds/4/cover");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("cover").name).toBe("cover.jpg");
    expect(result).toEqual({ cover: "img/cover.jpg" });
  });

  it("remove memanggil DELETE /lost-founds/:id", async () => {
    apiRequest.mockResolvedValue({ data: null });

    const result = await lostFoundApi.remove(9);

    expect(apiRequest).toHaveBeenCalledWith("/lost-founds/9", {
      method: "DELETE",
    });
    expect(result).toBeNull();
  });

  describe("getStats", () => {
    const stats = { stats_losts: { "06-10-2024": 1 } };

    it("memakai tipe daily dan params kosong secara default", async () => {
      apiRequest.mockResolvedValue({ data: stats });

      const result = await lostFoundApi.getStats();

      expect(apiRequest).toHaveBeenCalledWith("/lost-founds/stats/daily", {
        params: {},
      });
      expect(result).toEqual(stats);
    });

    it("meneruskan tipe dan params yang diberikan", async () => {
      apiRequest.mockResolvedValue({ data: stats });
      const params = { end_date: "2024-10-05 22:00:00", total_data: 5 };

      const result = await lostFoundApi.getStats("monthly", params);

      expect(apiRequest).toHaveBeenCalledWith("/lost-founds/stats/monthly", {
        params,
      });
      expect(result).toEqual(stats);
    });
  });

  it("meneruskan error dari apiRequest", async () => {
    apiRequest.mockRejectedValue(new Error("Data tidak valid"));

    await expect(lostFoundApi.getById(1)).rejects.toThrow("Data tidak valid");
  });
});
