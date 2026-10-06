export function UserIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

export function PlayIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function HeartIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001z" />
    </svg>
  );
}

export function ClockIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 0 0-1.5 0v6c0 .199.079.39.22.53l3.5 3.5a.75.75 0 1 0 1.06-1.06l-3.28-3.28V6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function CalendarIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function NoteIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M19.95 2.1a1 1 0 0 0-1.2-.75L9.75 3.1A1 1 0 0 0 9 4.07v11.18A3.75 3.75 0 1 0 11 18.5V7.47l7-1.4v6.18A3.75 3.75 0 1 0 20 15.5V3a1 1 0 0 0-.05-.9z" />
    </svg>
  );
}

export function ComboIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function StarIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function PauseIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M6 5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5zm8 0a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V5z" />
    </svg>
  );
}

export function CloseIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none">
      <path d="m3.5 3.5 9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ExternalIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none">
      <path d="M6.5 3H3.8A1.8 1.8 0 0 0 2 4.8v7.4A1.8 1.8 0 0 0 3.8 14h7.4a1.8 1.8 0 0 0 1.8-1.8V9.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 2h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 2 7.5 8.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function DetailIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none">
      <path d="M2.5 3.5h11M2.5 8h11M2.5 12.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function DownloadIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none">
      <path d="M8 2.2v7.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.6 7.2 8 10.6l3.4-3.4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3 13.2h10" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function HeartOutlineIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export function BookmarkIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M5 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v18l-7-4-7 4V4z" />
    </svg>
  );
}

export function BookmarkOutlineIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

export function ShareIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

