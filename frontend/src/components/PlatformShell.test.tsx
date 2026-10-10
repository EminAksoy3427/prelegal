import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import PlatformShell from "@/components/PlatformShell";
import { saveSessionUser } from "@/lib/session";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  replace.mockReset();
});

describe("PlatformShell", () => {
  it("sends visitors who haven't signed in back to the login screen", () => {
    render(<PlatformShell>Platform content</PlatformShell>);

    expect(replace).toHaveBeenCalledWith("/");
    expect(screen.queryByText("Platform content")).toBeNull();
  });

  it("shows the signed-in user and the page content", () => {
    saveSessionUser({ id: 1, name: "Ada", email: "ada@example.com" });

    render(<PlatformShell>Platform content</PlatformShell>);

    expect(screen.getByText("Signed in as Ada")).toBeTruthy();
    expect(screen.getByText("Platform content")).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it("logs the user out", () => {
    saveSessionUser({ id: 1, name: "Ada", email: "ada@example.com" });
    render(<PlatformShell>Platform content</PlatformShell>);

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(sessionStorage.getItem("prelegal.user")).toBeNull();
    expect(replace).toHaveBeenCalledWith("/");
  });
});
