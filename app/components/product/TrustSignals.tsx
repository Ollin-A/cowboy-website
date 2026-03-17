interface TrustSignal {
  label: string;
  /** Optional sub-text (e.g. "2-5 business days") */
  detail?: string;
  /** Optional link */
  href?: string;
}

interface TrustSignalsProps {
  signals?: TrustSignal[];
}

const defaultSignals: TrustSignal[] = [
  {label: 'Free shipping on orders over $150', detail: '2–5 business days'},
  {label: 'Free returns within 30 days'},
  {label: 'Secure checkout'},
  {label: 'Need help?', detail: 'Contact our team', href: '/contact'},
];

export default function TrustSignals({
  signals = defaultSignals,
}: TrustSignalsProps) {
  return (
    <ul
      className="list-none m-0 p-0 flex flex-col gap-3 border-t border-primary/10 pt-5"
      aria-label="Service information"
    >
      {signals.map((signal, i) => (
        <li key={i} className="flex items-start gap-3">
          {/* Minimal dash marker */}
          <span
            className="shrink-0 w-4 text-center text-text/30 font-body text-sm leading-[1.4] select-none"
            aria-hidden="true"
          >
            —
          </span>

          <div className="font-body text-sm text-text/70 leading-[1.4]">
            {signal.href ? (
              <a
                href={signal.href}
                className="text-text/70 hover:text-primary underline underline-offset-2 transition-colors duration-fast"
              >
                {signal.label}
              </a>
            ) : (
              <span>{signal.label}</span>
            )}
            {signal.detail && (
              <span className="block text-text/50 text-xs mt-0.5">
                {signal.detail}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
