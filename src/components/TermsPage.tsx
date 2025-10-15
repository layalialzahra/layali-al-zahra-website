import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-8 pb-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="font-tangerine text-5xl md:text-7xl text-rose-900 text-center mb-8">
            Terms & Conditions
          </h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-rose-900 mb-3">1. Introduction</h2>
              <p>
                Welcome to Layali Al Zahra Beauty Salon LLC. These Terms and Conditions govern your use of our services and website at layalialzahra.com. By accessing our website or using our services, you agree to be bound by these terms.
              </p>
            </section>

            <section>
              <h2 className="text-rose-900 mb-3">2. Booking and Appointments</h2>
              <p className="mb-3">
                All appointments must be booked in advance through our online booking system, phone, or in person. We reserve the right to refuse service to anyone for any reason.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Appointments are subject to availability</li>
                <li>We recommend booking at least 24-48 hours in advance for popular services</li>
                <li>Walk-ins are welcome but cannot be guaranteed service</li>
                <li>Late arrivals may result in shortened service time or rescheduling</li>
              </ul>
            </section>

            <section>
              <h2 className="text-rose-900 mb-3">3. Cancellation Policy</h2>
              <p className="mb-3">
                We understand that schedules change. However, we ask that you respect our cancellation policy:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cancellations must be made at least 24 hours in advance</li>
                <li>No-shows or same-day cancellations may result in a cancellation fee</li>
                <li>Multiple no-shows may result in a deposit requirement for future bookings</li>
                <li>Cancellations can be made by phone, email, or through our online booking system</li>
              </ul>
            </section>

            <section>
              <h2 className="text-rose-900 mb-3">4. Payment Terms</h2>
              <p className="mb-3">
                Payment is due at the time of service. We accept the following payment methods:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cash (AED)</li>
                <li>Credit and debit cards (Visa, Mastercard, American Express)</li>
                <li>Digital payment methods</li>
                <li>All prices are listed in AED and are subject to change without notice</li>
                <li>Gift vouchers and packages must be used within their validity period</li>
              </ul>
            </section>

            <section>
              <h2 className="text-rose-900 mb-3">5. Service Guarantee</h2>
              <p className="mb-3">
                Your satisfaction is our priority. If you are not completely satisfied with your service:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Please inform us immediately so we can address your concerns</li>
                <li>We offer complimentary corrections within 7 days of your original service</li>
                <li>Refunds are evaluated on a case-by-case basis</li>
                <li>We reserve the right to refuse correction services if the issue was caused by client negligence</li>
              </ul>
            </section>

            <section>
              <h2 className="text-rose-900 mb-3">6. Health and Safety</h2>
              <p className="mb-3">
                For the safety and wellbeing of all clients and staff:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Please inform us of any allergies, sensitivities, or medical conditions before your service</li>
                <li>We maintain strict hygiene and sanitation protocols</li>
                <li>All tools and equipment are properly sanitized between clients</li>
                <li>We reserve the right to refuse service if we believe it may pose a health risk</li>
                <li>Clients with contagious conditions will be rescheduled</li>
              </ul>
            </section>

            <section>
              <h2 className="text-rose-900 mb-3">7. Client Conduct</h2>
              <p className="mb-3">
                We strive to maintain a relaxing and professional environment for all clients:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Please arrive on time for your appointment</li>
                <li>Mobile phones should be on silent mode</li>
                <li>We reserve the right to refuse service to clients who are disruptive or disrespectful</li>
                <li>Children must be supervised at all times</li>
              </ul>
            </section>

            <section>
              <h2 className="text-rose-900 mb-3">8. Liability</h2>
              <p className="mb-3">
                While we take every precaution to ensure your safety:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Layali Al Zahra Beauty Salon LLC is not responsible for allergic reactions to products when allergies have not been disclosed</li>
                <li>We are not liable for loss or damage to personal belongings</li>
                <li>Clients are responsible for following aftercare instructions</li>
                <li>We recommend patch tests for color services and chemical treatments</li>
              </ul>
            </section>

            <section>
              <h2 className="text-rose-900 mb-3">9. Privacy Policy</h2>
              <p className="mb-3">
                We respect your privacy and are committed to protecting your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Personal information is collected only for appointment and service purposes</li>
                <li>We do not share your information with third parties without consent</li>
                <li>Client records are kept confidential and secure</li>
                <li>You have the right to request deletion of your personal data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-rose-900 mb-3">10. Gift Vouchers and Packages</h2>
              <p className="mb-3">
                Gift vouchers and service packages are subject to the following terms:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Valid for 6 months from date of purchase unless otherwise stated</li>
                <li>Non-refundable and non-transferable for cash</li>
                <li>Can be used for any service or product of equal or lesser value</li>
                <li>Cannot be combined with other promotions unless specified</li>
                <li>Must be presented at time of service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-rose-900 mb-3">11. Promotional Offers</h2>
              <p className="mb-3">
                All promotional offers are subject to terms and conditions:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Offers are valid for the period specified</li>
                <li>Cannot be combined with other promotions unless stated</li>
                <li>We reserve the right to modify or cancel promotions at any time</li>
                <li>Offers are subject to availability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-rose-900 mb-3">12. Intellectual Property</h2>
              <p>
                All content on layalialzahra.com including text, images, logos, and graphics are the property of Layali Al Zahra Beauty Salon LLC and are protected by copyright laws. Unauthorized use is prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-rose-900 mb-3">13. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to our website. Continued use of our services constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-rose-900 mb-3">14. Contact Information</h2>
              <div className="bg-rose-50 p-6 rounded-lg space-y-2">
                <p>
                  <strong className="text-rose-900">Address:</strong><br />
                  Shop No.1, No.11, Near Westzone Supermarket, Al Tallal Building, Al Barsha 1, Dubai
                </p>
                <p>
                  <strong className="text-rose-900">Email:</strong><br />
                  <a href="mailto:info@layalialzahra.com" className="text-rose-600 hover:text-rose-700">
                    info@layalialzahra.com
                  </a>
                </p>
                <p>
                  <strong className="text-rose-900">Mobile:</strong><br />
                  <a href="tel:+971523706025" className="text-rose-600 hover:text-rose-700">+971 52 370 6025</a> | <a href="tel:+971506143199" className="text-rose-600 hover:text-rose-700">+971 50 614 3199</a>
                </p>
                <p>
                  <strong className="text-rose-900">Telephone:</strong><br />
                  <a href="tel:+97143473880" className="text-rose-600 hover:text-rose-700">+971 4 347 3880</a> | <a href="tel:+97143473001" className="text-rose-600 hover:text-rose-700">+971 4 347 3001</a>
                </p>
              </div>
            </section>

            <section className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 italic">
                Last Updated: October 15, 2025
              </p>
              <p className="text-sm text-gray-600 mt-4">
                By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
