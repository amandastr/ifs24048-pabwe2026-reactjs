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

  describe("getLostFounds", () => {
    it("memanggil GET /lost-founds tanpa filter", async () => {
      apiRequest.mockResolvedValue({ data: { lost_founds: [item] } });

      const result = await lostFoundApi.getLostFounds();

      expect(apiRequest).toHaveBeenCalledWith("/lost-founds", {
        params: { status: undefined, is_completed: undefined, is_me: undefined },
      });
      expect(result).toEqual([item]);
    });

    it("meneruskan filter status, is_completed, dan is_me", async () => {
      apiRequest.mockResolvedValue({ data: { lost_founds: [] } });

      await lostFoundApi.getLostFounds({
        status: "found",
        isCompleted: 0,
        isMe: 1,
      });

      expect(apiRequest).toHaveBeenCalledWith("/lost-founds", {
        params: { status: "found", is_completed: 0, is_me: 1 },
      });
    });
  });

  it("getLostFound memanggil GET /lost-founds/:id", async () => {
    apiRequest.mockResolvedValue({ data: { lost_found: item } });

    const result = await lostFoundApi.getLostFound(5);

    expect(apiRequest).toHaveBeenCalledWith("/lost-founds/5");
    expect(result).toEqual(item);
  });

  it("addLostFound memanggil POST /lost-founds dan mengembalikan id baru", async () => {
    apiRequest.mockResolvedValue({ data: { lost_found_id: 12 } });

    const result = await lostFoundApi.addLostFound({
      title: "Dompet",
      description: "Warna hitam",
      status: "lost",
      ekstra: "diabaikan",
    });

    expect(apiRequest).toHaveBeenCalledWith("/lost-founds", {
      method: "POST",
      body: { title: "Dompet", description: "Warna hitam", status: "lost" },
    });
    expect(result).toBe(12);
  });

  describe("updateLostFound", () => {
    it("mengirim is_completed 1 jika isCompleted true", async () => {
      apiRequest.mockResolvedValue({ message: "Berhasil mengubah data" });

      const result = await lostFoundApi.updateLostFound(3, {
        title: "Dompet",
        description: "Warna hitam",
        status: "found",
        isCompleted: true,
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
      expect(result).toBe("Berhasil mengubah data");
    });

    it("mengirim is_completed 0 jika isCompleted false", async () => {
      apiRequest.mockResolvedValue({ message: "ok" });

      await lostFoundApi.updateLostFound(3, {
        title: "Dompet",
        description: "Warna hitam",
        status: "lost",
        isCompleted: false,
      });

      expect(apiRequest.mock.calls[0][1].body.is_completed).toBe(0);
    });
  });

  it("updateCover mengirim FormData berisi field cover", async () => {
    apiRequest.mockResolvedValue({ message: "Berhasil mengubah cover" });
    const file = new File(["x"], "cover.jpg", { type: "image/jpeg" });

    const result = await lostFoundApi.updateCover(4, file);

    const [path, options] = apiRequest.mock.calls[0];
    expect(path).toBe("/lost-founds/4/cover");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("cover").name).toBe("cover.jpg");
    expect(result).toBe("Berhasil mengubah cover");
  });

  it("deleteLostFound memanggil DELETE /lost-founds/:id", async () => {
    apiRequest.mockResolvedValue({ message: "Berhasil menghapus data" });

    const result = await lostFoundApi.deleteLostFound(9);

    expect(apiRequest).toHaveBeenCalledWith("/lost-founds/9", {
      method: "DELETE",
    });
    expect(result).toBe("Berhasil menghapus data");
  });

  describe("statistik", () => {
    const stats = { stats_losts: { "06-10-2024": 1 } };

    it("getStatsDaily memanggil /lost-founds/stats/daily tanpa opsi", async () => {
      apiRequest.mockResolvedValue({ data: stats });

      const result = await lostFoundApi.getStatsDaily();

      expect(apiRequest).toHaveBeenCalledWith("/lost-founds/stats/daily", {
        params: { end_date: undefined, total_data: undefined },
      });
      expect(result).toEqual(stats);
    });

    it("getStatsMonthly meneruskan end_date dan total_data sebagai query", async () => {
      apiRequest.mockResolvedValue({ data: stats });

      const result = await lostFoundApi.getStatsMonthly({
        endDate: "2024-10-05 22:00:00",
        totalData: 5,
      });

      expect(apiRequest).toHaveBeenCalledWith("/lost-founds/stats/monthly", {
        params: { end_date: "2024-10-05 22:00:00", total_data: 5 },
      });
      expect(result).toEqual(stats);
    });
  });

  it("meneruskan error dari apiRequest", async () => {
    apiRequest.mockRejectedValue(new Error("Data tidak valid"));

    await expect(lostFoundApi.getLostFound(1)).rejects.toThrow(
      "Data tidak valid"
    );
  });
});
