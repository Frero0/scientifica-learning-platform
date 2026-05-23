export function ScientificField() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(20,22,20,0.95),rgba(20,22,20,0.82)_48%,rgba(15,118,110,0.55))]" />
      <svg
        className="absolute right-[-12rem] top-[-8rem] h-[48rem] w-[56rem] max-w-none opacity-80 sm:right-[-6rem] lg:right-0"
        fill="none"
        viewBox="0 0 900 760"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="field-wave"
          d="M48 442C160 334 254 550 362 442C470 334 564 550 672 442C748 366 812 424 858 472"
          stroke="rgba(245,245,239,0.48)"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <path
          d="M124 272C248 186 386 188 520 278C624 348 724 340 826 266"
          stroke="rgba(246,183,83,0.62)"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M188 604C324 484 448 696 584 576C660 508 748 516 846 604"
          stroke="rgba(101,211,188,0.58)"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <g className="field-node">
          <circle cx="246" cy="214" fill="rgba(246,183,83,0.95)" r="8" />
          <circle cx="246" cy="214" r="34" stroke="rgba(246,183,83,0.24)" strokeWidth="2" />
        </g>
        <g className="field-node" style={{ animationDelay: "700ms" }}>
          <circle cx="612" cy="332" fill="rgba(101,211,188,0.95)" r="10" />
          <circle cx="612" cy="332" r="46" stroke="rgba(101,211,188,0.22)" strokeWidth="2" />
        </g>
        <g className="field-node" style={{ animationDelay: "1300ms" }}>
          <circle cx="746" cy="560" fill="rgba(245,245,239,0.88)" r="7" />
          <circle cx="746" cy="560" r="30" stroke="rgba(245,245,239,0.18)" strokeWidth="2" />
        </g>
        <path
          d="M270 216L612 332L746 560M612 332L392 606M246 214L392 606"
          stroke="rgba(245,245,239,0.16)"
          strokeWidth="1.5"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-ink to-transparent" />
    </div>
  );
}
