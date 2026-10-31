import React from 'react';
import logo from 'figma:asset/9817600458343764435239bfb3fefec844c082eb.png';
import { Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="lz-site-footer">
      <style>{`
        .lz-site-footer{background:#17120f;color:#eee2d2;padding:72px 5.5% 24px;font-family:Montserrat,Arial,sans-serif;border-top:1px solid rgba(200,167,125,.28)}
        .lz-site-footer *{box-sizing:border-box}
        .lz-site-footer .lz-footer-inner{max-width:1320px;margin:0 auto}
                .lz-site-footer .lz-footer-grid{display:grid;grid-template-columns:1.25fr 1fr 1.25fr .7fr;gap:52px;padding:8px 0 55px}
        .lz-site-footer .lz-footer-brand img{display:block;width:auto;height:72px;max-width:150px;object-fit:contain;margin-bottom:20px}
        .lz-site-footer .lz-footer-brand p{max-width:245px;color:#bcae9e;font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:1.45}
        .lz-site-footer h3{margin:4px 0 22px;color:#c8a77d;font-size:10px;font-weight:600;letter-spacing:.2em;text-transform:uppercase}
        .lz-site-footer .lz-footer-copy{color:#d9cdbf;font-size:12px;line-height:1.9}
        .lz-site-footer .lz-footer-copy a{color:#d9cdbf;text-decoration:none;transition:color .2s}
        .lz-site-footer .lz-footer-copy a:hover{color:#d9b98e}
        .lz-site-footer .lz-footer-label{display:block;margin:15px 0 2px;color:#9f8d7b;font-size:9px;letter-spacing:.15em;text-transform:uppercase}
        .lz-site-footer .lz-footer-label:first-child{margin-top:0}
        .lz-site-footer .lz-socials{display:flex;gap:11px}
        .lz-site-footer .lz-socials a{display:flex;width:38px;height:38px;align-items:center;justify-content:center;border:1px solid rgba(200,167,125,.38);border-radius:50%;color:#d9bd98;transition:background .25s,color .25s,border-color .25s}
        .lz-site-footer .lz-socials a:hover{background:#c8a77d;color:#21170f;border-color:#c8a77d}
        .lz-site-footer .lz-socials svg{width:16px;height:16px}
        .lz-site-footer .lz-footer-bottom{display:flex;justify-content:space-between;align-items:center;gap:18px;padding-top:20px;border-top:1px solid rgba(200,167,125,.18);color:#8f8173;font-size:10px;letter-spacing:.035em}
        .lz-site-footer .lz-legal{display:flex;gap:22px}
        .lz-site-footer .lz-legal a{color:#b7a795;text-decoration:none;transition:color .2s}
        .lz-site-footer .lz-legal a:hover{color:#d9bd98}
        @media(max-width:900px){.lz-site-footer .lz-footer-grid{grid-template-columns:1fr 1fr;gap:38px}}
        @media(max-width:560px){
          .lz-site-footer{padding:55px 22px 22px}
          .lz-site-footer .lz-footer-intro{padding-bottom:40px}
          .lz-site-footer .lz-footer-grid{grid-template-columns:1fr 1fr;gap:32px 22px;padding:38px 0}
          .lz-site-footer .lz-footer-brand{grid-column:1/-1}
          .lz-site-footer .lz-footer-brand img{height:62px}
          .lz-site-footer h3{font-size:9px;margin-bottom:14px}
          .lz-site-footer .lz-footer-copy{font-size:11px}
          .lz-site-footer .lz-footer-bottom{flex-direction:column;align-items:flex-start;line-height:1.7}
        }
      `}</style>
      <div className="lz-footer-inner">
        <div className="lz-footer-grid">
          <div className="lz-footer-brand">
            <img src={logo} alt="Layali Al Zahra Beauty Salon LLC" />
            <p>Beauty is personal. Your time with us should be, too.</p>
          </div>

          <div>
            <h3>Contact</h3>
            <div className="lz-footer-copy">
              <span className="lz-footer-label">Mobile</span>
              <a href="tel:+971523706025">+971 52 370 6025</a>
              <span className="lz-footer-label">Telephone</span>
              <a href="tel:+97143475545">+971 4 347 5545</a><br />
              <a href="tel:+97143571060">+971 4 357 1060</a>
              <span className="lz-footer-label">Email</span>
              <a href="mailto:info@layalialzahra.com">info@layalialzahra.com</a>
            </div>
          </div>

          <div>
            <h3>Visit us</h3>
            <div className="lz-footer-copy">
              <a href="https://www.google.com/maps/place/Layali+Al+Zahra+Beauty+Lounge/@25.1060274,55.1981324,18z/data=!4m6!3m5!1s0x3e5f6b605b77aaa5:0x61889b1cddafac75!8m2!3d25.1067745!4d55.1988388!16s%2Fg%2F11xzsd5pcx?entry=ttu" target="_blank" rel="noopener noreferrer">Shop No. 1, Al Telal 11, Near Westzone Supermarket, Al Barsha 1, Dubai</a>
              <span className="lz-footer-label">Opening hours</span>
              Monday – Sunday<br />10:00 AM – 9:00 PM<br /><br />
              Friday<br />1:00 PM – 8:30 PM
            </div>
          </div>

          <div>
            <h3>Follow</h3>
            <div className="lz-socials">
              <a href="https://www.instagram.com/alzahrabeauty.dubai/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram /></a>
              <a href="https://www.facebook.com/profile.php?id=61582104334753" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook /></a>
            </div>
          </div>
        </div>

        <div className="lz-footer-bottom">
          <p>© {new Date().getFullYear()} Layali Al Zahra Beauty Salon LLC. All rights reserved.</p>
          <div className="lz-legal">
            <a href="#terms">Terms &amp; Conditions</a>
            <a href="#privacy">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
