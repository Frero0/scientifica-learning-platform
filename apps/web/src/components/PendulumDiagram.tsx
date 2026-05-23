import type { LessonDetail } from "@/lib/types";

type PendulumDiagramProps = {
  content: LessonDetail["content"];
};

export function PendulumDiagram({ content }: PendulumDiagramProps) {
  return (
    <div className="rounded-lg border border-ink/10 bg-ink p-5 text-white shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/60">Visual model</p>
          <h2 className="mt-1 text-2xl font-semibold">{content.visualExplanation.title}</h2>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/75">
          T = 2*pi*sqrt(L/g)
        </span>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <svg className="h-64 w-full" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
          <line stroke="rgba(255,255,255,0.22)" strokeWidth="3" x1="36" x2="220" y1="42" y2="42" />
          <g className="pendulum-arm">
            <line
              stroke="rgba(101,211,188,0.9)"
              strokeLinecap="round"
              strokeWidth="4"
              x1="128"
              x2="164"
              y1="42"
              y2="178"
            />
            <circle cx="164" cy="178" fill="rgba(246,183,83,0.95)" r="18" />
          </g>
          <path
            d="M78 178C108 218 154 218 184 178"
            stroke="rgba(255,255,255,0.22)"
            strokeDasharray="4 7"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
        <div className="flex flex-col justify-center">
          <p className="text-base leading-7 text-white/72">
            {content.visualExplanation.description}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {content.visualExplanation.variables.map((variable) => (
              <div
                className="rounded-lg border border-white/10 bg-white/[0.06] p-3"
                key={variable.symbol}
              >
                <div className="text-xl font-semibold">{variable.symbol}</div>
                <div className="mt-1 text-sm text-white/60">{variable.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
