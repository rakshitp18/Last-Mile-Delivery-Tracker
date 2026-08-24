import React from 'react';
import { Link } from 'react-router-dom';

export const FastDeliveryScooterIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >

    {/* Speed Motion Streaks */}
    <rect x="1" y="8.5" width="2.5" height="1.5" rx="0.75" fill="white" opacity="0.85" />
    <rect x="0.5" y="11.5" width="3.2" height="1.5" rx="0.75" fill="white" opacity="0.85" />
    <rect x="1.8" y="14.5" width="2" height="1.5" rx="0.75" fill="white" opacity="0.85" />

    {/* Express Delivery Box */}
    <rect x="4.5" y="8" width="4.5" height="4.5" rx="1" fill="white" />

    {/* Scooter Body Frame */}
    <path
      d="M9.5 13.5l2.2-4.5h2.8l1.5 4.5h-6.5z"
      fill="white"
    />
    
    {/* Windshield / Handlebar */}
    <path
      d="M15 8h2.5a0.8 0.8 0 0 1 0.8 0.8v1.2h-3.3V8z"
      fill="white"
    />

    {/* Rear & Front Wheels */}
    <circle cx="7" cy="17.5" r="2.5" fill="white" />
    <circle cx="7" cy="17.5" r="1.1" fill="#ea580c" />
    
    <circle cx="17.5" cy="17.5" r="2.5" fill="white" />
    <circle cx="17.5" cy="17.5" r="1.1" fill="#ea580c" />
    
    {/* Platform & Kickboard */}
    <path
      d="M7 16h8.5a1 1 0 0 0 1-1v-1.5h-10.5V15a1 1 0 0 0 1 1z"
      fill="white"
    />
  </svg>
);

export const ScooterIcon = FastDeliveryScooterIcon;

interface GatimanLogoProps {
  to?: string;
  className?: string;
  badgeSize?: string;
  iconSize?: string;
  textSize?: string;
  textColor?: string;
  showText?: boolean;
}

export const GatimanLogo: React.FC<GatimanLogoProps> = ({
  to = '/',
  className = '',
  badgeSize = 'w-8 h-8',
  iconSize = 'w-4 h-4',
  textSize = 'text-xl',
  textColor = 'text-slate-900',
  showText = true,
}) => {
  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      <div className={`${badgeSize} rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0`}>
        <FastDeliveryScooterIcon className={iconSize} />
      </div>
      {showText && (
        <span className={`font-heading font-black ${textSize} tracking-tight ${textColor} group-hover:text-brand-500 transition-colors`}>
          Ship It<span className="text-brand-500">.</span>
        </span>
      )}
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return content;
};
