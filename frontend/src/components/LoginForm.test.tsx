import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import LoginForm from "@/components/LoginForm";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  push.mockReset();
});

function submit(name: string, email: string) {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

describe("LoginForm", () => {
  it("signs the user in and brings them into the platform", async () => {
    const user = { id: 1, name: "Ada", email: "ada@example.com" };
    vi.stubGlobal("fetch", vi.fn(async () => Response.json(user)));
    render(<LoginForm />);

    submit("Ada", "ada@example.com");

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/nda"));
    expect(JSON.parse(sessionStorage.getItem("prelegal.user")!)).toEqual(user);
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Signing in…" }).disabled
    ).toBe(true);
  });

  it("shows the error and lets the user retry when sign-in fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 422 }))
    );
    render(<LoginForm />);

    submit("Ada", "ada@example.com");

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Please enter your name and a valid email address."
    );
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Continue" }).disabled
    ).toBe(false);
    expect(push).not.toHaveBeenCalled();
    expect(sessionStorage.getItem("prelegal.user")).toBeNull();
  });
});
