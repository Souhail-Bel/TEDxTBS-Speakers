import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex h-[55vh] flex-col items-center justify-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E31B2B]/30 bg-[#E31B2B]/12 shadow-[0_0_24px_rgba(227,27,43,0.22)]">
        <Loader2 className="h-5 w-5 animate-spin text-[#E31B2B]" />
      </div>
      <p className="text-xs font-medium tracking-wide text-[#8A8282]">
        Loading TEDxTBS…
      </p>
    </div>
  );
}
