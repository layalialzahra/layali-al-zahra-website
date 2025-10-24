import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

const phoneNumbers = [
  { label: 'Mobile 1', number: '+971 52 370 6025', link: 'tel:+971523706025' },
  { label: 'Mobile 2', number: '+971 50 614 3199', link: 'tel:+971506143199' },
  { label: 'Telephone 1', number: '+971 4 347 3880', link: 'tel:+97143473880' },
  { label: 'Telephone 2', number: '+971 4 347 3001', link: 'tel:+97143473001' },
];

interface ContactPageProps {
  onNavigate: (page: string) => void;
}

export default function ContactPage({ onNavigate }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock form submission
    setShowSuccessDialog(true);
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen pt-8 pb-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="font-tangerine text-6xl md:text-8xl text-rose-900 mb-4">Contact Us</h1>
          <p className="text-gray-700 text-xl max-w-3xl mx-auto">
            Get in touch with us to book your appointment or ask any questions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-rose-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-gray-700 mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full min-h-[150px]"
                  placeholder="Tell us how we can help you..."
                />
              </div>
              <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              
              {/* Learn More Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-600 mb-4">
                  Check our services and Book your Appointment today.
                </p>
                <Button
                  onClick={() => onNavigate('services')}
                  variant="outline"
                  className="w-full border-rose-500 text-rose-500 hover:bg-rose-50"
                >
                  Learn More
                </Button>
              </div>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Quick Contact Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-rose-900 mb-6">Quick Contact</h2>
              <div className="space-y-4">
                <Button
                  onClick={() => setShowPhoneDialog(true)}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white justify-start"
                >
                  <Phone className="w-5 h-5 mr-3" />
                  Call Now
                </Button>
                <Button
                  onClick={() =>
                    window.open(
                      'https://wa.me/971523706025?text=Hi!%20I%E2%80%99d%20like%20to%20book%20an%20appointment%20at%20Layali%20Al%20Zahra%20Beauty%20Lounge.%20Could%20you%20please%20share%20the%20available%20slots%20and%20details%3F',
                      '_blank'
                    )
                  }
                  className="w-full bg-green-500 hover:bg-green-600 text-white justify-start"
                >
                  <MessageCircle className="w-5 h-5 mr-3" />
                  WhatsApp Chat
                </Button>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-rose-900 mb-6">Contact Details</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-rose-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700">Email</p>
                    <a
                      href="mailto:info@layalialzahra.com"
                      className="text-rose-600 hover:text-rose-700"
                    >
                      info@layalialzahra.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-rose-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700 mb-2">Phone Numbers</p>
                    <div className="space-y-1">
                      {phoneNumbers.map((phone, index) => (
                        <a
                          key={index}
                          href={phone.link}
                          className="block text-rose-600 hover:text-rose-700 text-sm"
                        >
                          {phone.label}: {phone.number}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-rose-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700 mb-2">Address</p>
                    <a
                      href="https://www.google.com/maps/place/Layali+Al+Zahra+Beauty+Lounge/@25.1060274,55.1981324,18z/data=!4m6!3m5!1s0x3e5f6b605b77aaa5:0x61889b1cddafac75!8m2!3d25.1067745!4d55.1988388!16s%2Fg%2F11xzsd5pcx?entry=ttu&g_ep=EgoyMDI1MTAxMi4wIKXMDSoASAFQAw%3D%3D"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-600 hover:text-rose-700"
                    >
                      Tallal 11, Shop No. 1, Al Barsha 1, Dubai, United Arab Emirates
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-rose-900 mb-6">Opening Hours</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-700">Monday - Sunday</span>
                  <span className="text-gray-600">10:00 AM - 9:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Friday</span>
                  <span className="text-gray-600">1:30 PM - 9:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-12 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.4966848841967!2d55.196132476011916!3d25.106774577702767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6b605b77aaa5%3A0x61889b1cddafac75!2sLayali%20Al%20Zahra%20Beauty%20Lounge!5e0!3m2!1sen!2s!4v1706000000000!5m2!1sen!2s"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Layali Al Zahra Beauty Salon Location"
            ></iframe>
          </div>
        </div>

        {/* Phone Numbers Dialog */}
        <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-rose-900 text-center mb-4">
                Choose a Number to Call
              </DialogTitle>
              <DialogDescription className="sr-only">
                Select a phone number to call us
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {phoneNumbers.map((phone, index) => (
                <a
                  key={index}
                  href={phone.link}
                  className="flex items-center justify-between p-4 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  <span className="text-gray-700">{phone.label}</span>
                  <span className="text-rose-600">{phone.number}</span>
                </a>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-rose-900 text-center">Message Sent!</DialogTitle>
              <DialogDescription className="text-center text-gray-600 py-4">
                Thank you for contacting us. We'll get back to you as soon as possible.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
