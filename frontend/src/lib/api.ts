import { SessionUser } from "@/lib/session";

/**
 * Fake login: records the user in the backend's temporary database and returns
 * them. There is no password or real authentication yet. Throws an `Error`
 * whose message is safe to show to the user.
 */
export async function login(name: string, email: string): Promise<SessionUser> {
  let response: Response;
  try {
    response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
  } catch {
    throw new Error("Couldn't reach the server. Please try again.");
  }

  if (!response.ok) {
    throw new Error(
      response.status === 422
        ? "Please enter your name and a valid email address."
        : "Something went wrong signing you in. Please try again."
    );
  }
  return response.json();
}
