import React from 'react';
import logo from 'figma:asset/9817600458343764435239bfb3fefec844c082eb.png';
import { Instagram, Facebook, Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-rose-900 via-pink-900 to-rose-950 text-white py-16 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Logo and About */}
          <div className="flex flex-col items-center md:items-start">
            <img src={logo} alt="Layali Al Zahra Logo" className="h-20 mb-4" />
            <p className="text-rose-200 text-center md:text-left text-sm">
              Luxury beauty services in the heart of Dubai
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-amber-400 mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0 text-rose-300" />
                <div>
                  <p className="text-rose-100">Mobile:</p>
                  <a href="tel:+971523706025" className="hover:text-amber-400 transition-colors">
                    +971 52 370 6025
                  </a>
                  <br />
                  <a href="tel:+971506143199" className="hover:text-amber-400 transition-colors">
                    +971 50 614 3199
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0 text-rose-300" />
                <div>
                  <p className="text-rose-100">Telephone:</p>
                  <a href="tel:+97143473880" className="hover:text-amber-400 transition-colors">
                    +971 4 347 3880
                  </a>
                  <br />
                  <a href="tel:+97143473001" className="hover:text-amber-400 transition-colors">
                    +971 4 347 3001
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-1 flex-shrink-0 text-rose-300" />
                <a href="mailto:info@layalialzahra.com" className="hover:text-amber-400 transition-colors">
                  info@layalialzahra.com
                </a>
              </div>
            </div>
          </div>

          {/* Location & Hours */}
          <div>
            <h3 className="text-amber-400 mb-4">Location & Hours</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-rose-300" />
                <a
                  href="https://www.google.com/maps/place/Layali+Al+Zahra+Beauty+Lounge/@25.1060274,55.1981324,18z/data=!4m6!3m5!1s0x3e5f6b605b77aaa5:0x61889b1cddafac75!8m2!3d25.1067745!4d55.1988388!16s%2Fg%2F11xzsd5pcx?entry=ttu&g_ep=EgoyMDI1MTAxMi4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors"
                >
                  Shop No.1, No.11, Near Westzone Supermarket, Al Tallal Building, Al Barsha 1, Dubai
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-1 flex-shrink-0 text-rose-300" />
                <div>
                  <p className="text-rose-100">Monday - Sunday:</p>
                  <p>10:00 AM - 9:00 PM</p>
                  <p className="text-rose-100 mt-2">Friday:</p>
                  <p>1:30 PM - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-amber-400 mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/alzahrabeauty.dubai/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-rose-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61582104334753"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-rose-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-rose-800 pt-8 text-center text-sm text-rose-200 space-y-2">
          <p>© 2025 Layali Al Zahra Beauty Salon LLC. All rights reserved.</p>
          <p>
            <a href="#terms" className="hover:text-amber-400 transition-colors underline">
              Terms & Conditions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
