import { describe, expect, it, vi } from "vitest";
import { login } from "@/lib/api";

function stubFetch(impl: () => Promise<Response>) {
  const fetchMock = vi.fn(impl);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("login", () => {
  it("posts the name and email and returns the user", async () => {
    const user = { id: 1, name: "Ada", email: "ada@example.com" };
    const fetchMock = stubFetch(async () => Response.json(user));

    await expect(login("Ada", "ada@example.com")).resolves.toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ada", email: "ada@example.com" }),
    });
  });

  it("explains validation errors", async () => {
    stubFetch(async () => new Response(null, { status: 422 }));

    await expect(login("", "nope")).rejects.toThrow(
      "Please enter your name and a valid email address."
    );
  });

  it("reports other server errors generically", async () => {
    stubFetch(async () => new Response(null, { status: 500 }));

    await expect(login("Ada", "ada@example.com")).rejects.toThrow(
      "Something went wrong signing you in. Please try again."
    );
  });

  it("reports network failures", async () => {
    stubFetch(async () => {
      throw new TypeError("Failed to fetch");
    });

    await expect(login("Ada", "ada@example.com")).rejects.toThrow(
      "Couldn't reach the server. Please try again."
    );
  });
});
