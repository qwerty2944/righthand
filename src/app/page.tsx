import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-primary">RightHand</h1>
      <p className="mt-2 text-muted-foreground">Hospital Management System</p>
      <Link
        href="/patients"
        className="mt-8 rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-medical-500 transition-colors"
      >
        Get Started
      </Link>
    </div>
  );
}
