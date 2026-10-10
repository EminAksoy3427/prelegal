import LoginForm from "@/components/LoginForm";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-navy">Prelegal</h1>
        <p className="mt-1 text-sm text-gray-600">
          Draft common legal agreements in minutes.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
