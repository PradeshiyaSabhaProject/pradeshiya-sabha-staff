import React from 'react'

// ── Social Icons ───────────────────────────────────────────────────────────
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

// ── Component ──────────────────────────────────────────────────────────────
const Footer: React.FC = () => {
  const quickLinks = [
    { label: 'Home', href: '#' },
    { label: 'Introduction', href: '#' },
    { label: 'RTI Officers', href: '#' },
    { label: 'Gallery', href: '#' },
    { label: 'Downloads', href: '#' },
    { label: 'Contact Us', href: '#' },
  ]

  const importantLinks = [
    { label: 'ශ්‍රී ලංකා රජයේ නිල අන්තර්ජාල නිහිඳදෝ', href: '#' },
    { label: 'නාගරික ස්වර්ධන අධිකාරිය', href: '#' },
    { label: 'රාජ්‍ය නොරාතුරු කේන්ද්‍රය', href: '#' },
    { label: 'ආරක්ෂණ අමාතාංශය', href: '#' },
    { label: 'පළාත් පාලන හා පළාත් සභා අමාතාංශය', href: '#' },
    {
      label: 'රාජ්‍ය පරිපාලන, පළාත් පාලන හා පුළාතන්ත්‍රිය පාලනය පිළිබඳ අමාතාංශය',
      href: '#',
    },
  ]

  return (
    <footer className="bg-[#1a1a1a] text-gray-300">
      {/* Main footer content */}
      <div className="max-w-screen-2xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Column 1: Contact Information */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Contact Information</h3>
            <div className="space-y-1 text-sm text-gray-400">
              <p>හෝමාගම ප්‍රාදේශීය සභාව,</p>
              <p>උසාවිය පාර,</p>
              <p>හෝමාගම</p>
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <p>
                Phone:{' '}
                <a href="tel:+94112855230" className="hover:text-white transition-colors">
                  +94 11 285 5230
                </a>{' '}
                /{' '}
                <a href="tel:+94112755108" className="hover:text-white transition-colors">
                  +94 11 275 5108
                </a>
              </p>
              <p>
                Email:{' '}
                <a
                  href="mailto:homagamapradeshiyasabawa@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  homagamapradeshiyasabawa@gmail.com
                </a>
              </p>
            </div>
            {/* Social icons */}
            <div className="flex items-center gap-2 mt-5">
              {[
                { Icon: FacebookIcon, label: 'Facebook', href: '#' },
                { Icon: YoutubeIcon, label: 'YouTube', href: '#' },
                { Icon: InstagramIcon, label: 'Instagram', href: '#' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded border border-gray-600 flex items-center justify-center text-gray-400 hover:border-white hover:text-white transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Important Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Important Links</h3>
            <ul className="space-y-2.5">
              {importantLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors leading-snug block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>Copyright © 2025 Homagama Pradeshiya Sabha. All Rights Reserved.</span>
          <span>Concept, Design &amp; Development by SLT</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
