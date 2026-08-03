import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

import logo from '../../assets/logo.png'

// ── Icons ──────────────────────────────────────────────────────────────────
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
)
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
)
const HelpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <circle cx="12" cy="17" r=".5" fill="currentColor" />
  </svg>
)
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const CheckBadgeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.307 4.491 4.491 0 0 1-1.307-3.497A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
)

// ── Types ──────────────────────────────────────────────────────────────────
interface TopBarProps {
  hideNav?: boolean
}

// ── Component ──────────────────────────────────────────────────────────────
const TopBar: React.FC<TopBarProps> = ({ hideNav }) => {
  const { user } = useAuth()



  return (
    <header className="w-full shadow-sm sticky top-0 z-50">
      {/* ── Row 1: Branding + Social + Language + Phone ── */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-2.5">
        <div className="max-w-screen-2xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Name + Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Reveal Toggle in Row 1 */}


            {/* Real logo */}
            <img src={logo} alt="Homagama Pradeshiya Sabha Logo" className="h-11 sm:h-12 md:h-14 w-auto shrink-0" />
          </div>

          {/* Right side: language + social + phone */}
          <div className="flex flex-col items-end gap-1.5">
            {/* Language switcher */}


            {/* Social + Phone */}
            <div className="flex items-center gap-2">
              {/* Social icons */}
              <div className="flex items-center gap-1.5">
                {[
                  { Icon: FacebookIcon, label: 'Facebook', href: '#' },
                  { Icon: YoutubeIcon, label: 'YouTube', href: '#' },
                  { Icon: InstagramIcon, label: 'Instagram', href: '#' },
                ].map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-7 h-7 rounded bg-gray-700 hover:bg-[#A31736] text-white flex items-center justify-center transition-colors"
                  >
                    <Icon />
                  </a>
                ))}
              </div>

              {/* Phone */}
              <a
                href="tel:+94112855230"
                className="flex items-center gap-1.5 bg-gray-800 hover:bg-[#A31736] text-white text-sm px-3 py-1.5 rounded transition-colors"
              >
                <WhatsAppIcon />
                <span className="font-medium">+94 11 285 5230</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Main Nav Bar (dark red) ── */}
      {!hideNav && user && (
        <div className="bg-[#A31736] text-white px-4 md:px-6 py-0 border-b border-[#801028]">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between h-14 gap-3">
            {/* Left side: Hamburger/Cascade toggle + Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">

              <span className="text-xs sm:text-sm md:text-base font-bold tracking-wide uppercase truncate">
                Homagama Pradeshiya Sabha <span className="hidden md:inline">- Administrative Portal</span>
              </span>
            </div>

            {/* Nav links + separator + actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Topbar Nav links */}


              {/* Verified badge */}
              <div className="hidden lg:flex items-center gap-1.5 bg-white/10 border border-white/30 rounded px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <CheckBadgeIcon />
                <span>Verified Staff Member</span>
              </div>

              {/* Help */}
              <button
                aria-label="Help"
                className="ml-2 p-2 rounded hover:bg-white/10 transition-colors"
              >
                <HelpIcon />
              </button>

              {/* Profile */}
              <Link
                to="/profile"
                aria-label="My profile"
                className="p-2 rounded hover:bg-white/10 transition-colors"
              >
                <UserIcon />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default TopBar

