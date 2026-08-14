import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import {
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Shield,
  Globe,
  Share2,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#180033] border-t border-purple-900/50 pt-16 pb-8 text-purple-200 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block p-2.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-purple-100">
              <img
                src={logo}
                alt="MindMend Academy"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
              MindMend Academy is a premier educational training organization empowering engineering and college students with practical, industry-grade technical skills, corporate readiness, and guaranteed real-world internship mentorship.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-brand-600 hover:text-white flex items-center justify-center transition-colors text-slate-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.92 0 1.67-.75 1.67-1.67 0-.92-.75-1.67-1.67-1.67-.92 0-1.67.75-1.67 1.67 0 .92.75 1.67 1.67 1.67m1.39 9.74v-8.37H5.07v8.37h2.78z"/></svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-brand-600 hover:text-white flex items-center justify-center transition-colors text-slate-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-brand-600 hover:text-white flex items-center justify-center transition-colors text-slate-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-brand-600 hover:text-white flex items-center justify-center transition-colors text-slate-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
              Training Tracks
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/courses/java-programming" className="hover:text-brand-300 transition-colors">
                  Java Programming
                </Link>
              </li>
              <li>
                <Link to="/courses/power-bi" className="hover:text-brand-300 transition-colors">
                  Power BI & Analytics
                </Link>
              </li>
              <li>
                <Link to="/courses/aptitude-reasoning" className="hover:text-brand-300 transition-colors">
                  Placement Aptitude
                </Link>
              </li>
              <li>
                <Link to="/courses/ms-excel" className="hover:text-brand-300 transition-colors">
                  Advanced MS Excel
                </Link>
              </li>
              <li>
                <Link to="/courses/communication-skills" className="hover:text-brand-300 transition-colors">
                  Communication Skills
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Programs */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
              Programs & Portals
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/about" className="hover:text-brand-300 transition-colors">
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link to="/internship" className="hover:text-brand-300 transition-colors">
                  Internship Openings
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-300 transition-colors">
                  Campus Partnerships
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-300 transition-colors">
                  Student Portal Login
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-300 transition-colors">
                  Staff & Trainer Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
              Get in Touch
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <span>MindMend Tech Hub, 4th Floor, Electronic City Phase 1, Bangalore, KA 560100</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>+91 98765 43210 / +91 80 4123 4567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>contact@mindmend.edu</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 MindMend Academy. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Training</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Student Honor Code</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