export function CheckIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function PlusIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function TrashIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function EditIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function OsuLogo({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="25 25 300 300"
      className={className}
      aria-hidden="true"
    >
      <style>{`
        .osu-st1{opacity:.15}
        .osu-st3{fill:#f1f1f2}
        .osu-st4{fill:#231f20}
        .osu-st5{fill:#808184}
        .osu-st8{fill:#59595c}
        .osu-st9{fill:#a7a8ab}
        .osu-st10{fill:#6d6e70}
        .osu-st11{fill:#221f1f}
        .osu-st12{fill:#404041}
        .osu-st13{fill:#58595b}
        .osu-st14{fill:#bbbdbf}
        .osu-st15{fill:#fff}
        .osu-st16{fill:#a6a8ab}
      `}</style>
      <circle cx="175" cy="175" r="143.7" fill="#f6a" />
      <g className="osu-st1" id="Triangles">
        <defs>
          <circle id="osu-logo-clip-a" className="osu-st1" cx="175" cy="175" r="150" />
        </defs>
        <clipPath id="osu-logo-clip-b">
          <use href="#osu-logo-clip-a" overflow="visible" />
        </clipPath>
        <g clipPath="url(#osu-logo-clip-b)">
          <path className="osu-st3" d="M-81.2 336.9 175-106.9l256.2 443.8z" />
          <path className="osu-st4" d="M68.8 443.7 325 0l256.2 443.7z" />
          <path className="osu-st5" d="m-409.8 363.4 256.2-443.7 256.2 443.7z" />
          <path d="m61.4 158.2 256.2-443.8 256.2 443.8z" fill="#929497" />
          <path d="M-222.4 380 33.8-63.7 290 380z" fill="#636466" />
          <path className="osu-st8" d="m-100.1 646.9 256.2-443.8 256.2 443.8z" />
          <path className="osu-st9" d="m-164.9 147.2 97.3-168.5 97.3 168.5zm81.5 376.6 97.3-168.5 97.3 168.5z" />
          <path className="osu-st10" d="m134.3 220.8 97.3-168.5 97.3 168.5z" />
          <path className="osu-st9" d="M298.7 485.7 396 317.2l97.2 168.5z" />
          <path className="osu-st8" d="m108.4 621.4 48.6-84.2 48.7 84.2z" />
          <path className="osu-st11" d="m278.7 305.9 48.6-84.2 48.6 84.2zM46.2 400l97.3-168.5L240.8 400z" />
          <path className="osu-st5" d="M108.8-86.6 36.5 38.6h194.6L158.8-86.6zm213.2 0-23.6 40.9h97.3L372-86.6z" />
          <path className="osu-st12" d="M35.3 332.5 132.6 164l97.3 168.5z" />
          <path className="osu-st5" d="m236.1 369.2 97.2-168.5 97.3 168.5z" />
          <path className="osu-st8" d="m-51.9 428.8 48.1-83.3 48.1 83.3z" />
          <path className="osu-st13" d="m123.2 104.8 48.1-83.3 48.1 83.3z" />
          <path className="osu-st11" d="m283 90.2 48.1-83.3 48.1 83.3z" />
          <path className="osu-st5" d="m-61.9 331.6 24.1-41.7 24 41.7z" />
          <path className="osu-st8" d="m132.5 621.6 24-41.7 24.1 41.7zm84.2-156 24-41.7 24 41.7z" />
          <path className="osu-st12" d="m197.1 259.7 48.1-83.3 48.1 83.3z" />
          <path className="osu-st3" d="m283 239.3 48.1-83.3 48.1 83.3z" />
          <path className="osu-st9" d="M-49.5 78.8-1.4-4.5l48.1 83.3zm-48.4 146.6 48.1-83.3 48.1 83.3z" />
          <path className="osu-st5" d="m288.2-20 24-41.6L336.3-20z" />
          <path className="osu-st14" d="m187.2 116.2 24.1-41.6 24 41.6z" />
          <path className="osu-st15" d="m231.9 63.8 6.4-11 6.4 11z" />
          <path className="osu-st10" d="M28.9 117.8 77 34.5l48.1 83.3z" />
          <path className="osu-st16" d="m110.8 331.9 48.1-83.3 48.1 83.3z" />
          <path className="osu-st4" d="m107 263.1 18.1-31.4 18 31.4z" />
          <path className="osu-st9" d="m214 285.3 24-41.7 24.1 41.7zm-5.4-118.1 24-41.6 24.1 41.6z" />
          <path className="osu-st3" d="m226 102.8 48.1-83.3 48 83.3z" />
          <path className="osu-st16" d="m1.2 143.6 48.1-83.3 48.1 83.3z" />
          <path className="osu-st8" d="m14 272.2 18.3-31.8 18.3 31.8z" />
          <path className="osu-st16" d="m265.4 230.6 18.3-31.8 18.3 31.8z" />
          <path className="osu-st15" d="M156.7 84.8 175 53.1l18.3 31.7z" />
          <path className="osu-st13" d="m156.7 282.1 18.3-31.8 18.3 31.8z" />
          <path className="osu-st8" d="m-19.7 88 18.3-31.8L17 88zm258.1 272.2 18.3-31.7 18.3 31.7z" />
          <path className="osu-st5" d="m307.5 135.6 18.3-31.8 18.3 31.8z" />
          <path className="osu-st14" d="m45.3 233.1 18.3-31.8L82 233.1z" />
          <path className="osu-st3" d="m72.3 295.1 18.3-31.8 18.4 31.8zM27.6 167.7 46 136l18.3 31.7z" />
          <path className="osu-st8" d="m113.7 123.7 9.1-15.8 9.2 15.8z" />
          <path className="osu-st14" d="m50.8 152.9 9.1-15.8 9.2 15.8z" />
          <path d="m107.7 84.4 9.2-15.9 9.2 15.9z" fill="#e6e7e8" />
          <path className="osu-st11" d="m69 360.2 18.3-31.7 18.3 31.7z" />
          <path className="osu-st8" d="m112.2 419.2 18.3-31.8 18.3 31.8zm404.5-131.1 18.4-31.8 18.3 31.8z" />
          <path className="osu-st5" d="M187.7 61.9 206 30.1l18.4 31.8z" />
          <path className="osu-st15" d="m283.4 128.2 18.3-31.7 18.3 31.7z" />
          <path className="osu-st8" d="m316.6 622.1 9.2-15.9 9.2 15.9z" />
          <path className="osu-st9" d="m262.4 411.2 9.2-15.8 9.1 15.8z" />
          <path className="osu-st8" d="m577.5 394.4 9.2-15.9 9.2 15.9z" />
          <path className="osu-st5" d="m-97.4 339.9 18.3-31.7 18.4 31.7zm375.1-24.4 18.4-31.8 18.3 31.8z" />
          <path className="osu-st9" d="m286.9 268.6 9.2-15.9 9.1 15.9z" />
          <path d="m210.1 128.5 10.9-18.9 10.9 18.9z" fill="#d0d2d3" />
          <path className="osu-st5" d="M94.9-41.1 104-57l9.2 15.9z" />
          <path className="osu-st8" d="M386.7 121.9 405 90.2l18.4 31.7zM463 336.8l9.2-15.9 9.2 15.9z" />
        </g>
      </g>
      <path
        className="osu-st15"
        d="M100.1 206.4c-4.7 0-8.8-.8-12.3-2.3-3.5-1.5-6.4-3.7-8.6-6.4-2.3-2.7-4-5.9-5.2-9.6-1.2-3.7-1.7-7.6-1.7-11.9 0-4.3.6-8.3 1.7-12 1.2-3.7 2.9-7 5.2-9.7 2.3-2.7 5.2-4.9 8.6-6.5 3.5-1.6 7.6-2.4 12.3-2.4s8.8.8 12.3 2.4c3.5 1.6 6.4 3.7 8.8 6.5 2.3 2.7 4 6 5.2 9.7 1.1 3.7 1.7 7.7 1.7 12s-.6 8.2-1.7 11.9c-1.1 3.7-2.8 6.9-5.2 9.6-2.3 2.7-5.2 4.9-8.8 6.4-3.4 1.6-7.6 2.3-12.3 2.3zm0-12.1c4.2 0 7.2-1.6 9-4.7 1.8-3.1 2.7-7.6 2.7-13.4 0-5.8-.9-10.3-2.7-13.4-1.8-3.1-4.8-4.7-9-4.7-4.1 0-7.1 1.6-8.9 4.7-1.8 3.1-2.8 7.6-2.8 13.4 0 5.8.9 10.3 2.8 13.4 1.8 3.2 4.8 4.7 8.9 4.7zm51.8-14.5c-4.2-1.2-7.5-3-9.8-5.3-2.4-2.4-3.5-5.9-3.5-10.6 0-5.7 2-10.1 6.1-13.4 4.1-3.2 9.6-4.8 16.7-4.8a49.13 49.13 0 0 1 17.2 3.2c-.2 1.9-.5 4-1.1 6.1-.6 2.1-1.3 3.9-2.1 5.5-1.8-.7-3.8-1.4-5.9-2-2.2-.6-4.5-.8-6.8-.8-2.5 0-4.5.4-5.9 1.2-1.4.8-2.1 2-2.1 3.8 0 1.6.5 2.8 1.5 3.5 1 .7 2.4 1.3 4.3 1.9l6.4 1.9c2.1.6 4 1.3 5.7 2.2 1.7.9 3.1 1.9 4.3 3.2 1.2 1.3 2.1 2.8 2.8 4.7.7 1.9 1 4.2 1 6.8 0 2.8-.6 5.3-1.7 7.7a17.6 17.6 0 0 1-5 6.2c-2.2 1.8-4.9 3.1-8 4.2a35 35 0 0 1-10.7 1.5c-1.8 0-3.4-.1-4.9-.2-1.5-.1-2.9-.3-4.3-.6s-2.7-.6-4.1-1c-1.3-.4-2.8-.9-4.4-1.5.1-2 .5-4.1 1.1-6.1.6-2.1 1.3-4.1 2.2-6 2.5 1 4.8 1.7 7 2.2 2.2.5 4.5.7 6.9.7 1 0 2.2-.1 3.4-.3 1.2-.2 2.4-.5 3.4-1s1.9-1.1 2.6-1.9c.7-.8 1.1-1.8 1.1-3.1 0-1.8-.5-3.1-1.6-3.9-1.1-.8-2.6-1.5-4.5-2.1l-7.3-1.9zm39.3-32.7c2.7-.4 5.3-.7 8-.7 2.6 0 5.3.2 8 .7v30.7c0 3.1.2 5.6.7 7.6.5 2 1.2 3.6 2.2 4.7 1 1.2 2.3 2 3.8 2.5s3.3.7 5.3.7c2.8 0 5.1-.3 7-.8v-45.4c2.7-.4 5.3-.7 7.9-.7 2.6 0 5.3.2 8 .7v55.8c-2.4.8-5.6 1.6-9.5 2.4a65.33 65.33 0 0 1-23.3.3c-3.5-.6-6.6-1.9-9.3-3.8-2.7-1.9-4.8-4.8-6.3-8.5-1.6-3.7-2.4-8.7-2.4-14.9v-31.3zm65.9 58c-.4-2.8-.7-5.5-.7-8.2 0-2.7.2-5.5.7-8.3 2.8-.4 5.5-.7 8.2-.7 2.7 0 5.5.2 8.3.7.4 2.8.7 5.6.7 8.2 0 2.8-.2 5.5-.7 8.3-2.8.4-5.6.7-8.2.7-2.8-.1-5.5-.3-8.3-.7zm-.4-80.7c2.9-.4 5.8-.7 8.6-.7 2.9 0 5.8.2 8.8.7l-1.1 54.9c-2.6.4-5.1.7-7.5.7-2.5 0-5.1-.2-7.6-.7l-1.2-54.9z"
      />
      <path
        className="osu-st15"
        d="M175 25C92.2 25 25 92.2 25 175s67.2 150 150 150 150-67.2 150-150S257.8 25 175 25zm0 285c-74.6 0-135-60.4-135-135S100.4 40 175 40s135 60.4 135 135-60.4 135-135 135z"
/>
    </svg>
  );
}

export function GridIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="currentColor">
      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z" />
    </svg>
  );
}

export function ListIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="currentColor">
      <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
    </svg>
  );
}

export function SearchIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
