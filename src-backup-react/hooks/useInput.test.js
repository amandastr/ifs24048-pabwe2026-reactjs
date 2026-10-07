import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useInput from "./useInput";

describe("useInput", () => {
  it("memakai string kosong sebagai nilai awal default", () => {
    const { result } = renderHook(() => useInput());

    expect(result.current[0]).toBe("");
  });

  it("memakai nilai awal yang diberikan", () => {
    const { result } = renderHook(() => useInput("halo"));

    expect(result.current[0]).toBe("halo");
  });

  it("memperbarui nilai lewat onChange", () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      result.current[1]({ target: { value: "dompet hitam" } });
    });

    expect(result.current[0]).toBe("dompet hitam");
  });

  it("memperbarui nilai lewat setValue", () => {
    const { result } = renderHook(() => useInput("a"));

    act(() => {
      result.current[2]("b");
    });

    expect(result.current[0]).toBe("b");
  });

  it("menjaga referensi onChange tetap sama antar render", () => {
    const { result, rerender } = renderHook(() => useInput());
    const first = result.current[1];

    rerender();

    expect(result.current[1]).toBe(first);
  });
});