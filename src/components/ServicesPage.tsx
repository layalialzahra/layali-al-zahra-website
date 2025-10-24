import React, { useState } from 'react';
import { Phone, MessageCircle, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

const servicesData = [
  {
    id: 'hair-treatments',
    title: 'Hair Treatments',
    image: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
    subservices: [
      { name: 'Keratin Treatment', price: 'AED 350 - 650' },
      { name: 'Hair Spa', price: 'AED 150 - 250' },
      { name: 'Deep Conditioning', price: 'AED 100 - 200' },
      { name: 'Scalp Treatment', price: 'AED 120 - 180' },
    ],
  },
  {
    id: 'hair-extensions',
    title: 'Hair Extensions',
    image: 'https://images.unsplash.com/photo-1634449571017-5fecfd26ad76?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
    subservices: [
      { name: 'Tape Extensions', price: 'AED 800 - 1500' },
      { name: 'Clip-in Extensions', price: 'AED 400 - 800' },
      { name: 'Micro Ring Extensions', price: 'AED 1000 - 2000' },
      { name: 'Extension Maintenance', price: 'AED 200 - 400' },
    ],
  },
  {
    id: 'color-highlights',
    title: 'Color & Highlights',
    image: 'https://images.unsplash.com/photo-1707812343087-c9ff9e5abb43?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774',
    subservices: [
      { name: 'Full Color', price: 'AED 250 - 500' },
      { name: 'Highlights', price: 'AED 300 - 600' },
      { name: 'Balayage', price: 'AED 400 - 800' },
      { name: 'Root Touch-up', price: 'AED 150 - 250' },
    ],
  },
  {
    id: 'nails',
    title: 'Nail Services',
    image: 'https://images.unsplash.com/photo-1633955726992-2b7c0d2d2a69?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=928',
    subservices: [
      { name: 'Classic Manicure', price: 'AED 50 - 80' },
      { name: 'Gel Manicure', price: 'AED 80 - 120' },
      { name: 'Classic Pedicure', price: 'AED 70 - 100' },
      { name: 'Gel Pedicure', price: 'AED 100 - 150' },
      { name: 'Nail Art', price: 'AED 50+' },
    ],
  },
  {
    id: 'facials',
    title: 'Facial Treatments',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
    subservices: [
      { name: 'Classic Facial', price: 'AED 150 - 250' },
      { name: 'Anti-Aging Facial', price: 'AED 300 - 500' },
      { name: 'Hydrating Facial', price: 'AED 200 - 350' },
      { name: 'Deep Cleansing Facial', price: 'AED 180 - 300' },
    ],
  },
  {
    id: 'makeup',
    title: 'Makeup Services',
    image: 'https://images.unsplash.com/photo-1614006659838-d4ca51cbd117?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2670',
    subservices: [
      { name: 'Party Makeup', price: 'AED 200 - 350' },
      { name: 'Bridal Makeup', price: 'AED 800 - 1500' },
      { name: 'Natural Makeup', price: 'AED 150 - 250' },
      { name: 'Special Occasion', price: 'AED 300 - 600' },
    ],
  },
  {
    id: 'waxing',
    title: 'Waxing Services',
    image: 'https://cdn.pixabay.com/photo/2024/06/08/18/47/woman-8817391_1280.jpg',
    subservices: [
      { name: 'Full Body Waxing', price: 'AED 250 - 400' },
      { name: 'Half Legs', price: 'AED 60 - 100' },
      { name: 'Full Legs', price: 'AED 100 - 150' },
      { name: 'Arms', price: 'AED 50 - 80' },
      { name: 'Brazilian', price: 'AED 100 - 150' },
    ],
  },
  {
    id: 'special-packages',
    title: 'Special Packages',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1738',
    subservices: [
      { name: 'Bridal Package', price: 'AED 2500 - 5000' },
      { name: 'Spa Day Package', price: 'AED 800 - 1500' },
      { name: 'Mother & Daughter Package', price: 'AED 600 - 1000' },
      { name: 'Makeover Package', price: 'AED 500 - 900' },
    ],
  },
];

const phoneNumbers = [
  { label: 'Mobile 1', number: '+971 52 370 6025', link: 'tel:+971523706025' },
  { label: 'Mobile 2', number: '+971 50 614 3199', link: 'tel:+971506143199' },
  { label: 'Tel 1', number: '+971 4 347 3880', link: 'tel:+97143473880' },
  { label: 'Tel 2', number: '+971 4 347 3001', link: 'tel:+97143473001' },
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
                  alt={service.title}
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
                  alt={selectedService.title}
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
                  'https://www.fresha.com/book-now/layali-al-zahra-ladies-saloon-ng425ap1/all-offer?share=true&pId=2674340',
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
    </div>
  );
}
