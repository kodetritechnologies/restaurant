"use client";

interface LoaderProps {
  loading: boolean;
}

export default function Loader({ loading }: LoaderProps) {
  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] grid place-items-center bg-background transition-opacity duration-700 ${
        loading ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <img src="/assets/logo.svg" alt="UDIPI Restaurant" className="h-16 w-auto object-contain" />
        <div className="h-px w-24 overflow-hidden bg-border">
          <div className="h-full w-1/2 animate-[shimmer_1.2s_linear_infinite] bg-[linear-gradient(90deg,transparent,var(--gold),transparent)] bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  );
}
