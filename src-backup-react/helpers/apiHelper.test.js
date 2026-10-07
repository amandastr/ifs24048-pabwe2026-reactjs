import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  apiRequest,
  buildQuery,
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper";

const mockResponse = ({ ok = true, status = 200, json } = {}) => ({
  ok,
  status,
  json: json ?? (() => Promise.resolve({ status: "success", message: "OK" })),
});

describe("apiHelper - token", () => {
  beforeEach(() => localStorage.clear());

  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();

    putAccessToken("abc123");
    expect(getAccessToken()).toBe("abc123");

    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe("apiHelper - buildQuery", () => {
  it("mengembalikan string kosong jika tidak ada parameter", () => {
    expect(buildQuery()).toBe("");
    expect(buildQuery({})).toBe("");
  });

  it("mengabaikan nilai kosong, null, dan undefined", () => {
    expect(buildQuery({ a: undefined, b: null, c: "" })).toBe("");
  });

  it("membangun query string dari parameter yang terisi", () => {
    expect(buildQuery({ status: "lost", is_me: 1, q: "" })).toBe(
      "?status=lost&is_me=1"
    );
  });

  it("menganggap angka 0 sebagai nilai valid", () => {
    expect(buildQuery({ is_completed: 0 })).toBe("?is_completed=0");
  });
});

describe("apiHelper - apiRequest", () => {
  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mengirim GET dengan header Authorization dan query params", async () => {
    putAccessToken("token-1");
    fetch.mockResolvedValue(mockResponse());

    const result = await apiRequest("/lost-founds", {
      params: { status: "lost" },
    });

    const [url, options] = fetch.mock.calls[0];
    expect(url.endsWith("/lost-founds?status=lost")).toBe(true);
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe("Bearer token-1");
    expect(options.headers.Accept).toBe("application/json");
    expect(options.body).toBeUndefined();
    expect(result).toEqual({ status: "success", message: "OK" });
  });

  it("tidak mengirim Authorization jika token belum ada", async () => {
    fetch.mockResolvedValue(mockResponse());

    await apiRequest("/users");

    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("tidak mengirim Authorization jika auth dimatikan", async () => {
    putAccessToken("token-1");
    fetch.mockResolvedValue(mockResponse());

    await apiRequest("/auth/login", { method: "POST", auth: false, body: {} });

    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("mengirim body JSON beserta Content-Type", async () => {
    fetch.mockResolvedValue(mockResponse());

    await apiRequest("/auth/login", {
      method: "POST",
      body: { email: "a@b.c", password: "123456" },
    });

    const options = fetch.mock.calls[0][1];
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe(
      JSON.stringify({ email: "a@b.c", password: "123456" })
    );
  });

  it("mengirim FormData apa adanya tanpa Content-Type manual", async () => {
    fetch.mockResolvedValue(mockResponse());
    const formData = new FormData();
    formData.append("cover", new File(["x"], "cover.png"));

    await apiRequest("/lost-founds/1/cover", {
      method: "POST",
      body: formData,
    });

    const options = fetch.mock.calls[0][1];
    expect(options.body).toBe(formData);
    expect(options.headers["Content-Type"]).toBeUndefined();
  });

  it("melempar error ramah jika jaringan gagal", async () => {
    fetch.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(apiRequest("/users")).rejects.toThrow(
      "Tidak dapat terhubung ke server"
    );
  });

  it("melempar error dengan pesan, status, dan data dari API", async () => {
    fetch.mockResolvedValue(
      mockResponse({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            status: "fail",
            message: "Data tidak valid",
            data: { title: ["Wajib diisi"] },
          }),
      })
    );

    const error = await apiRequest("/lost-founds", { method: "POST" }).catch(
      (e) => e
    );

    expect(error.message).toBe("Data tidak valid");
    expect(error.status).toBe(400);
    expect(error.data).toEqual({ title: ["Wajib diisi"] });
  });

  it("melempar error jika HTTP ok tetapi status bukan success", async () => {
    fetch.mockResolvedValue(
      mockResponse({
        json: () => Promise.resolve({ status: "fail", message: "Gagal" }),
      })
    );

    const error = await apiRequest("/users").catch((e) => e);

    expect(error.message).toBe("Gagal");
    expect(error.data).toBeNull();
  });

  it("memakai pesan default jika response bukan JSON", async () => {
    fetch.mockResolvedValue(
      mockResponse({
        ok: false,
        status: 500,
        json: () => Promise.reject(new SyntaxError("Unexpected token")),
      })
    );

    const error = await apiRequest("/users").catch((e) => e);

    expect(error.message).toBe("Terjadi kesalahan pada server");
    expect(error.status).toBe(500);
    expect(error.data).toBeNull();
  });

  it("memakai pesan default jika JSON tidak memuat message", async () => {
    fetch.mockResolvedValue(
      mockResponse({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ status: "fail" }),
      })
    );

    const error = await apiRequest("/users/me").catch((e) => e);

    expect(error.message).toBe("Terjadi kesalahan pada server");
  });
});