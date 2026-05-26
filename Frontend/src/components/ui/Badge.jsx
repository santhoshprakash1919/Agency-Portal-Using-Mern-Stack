export default function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: { background: "rgba(113, 76, 46, 0.12)", color: "#6a523f" },
    success: { background: "rgba(46, 125, 76, 0.12)", color: "#2e7d4c" },
    warning: { background: "rgba(242, 179, 61, 0.16)", color: "#9e5f12" },
    danger: { background: "rgba(184, 63, 53, 0.12)", color: "#b83f35" },
  };

  return (
    <span className="badge" style={tones[tone] || tones.neutral}>
      {children}
    </span>
  );
}
