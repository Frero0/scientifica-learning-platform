type PendulumDiagramProps = {
  content: {
    visualExplanation: {
      title?: string;
      description?: string;
      variables: Array<Record<string, unknown>>;
    };
  };
};

export function PendulumDiagram({ content }: PendulumDiagramProps) {
  const { visualExplanation } = content;
  const variables = visualExplanation.variables.length
    ? visualExplanation.variables
    : [
        { symbol: "L", label: "Length" },
        { symbol: "g", label: "Gravity" },
        { symbol: "T", label: "Period" }
      ];

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-ink text-white shadow-lift">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <p className="text-sm font-medium text-white/60">Visual model / pendulum lab</p>
          <h2 className="mt-1 text-3xl font-semibold leading-tight">
            {visualExplanation.title ?? "Visual model"}
          </h2>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-left shadow-inset">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/50">
            Model equation
          </p>
          <p className="mt-1 font-mono text-lg text-white">T = 2*pi*sqrt(L/g)</p>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_24rem]">
        <div className="relative min-h-[24rem] overflow-hidden bg-[radial-gradient(circle_at_50%_20%,rgba(101,211,188,0.18),transparent_18rem)] p-5 sm:p-8">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.22)_1px,transparent_1px)] [background-size:36px_36px]"
          />
          <svg
            aria-label="Animated pendulum model"
            className="relative mx-auto h-80 w-full max-w-[38rem]"
            role="img"
            viewBox="0 0 520 340"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              stroke="rgba(255,255,255,0.28)"
              strokeLinecap="round"
              strokeWidth="8"
              x1="96"
              x2="424"
              y1="48"
              y2="48"
            />
            <circle cx="260" cy="48" fill="rgba(255,255,255,0.16)" r="16" />
            <g className="pendulum-arm">
              <line
                stroke="rgba(101,211,188,0.95)"
                strokeLinecap="round"
                strokeWidth="7"
                x1="260"
                x2="332"
                y1="48"
                y2="236"
              />
              <circle cx="332" cy="236" fill="rgba(246,183,83,0.98)" r="28" />
              <circle cx="332" cy="236" fill="rgba(255,255,255,0.22)" r="12" />
            </g>
            <path
              d="M160 236C204 302 316 302 360 236"
              stroke="rgba(255,255,255,0.28)"
              strokeDasharray="7 10"
              strokeLinecap="round"
              strokeWidth="4"
            />
            <g>
              <line
                stroke="rgba(255,255,255,0.32)"
                strokeDasharray="5 7"
                x1="260"
                x2="260"
                y1="48"
                y2="260"
              />
              <text fill="rgba(255,255,255,0.72)" fontSize="18" x="274" y="142">
                L
              </text>
              <text fill="rgba(255,255,255,0.58)" fontSize="15" x="360" y="232">
                mass does not change T here
              </text>
              <text fill="rgba(101,211,188,0.95)" fontSize="16" x="126" y="280">
                measured period T
              </text>
            </g>
          </svg>
        </div>

        <div className="border-t border-white/10 bg-white/[0.045] p-5 sm:p-6 lg:border-l lg:border-t-0">
          <p className="text-base leading-7 text-white/72">
            {visualExplanation.description ?? "This lesson has no visual explanation configured."}
          </p>

          <div className="mt-6 grid gap-3">
            {variables.map((variable, index) => (
              <div
                className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3"
                key={getVariableText(variable.symbol, `variable-${index}`)}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl font-semibold">
                  {getVariableText(variable.symbol, "V")}
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {getVariableText(variable.label, "Model input")}
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-teal-300"
                      style={{ width: `${62 - index * 14}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-sm font-semibold text-amber-100">Notebook prompt</p>
            <p className="mt-2 text-sm leading-6 text-white/68">
              Change one variable at a time. If the period changes, the variable belongs in the
              model.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getVariableText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}
