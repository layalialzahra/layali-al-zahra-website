import React, { useState } from 'react';
import { Phone, MessageCircle, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

import { legacyServicesData as servicesData } from '../data/legacy-services.js';
import { legacyFaqs } from '../data/legacy-faqs.js';
const phoneNumbers = [
  { label: 'Mobile 1', number: '+971 52 370 6025', link: 'tel:+971523706025' },
  { label: 'Mobile 2', number: '+971 50 614 3199', link: 'tel:+971506143199' },
  { label: 'Tel 1', number: '+971 4 347 5545', link: 'tel:+97143475545' },
  { label: 'Tel 2', number: '+971 4 357 1060', link: 'tel:+97143571060' },
];

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<(typeof servicesData)[0] | null>(null);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);

  return (
    <div className="min-h-screen pt-8 pb-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="font-tangerine text-6xl md:text-8xl text-rose-900 mb-4">Our Services</h1>
          <p className="text-gray-700 text-xl max-w-3xl mx-auto">
            Discover our comprehensive range of luxury beauty services
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {servicesData.map((service) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer group"
            >
              <div className="h-64 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title + ' — beauty service at Layali Al Zahra, Al Barsha, Dubai'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-rose-900 text-center">{service.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Service Detail Dialog */}
        <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-rose-900 text-center mb-4">
                {selectedService?.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                View detailed pricing for {selectedService?.title}
              </DialogDescription>
            </DialogHeader>
            {selectedService && (
              <div>
                <img
                  src={selectedService.image}
                  alt={selectedService.title + ' — beauty service at Layali Al Zahra, Al Barsha, Dubai'}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
                <div className="space-y-3">
                  {selectedService.subservices.map((subservice, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 bg-rose-50 rounded-lg"
                    >
                      <span className="text-gray-800">{subservice.name}</span>
                      <span className="text-rose-600">{subservice.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Phone Numbers Dialog */}
        <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-rose-900 text-center mb-4">Contact Us</DialogTitle>
              <DialogDescription className="sr-only">
                Choose a phone number to contact us
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
      </div>

      {/* Action Buttons Section - Above Footer */}
      <div className="py-12 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() =>
                window.open(
                  'https://store.zylu.co/business/layali-al-zahra-beauty-salon-llc/services',
                  '_blank'
                )
              }
              className="bg-gradient-to-br from-rose-900 via-pink-900 to-rose-950 text-white hover:opacity-90 px-8 py-6 shadow-md"
            >
              Book Now
            </Button>
            <Button
              onClick={() => setShowPhoneDialog(true)}
              className="bg-gradient-to-br from-rose-900 via-pink-900 to-rose-950 text-white hover:opacity-90 px-8 py-6"
            >
              <Phone className="w-5 h-5 mr-2" />
              Contact Us
            </Button>
            <Button
              onClick={() =>
                window.open(
                  'https://wa.me/971523706025?text=Hi!%20I%E2%80%99d%20like%20to%20book%20an%20appointment%20at%20Layali%20Al%20Zahra%20Beauty%20Lounge.%20Could%20you%20please%20share%20the%20available%20slots%20and%20details%3F',
                  '_blank'
                )
              }
              className="bg-gradient-to-br from-rose-900 via-pink-900 to-rose-950 text-white hover:opacity-90 px-8 py-6"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp Us
            </Button>
            <Button
              onClick={() =>
                window.open(
                  'https://drive.google.com/file/d/1nakcllVMlJWBZr5ZLhyQuw2W2Ua93ZF0/view?usp=sharing',
                  '_blank'
                )
              }
              className="bg-gradient-to-br from-rose-900 via-pink-900 to-rose-950 text-white hover:opacity-90 px-8 py-6"
            >
              <Download className="w-5 h-5 mr-2" />
              View Price List
            </Button>
          </div>
        </div>
      </div>
        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <div className="text-center mb-8">
            <h2 className="text-rose-900 text-3xl font-semibold mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-600">Everything you need to know about our beauty services in Al Barsha, Dubai</p>
          </div>
          <div className="space-y-3">
            {legacyFaqs.services.map((faq, i) => (
              <details key={i} className="bg-white rounded-lg shadow-sm border border-rose-100">
                <summary className="flex justify-between items-center p-5 cursor-pointer list-none font-semibold text-rose-900 hover:text-rose-700">
                  <span>{faq.q}</span>
                  <span className="ml-4 text-rose-400 flex-shrink-0 text-xl font-light select-none">&#43;</span>
                </summary>
                <p className="px-5 pb-5 text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
  
    </div>
  );
}
