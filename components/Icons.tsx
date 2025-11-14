
import React from 'react';

// Fix: Add optional style property to allow custom styling on icons.
interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

// Fix: Destructure and apply the style prop to the SVG element.
export const OnzyLogoIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z" fill="currentColor"/>
  </svg>
);

export const SendIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
    </svg>
);

export const MessageSquareIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

export const XIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

export const BrainCircuitIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.993.142"/>
    <path d="M18 13a3 3 0 1 0-4.42 2.495"/>
    <path d="M5 13a3 3 0 1 0-1.58 2.815"/>
    <path d="M12 19a3 3 0 1 0 5.993-.142"/>
    <path d="M12 5a3 3 0 1 0-5.993.142"/>
    <path d="M18 13a3 3 0 1 0-4.42 2.495"/>
    <path d="M5 13a3 3 0 1 0-1.58 2.815"/>
    <path d="M12 19a3 3 0 1 0 5.993-.142"/>
    <path d="M12 5a3 3 0 1 0-5.993.142"/>
    <path d="m14.5 15.5 1-1"/>
    <path d="m6.01 12.857 1.5 2.5"/>
    <path d="m8 6 2.5 2.5"/>
    <path d="M12 19v-2.5"/>
    <path d="M12 5V2.5"/>
    <path d="m6.01 15.643-1.5-2.5"/>
    <path d="m16 8-2.5-2.5"/>
  </svg>
);

export const ZapIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

export const WhatsAppIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.35 3.45 16.86L2.05 22L7.31 20.62C8.75 21.41 10.36 21.86 12.04 21.86C17.5 21.86 21.95 17.41 21.95 11.91C21.95 6.45 17.5 2 12.04 2ZM17.13 15.42C16.91 15.93 15.99 16.48 15.54 16.53C15.09 16.58 14.5 16.59 14.15 16.43C13.8 16.27 13.01 16 12.06 15.62C10.96 15.17 10.13 14.34 9.96 14.13C9.79 13.92 9.64 13.71 9.49 13.5C9.34 13.29 9.19 13.1 9.07 12.91C8.95 12.72 8.82 12.53 8.7 12.33C8.58 12.14 8.46 11.97 8.33 11.79C8.24 11.66 8.14 11.51 8.04 11.26C7.94 11.01 7.84 10.76 7.84 10.5C7.84 10.24 7.91 10.01 8.07 9.85C8.23 9.69 8.41 9.56 8.6 9.56C8.79 9.56 8.96 9.56 9.1 9.56C9.24 9.56 9.38 9.56 9.51 9.93C9.64 10.3 10.11 11.51 10.2 11.65C10.29 11.79 10.36 11.91 10.29 12.03C10.22 12.15 10.19 12.21 10.08 12.33C9.97 12.45 9.88 12.54 9.77 12.65C9.68 12.74 9.59 12.83 9.71 12.97C9.83 13.11 10.26 13.71 10.83 14.23C11.53 14.87 12.2 15.19 12.44 15.31C12.68 15.43 12.85 15.4 12.97 15.28C13.09 15.16 13.3 14.91 13.48 14.68C13.66 14.45 13.84 14.42 14.06 14.5C14.28 14.58 15.39 15.11 15.65 15.23C15.91 15.35 16.08 15.4 16.13 15.48C16.18 15.56 16.18 15.65 16.18 15.74C16.18 15.83 16.18 15.89 16.18 15.93C16.18 15.97 17.35 14.91 17.13 15.42Z"/>
    </svg>
);