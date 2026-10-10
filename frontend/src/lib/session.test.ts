import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  clearSessionUser,
  saveSessionUser,
  useSessionUser,
} from "@/lib/session";

const user = { id: 1, name: "Ada", email: "ada@example.com" };

afterEach(() => sessionStorage.clear());

describe("useSessionUser", () => {
  it("returns the saved user", () => {
    saveSessionUser(user);

    const { result } = renderHook(() => useSessionUser());

    expect(result.current).toEqual(user);
  });

  it("returns null when nobody is signed in", () => {
    const { result } = renderHook(() => useSessionUser());

    expect(result.current).toBeNull();
  });

  it("returns null after the user is cleared", () => {
    saveSessionUser(user);
    clearSessionUser();

    const { result } = renderHook(() => useSessionUser());

    expect(result.current).toBeNull();
  });

  it("treats corrupt stored data as signed out", () => {
    sessionStorage.setItem("prelegal.user", "{not json");

    const { result } = renderHook(() => useSessionUser());

    expect(result.current).toBeNull();
  });
});
