type AvatarProps = {
  name: string;
  className?: string;
};

const PALETTE = [
  "bg-secondary text-on-secondary",
  "bg-success-emerald text-white",
  "bg-alert-coral text-white",
  "bg-tertiary-fixed-dim text-on-tertiary-fixed",
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function hashName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function Avatar({ name, className = "w-10 h-10" }: AvatarProps) {
  const palette = PALETTE[hashName(name) % PALETTE.length];

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center rounded-full font-body-custom text-label-sm font-bold shrink-0 ${palette} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
