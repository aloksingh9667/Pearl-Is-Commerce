import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
  light?: boolean;
}

export function BackButton({ className = "", light = false }: BackButtonProps) {
  return (
    <button
      onClick={() => window.history.back()}
      className={`inline-flex items-center gap-1 text-[9px] font-bold tracking-[0.22em] uppercase transition-all group ${
        light
          ? "text-white/60 hover:text-white"
          : "text-[#D4AF37] hover:text-[#0F0F0F]"
      } ${className}`}
    >
      <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
      Back
    </button>
  );
}
