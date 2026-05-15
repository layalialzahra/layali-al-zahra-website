import React, { useState } from 'react';
import { Phone, MessageCircle, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

const servicesData = [
    {
      id: 'hair-cuts',
      title: 'Hair Cuts',
      image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
      subservices: [
        { name: 'Blunt Bob Hair Cut', price: 'AED 99.75' },
        { name: 'Advanced Hair Cut', price: 'AED 283.50' },
        { name: 'Hair Deep Layer Cut', price: 'AED 262.50' },
        { name: 'Hair Side Fringe Cut', price: 'AED 52.50' },
        { name: 'Hair Straight Cut', price: 'AED 68.25' },
        { name: 'Hair U Cut', price: 'AED 115.50' },
        { name: 'Hair Deep U Cut', price: 'AED 157.50' },
        { name: 'Hair Step Cut', price: 'AED 189' },
        { name: 'Hair V Cut', price: 'AED 157.50' },
        { name: 'Hair Butterfly Cut', price: 'AED 262.50' },
      ],
    },
    {
      id: 'hair-treatments',
      title: 'Hair Treatments',
      image: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
      subservices: [
        { name: 'Blow Dry – Short', price: 'AED 110.25' },
        { name: 'Blow Dry – Medium', price: 'AED 131.25' },
        { name: 'Blow Dry – Long', price: 'AED 150.15' },
        { name: 'Blow Dry – Very Long', price: 'AED 170.10' },
        { name: 'Blow Dry With Extension', price: 'AED 210' },
        { name: 'Blow Dry with Tong/Iron – Short', price: 'AED 147' },
        { name: 'Blow Dry with Tong/Iron – Medium', price: 'AED 168' },
        { name: 'Blow Dry with Tong/Iron – Long', price: 'AED 189' },
        { name: 'Blow Dry with Tong/Iron – Very Long', price: 'AED 210' },
        { name: 'Hair Wash – Short', price: 'AED 50.40' },
        { name: 'Hair Wash – Medium', price: 'AED 60.90' },
        { name: 'Hair Wash – Long', price: 'AED 70.35' },
        { name: 'Hair Spa – Short', price: 'AED 157.50' },
        { name: 'Hair Spa – Medium', price: 'AED 178.50' },
        { name: 'Hair Spa – Long', price: 'AED 199.50' },
        { name: 'Hair Spa – Very Long', price: 'AED 220.50' },
        { name: "L'Oreal Hair Spa – From", price: 'AED 200' },
        { name: "L'Oreal Absolut Hair Treatment – From", price: 'AED 150' },
        { name: 'Hair Protein Treatment – Short', price: 'AED 525' },
        { name: 'Hair Protein Treatment – Medium', price: 'AED 630' },
        { name: 'Hair Protein Treatment – Long', price: 'AED 735' },
        { name: 'Hair Protein Treatment – Very Long', price: 'AED 840' },
        { name: 'Hair Highlights – Short', price: 'AED 557.50' },
        { name: 'Hair Highlights – Medium', price: 'AED 656.25' },
        { name: 'Hair Highlights – Long', price: 'AED 745.50' },
        { name: 'Hair Highlights – Very Long', price: 'AED 840' },
        { name: 'Fiber Collagen Treatment – From', price: 'AED 157.50' },
        { name: 'BB Creme – Short', price: 'AED 472.50' },
        { name: 'BB Creme – Medium', price: 'AED 598.50' },
        { name: 'BB Creme – Long', price: 'AED 900.90' },
        { name: 'Botox – Short', price: 'AED 525' },
        { name: 'Botox – Medium', price: 'AED 700.35' },
        { name: 'Botox – Long', price: 'AED 900.90' },
        { name: 'Keratin Straightening – Short', price: 'AED 525' },
        { name: 'Keratin Straightening – Medium', price: 'AED 703.50' },
        { name: 'Keratin Straightening – Long', price: 'AED 1,050' },
        { name: 'Cream Conditioning Treatment', price: 'AED 105' },
        { name: 'Caviar Cream Massage', price: 'AED 126' },
        { name: 'Caviar Treatment With Massage (Luxury)', price: 'AED 262.50' },
        { name: 'Joico Treatment', price: 'AED 178.50' },
        { name: 'Fiber Plex / Olaplex – From', price: 'AED 210' },
        { name: 'Aloe Vera Treatment', price: 'AED 152.25' },
        { name: 'Iplex Treatment', price: 'AED 300.30' },
        { name: 'K-Water Treatment – From', price: 'AED 150.15' },
        { name: 'Up Style Hair Style', price: 'AED 367.50' },
        { name: 'Restyle Hair', price: 'AED 157.50' },
        { name: 'Braiding Per Line', price: 'AED 26.25' },
        { name: 'Braiding Full Head', price: 'AED 262.50' },
        { name: 'Upstyle Simple', price: 'AED 351.75' },
        { name: 'Glamorous', price: 'AED 425.25' },
        { name: 'Beach Waves', price: 'AED 210' },
        { name: 'Ponytail', price: 'AED 189' },
        { name: 'Coffee Dandruff Treatment', price: 'AED 210' },
      ],
    },
    {
      id: 'hair-extensions',
      title: 'Hair Extensions',
      image: 'https://images.unsplash.com/photo-1634449571017-5fecfd26ad76?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
      subservices: [
        { name: 'Hair Extension Clip', price: 'AED 1,575' },
        { name: 'Hair Extension Tape Per Packet With Fixing', price: 'AED 1,065.75' },
        { name: 'Hair Extension Stitching Per Piece', price: 'AED 120.75' },
        { name: 'Blow Dry Extension Per Piece', price: 'AED 52.50' },
        { name: 'Hair Extension Tape Removal', price: 'AED 10.50' },
        { name: 'Hair Extension Fixing', price: 'AED 15.75' },
        { name: 'Hair Extension Tape', price: 'AED 36.75' },
        { name: 'Extension Stitch Removal', price: 'AED 105' },
        { name: 'Hair Extension Wash', price: 'AED 52.50' },
      ],
    },
    {
      id: 'color-highlights',
      title: 'Color & Highlights',
      image: 'https://images.unsplash.com/photo-1707812343087-c9ff9e5abb43?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=774',
      subservices: [
        { name: 'Root Color Crown Area', price: 'AED 136.50' },
        { name: 'Root Color Crown Area Small', price: 'AED 94.50' },
        { name: 'Normal Roots Color', price: 'AED 190.05' },
        { name: 'Organic Roots Color', price: 'AED 268.80' },
        { name: 'Roots With Own Color', price: 'AED 137.55' },
        { name: 'Roots Bleach', price: 'AED 241.50' },
        { name: 'Normal Toner', price: 'AED 94.50' },
        { name: 'Organic Toner', price: 'AED 144.90' },
        { name: 'Toner for Extension', price: 'AED 94.50' },
        { name: 'Foil Each', price: 'AED 26.25' },
        { name: 'Normal Hair Color – Short – From', price: 'AED 390.60' },
        { name: 'Normal Hair Color – Medium – From', price: 'AED 400.05' },
        { name: 'Normal Hair Color – Long – From', price: 'AED 450.45' },
        { name: 'Normal Hair Color – Very Long – From', price: 'AED 500.85' },
        { name: 'Organic Hair Color – Short – From', price: 'AED 504' },
        { name: 'Organic Hair Color – Medium – From', price: 'AED 556.50' },
        { name: 'Organic Hair Color – Long – From', price: 'AED 600.60' },
        { name: 'Organic Hair Color – Very Long – From', price: 'AED 645.75' },
        { name: 'Full Head With Own Color', price: 'AED 241.50' },
        { name: 'Full Hair Bleach', price: 'AED 390.60' },
        { name: 'Crazy Colors', price: 'AED 300.30' },
        { name: 'Ombre Including Blowdry', price: 'AED 488.25' },
        { name: 'Balayage Including Blowdry – From', price: 'AED 582.75' },
      ],
    },
    {
      id: 'hand-foot-care',
      title: 'Hand & Foot Care',
      image: 'https://images.unsplash.com/photo-1633955726992-2b7c0d2d2a69?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=928',
      subservices: [
        { name: 'Classic Manicure', price: 'AED 70.35' },
        { name: 'Classic Pedicure', price: 'AED 90.30' },
        { name: 'French Manicure', price: 'AED 78.75' },
        { name: 'French Pedicure', price: 'AED 95.55' },
        { name: 'Paraffin Manicure', price: 'AED 128.10' },
        { name: 'Paraffin Pedicure', price: 'AED 179.55' },
        { name: 'Paraffin Pedicure Combo', price: 'AED 94.50' },
        { name: 'Zahra Signature Manicure + Pedicure', price: 'AED 150.15' },
        { name: 'Hand Spa Manicure', price: 'AED 180.60' },
        { name: 'Hand Spa Pedicure', price: 'AED 180.60' },
        { name: 'Paraffin Only', price: 'AED 84' },
        { name: 'Callus Treatment', price: 'AED 52.50' },
        { name: 'Scrub', price: 'AED 52.50' },
        { name: 'Foot Pack', price: 'AED 36.75' },
        { name: 'Foot Scrub', price: 'AED 36.75' },
        { name: 'Repolish', price: 'AED 26.25' },
        { name: 'Ingrown', price: 'AED 21' },
      ],
    },
    {
      id: 'gelish',
      title: 'Gelish',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
      subservices: [
        { name: 'Gelish Manicure', price: 'AED 137.55' },
        { name: 'Gelish Pedicure', price: 'AED 157.50' },
        { name: 'Gelish French Manicure', price: 'AED 147' },
        { name: 'Gelish French Pedicure', price: 'AED 168' },
        { name: 'Gelish Application', price: 'AED 126' },
        { name: 'Luxio Base & Top Manicure', price: 'AED 190.05' },
        { name: 'Luxio Base & Top Pedicure', price: 'AED 190.05' },
        { name: 'Ombre/Chrome', price: 'AED 42' },
        { name: 'Cat Eye', price: 'AED 52.50' },
        { name: 'Gelish Removal', price: 'AED 42.50' },
      ],
    },
    {
      id: 'gel-nails',
      title: 'Gel Nails',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
      subservices: [
        { name: 'Gel Full Set Clear', price: 'AED 250.95' },
        { name: 'Gel Refill Clear', price: 'AED 148.05' },
        { name: 'Gel On Natural Nails Clear', price: 'AED 170.10' },
        { name: 'Gel Full Set French', price: 'AED 305.55' },
        { name: 'Gel Refill French', price: 'AED 179.55' },
        { name: 'Gel On Natural Nails French', price: 'AED 194.25' },
        { name: 'Full Set Color Gel', price: 'AED 346.50' },
        { name: 'Refill Color Gel', price: 'AED 231' },
        { name: 'Gel on Natural Nails Color', price: 'AED 252' },
        { name: 'Gel On Natural Nails With Base Color', price: 'AED 241.50' },
        { name: 'Biab Gel On Nails', price: 'AED 242.55' },
        { name: 'Biab Refill', price: 'AED 221.55' },
        { name: 'Hard Gel (Manicure)', price: 'AED 221.55' },
        { name: 'Hard Gel (Pedicure)', price: 'AED 221.55' },
        { name: 'Overlay Gel', price: 'AED 131.25' },
        { name: 'Fake Nails', price: 'AED 147' },
        { name: 'Buff/File/Polish/Shine', price: 'AED 73.50' },
        { name: 'Gel Removal', price: 'AED 65.10' },
      ],
    },
    {
      id: 'acrylic-nails',
      title: 'Acrylic & Nail Services',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
      subservices: [
        { name: 'Acrylic Full Set Clear', price: 'AED 210' },
        { name: 'Acrylic Refill/Natural Nails Clear', price: 'AED 294' },
        { name: 'Acrylic Full Set French', price: 'AED 420' },
        { name: 'Acrylic Refill/Natural Nails French', price: 'AED 304.50' },
        { name: 'Acrylic Full Set Color', price: 'AED 385.35' },
        { name: 'Acrylic Refill/Natural Nails Color', price: 'AED 347.55' },
        { name: 'Acrylic One Nail Repair', price: 'AED 38.85' },
        { name: 'Acrylic Removal', price: 'AED 75.60' },
        { name: 'Acrylic Toe Nail Repair', price: 'AED 42' },
        { name: 'Russian Manicure', price: 'AED 157.50' },
        { name: 'Russian Manicure + Builder Gel / BIAB', price: 'AED 262.50' },
        { name: 'Russian Manicure With Extensions / Nail Art', price: 'AED 294' },
        { name: 'Soft Gel Full Set Clear', price: 'AED 262.50' },
        { name: 'Soft Gel Full Set Color', price: 'AED 309.75' },
        { name: 'Nail Extensions Removal', price: 'AED 63' },
        { name: 'Bio Sculpture Color Refill', price: 'AED 189' },
        { name: 'Bio Gel Removal', price: 'AED 48.50' },
        { name: 'Chrome/Magnet Add On', price: 'AED 30' },
        { name: 'Ombre/French Add On', price: 'AED 31.50' },
        { name: 'Nail Art Per Nail – From', price: 'AED 10.50' },
        { name: 'File', price: 'AED 15.75' },
        { name: 'Cut & File', price: 'AED 26.25' },
        { name: 'File & Polish', price: 'AED 34.65' },
        { name: 'Hot Stone Add On', price: 'AED 31.50' },
        { name: 'French Polish', price: 'AED 44.10' },
        { name: 'Nail Repair With Refill', price: 'AED 19.95' },
        { name: 'Nail Repair Without Refill', price: 'AED 24.15' },
        { name: 'Toe Nail Repair', price: 'AED 29.40' },
      ],
    },
    {
      id: 'eyelash-brow-threading',
      title: 'Eyelash, Brow & Threading',
      image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
      subservices: [
        { name: 'Full Set Eyelash Extensions', price: 'AED 367.50' },
        { name: 'Refill Eyelash Extensions', price: 'AED 262.50' },
        { name: 'Full Set 3D Eyelash Extensions', price: 'AED 593.25' },
        { name: 'Refill Set 3D Eyelash Extensions', price: 'AED 409.50' },
        { name: 'Eyelash Extension Temporary', price: 'AED 105' },
        { name: 'Eyelash Extension Temporary (Own)', price: 'AED 52.50' },
        { name: 'Eyelash Lifting', price: 'AED 275.10' },
        { name: 'Eyelash Removal', price: 'AED 105' },
        { name: 'Eyebrow Lamination', price: 'AED 275.10' },
        { name: 'Eyebrow Tint', price: 'AED 31.50' },
        { name: 'Eyelash Tint', price: 'AED 42' },
        { name: 'Eyebrow Threading', price: 'AED 21' },
        { name: 'Eyebrow & Upper Lip Threading', price: 'AED 47.25' },
        { name: 'Eyebrow, Upper Lip & Chin Threading', price: 'AED 63' },
        { name: 'Full Face Threading', price: 'AED 99.75' },
        { name: 'Full Face Without Eyebrow', price: 'AED 73.50' },
        { name: 'Upper Lip Threading', price: 'AED 10.50' },
        { name: 'Chin Threading', price: 'AED 19.95' },
        { name: 'Forehead Threading', price: 'AED 15.75' },
        { name: 'Side Threading', price: 'AED 19.95' },
        { name: 'Nose Threading', price: 'AED 10.50' },
      ],
    },
    {
      id: 'hair-removal',
      title: 'Hair Removal',
      image: 'https://cdn.pixabay.com/photo/2024/06/08/18/47/woman-8817391_1280.jpg',
      subservices: [
        { name: 'Halawa – Underarms', price: 'AED 42' },
        { name: 'Halawa – Arm', price: 'AED 94.50' },
        { name: 'Halawa – Half Leg', price: 'AED 73.50' },
        { name: 'Halawa – Full Leg', price: 'AED 105' },
        { name: 'Sugar Wax – Half Arm', price: 'AED 43' },
        { name: 'Fruit Wax – Half Arm', price: 'AED 52.50' },
        { name: 'Sugar Wax – Full Arm', price: 'AED 47.25' },
        { name: 'Fruit Wax – Full Arm', price: 'AED 57.75' },
        { name: 'Sugar Wax – Underarm', price: 'AED 31.75' },
        { name: 'Fruit Wax – Underarm', price: 'AED 42' },
        { name: 'Sugar Wax – Half Leg', price: 'AED 57.75' },
        { name: 'Fruit Wax – Half Leg', price: 'AED 68.25' },
        { name: 'Sugar Wax – Full Leg', price: 'AED 78.75' },
        { name: 'Fruit Wax – Full Leg', price: 'AED 89.25' },
        { name: 'Sugar Wax – Bikini Line', price: 'AED 42' },
        { name: 'Fruit Wax – Bikini Line', price: 'AED 52' },
        { name: 'Sugar Wax – Half Bikini', price: 'AED 52.50' },
        { name: 'Fruit Wax – Half Bikini', price: 'AED 68.25' },
        { name: 'Sugar Wax – Full Bikini', price: 'AED 89.25' },
        { name: 'Fruit Wax – Full Bikini', price: 'AED 99.75' },
        { name: 'Sugar Wax – Full Body', price: 'AED 320.25' },
        { name: 'Fruit Wax – Full Body', price: 'AED 420' },
        { name: 'Lycon Wax – Sides Face', price: 'AED 45.15' },
        { name: 'Lycon Wax – Back', price: 'AED 78.75' },
        { name: 'Lycon Wax – Bum', price: 'AED 63' },
        { name: 'Lycon Wax – Stomach', price: 'AED 63' },
        { name: 'Full Brazilian (Strip Wax)', price: 'AED 189' },
        { name: 'Full Face Wax', price: 'AED 126' },
        { name: 'Full Face Wax Fruit', price: 'AED 136.50' },
        { name: 'Full Body (Strip Wax)', price: 'AED 708.75' },
        { name: 'Back Wax (Strip Wax)', price: 'AED 162.75' },
        { name: 'Full Leg (Strip Wax)', price: 'AED 168' },
        { name: 'Underarm (Hard Wax)', price: 'AED 57.75' },
        { name: 'Eyebrow Bleach', price: 'AED 42' },
        { name: 'Full Face Bleach', price: 'AED 90.30' },
        { name: 'Upper Lip Bleach', price: 'AED 21' },
        { name: 'Half Arm Bleach', price: 'AED 30.45' },
        { name: 'Full Leg Bleach', price: 'AED 90.30' },
        { name: 'Full Body Bleach', price: 'AED 320.25' },
      ],
    },
    {
      id: 'facial-skin',
      title: 'Facial & Skin Treatments',
      image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
      subservices: [
        { name: 'Mini Facial', price: 'AED 100.80' },
        { name: 'Basic Facial', price: 'AED 210' },
        { name: 'Face Clean-Up', price: 'AED 157.50' },
        { name: 'Glowing Facial', price: 'AED 262.50' },
        { name: 'Vitamin C Facial', price: 'AED 315' },
        { name: 'Vitamin C Mask', price: 'AED 100.80' },
        { name: 'Face Mask', price: 'AED 157.50' },
        { name: 'Ayurvedic Facial', price: 'AED 367.50' },
        { name: 'Aquatherm Hydra Facial', price: 'AED 367.50' },
        { name: 'Power C Hydra Facial', price: 'AED 472.50' },
        { name: 'Hyaluronic Hydra Facial', price: 'AED 504' },
        { name: 'Corrective Hydra Age Lifting Facial', price: 'AED 525' },
        { name: 'Buccal Face Lifting Massage', price: 'AED 399' },
        { name: 'Dermapen With Skin Booster', price: 'AED 525' },
        { name: 'Skyendor Age Lift Facial', price: 'AED 493.50' },
        { name: 'Skyendor Corrective Facial', price: 'AED 472.50' },
        { name: 'Skyendor Vitamin C Facial', price: 'AED 451.50' },
        { name: 'Skyendor Under Eye Treatment Facial', price: 'AED 430.50' },
        { name: 'Skyendor Antiaging Facial', price: 'AED 430.50' },
        { name: 'Skyendor Power Hyaluronic', price: 'AED 399' },
        { name: 'Skeyndor Aquatherm Facial', price: 'AED 200.55' },
        { name: 'Skeyndor Power C Facial', price: 'AED 399' },
        { name: 'Bioesthe Ovalift – Lifting Treatment', price: 'AED 347.55' },
        { name: 'Bioesthe Restructa – Anti Age Treatment', price: 'AED 329.70' },
        { name: 'Thalion Hydra Mineral Facial', price: 'AED 369.60' },
        { name: 'Thalion Algo Calm', price: 'AED 390' },
        { name: 'Thalion Algo White', price: 'AED 525' },
      ],
    },
    {
      id: 'massage',
      title: 'Massage Services',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
      subservices: [
        { name: 'Head Massage 30 Min', price: 'AED 78.75' },
        { name: 'Head Oil Massage (15 Min)', price: 'AED 36.75' },
        { name: 'Head Oil Massage (30 Min)', price: 'AED 90.30' },
        { name: 'Head Oil Massage With Wash (30 Min)', price: 'AED 120.75' },
        { name: 'Head & Back Massage (1 Hour)', price: 'AED 140.70' },
        { name: 'Back Massage (15 Min)', price: 'AED 42' },
        { name: 'Back Massage (30 Min)', price: 'AED 75.60' },
        { name: 'Back Massage (45 Min)', price: 'AED 105' },
        { name: 'Back Massage (1 Hour)', price: 'AED 157.50' },
        { name: 'Foot Massage (15 Min)', price: 'AED 36.75' },
        { name: 'Foot Massage (30 Min)', price: 'AED 78.75' },
        { name: 'Foot Massage (45 Min)', price: 'AED 110.25' },
        { name: 'Foot Massage (1 Hour)', price: 'AED 157.50' },
        { name: 'Foot Massage With Hot Stone (40 Min)', price: 'AED 128.10' },
        { name: 'Hand Massage (30 Min)', price: 'AED 64.05' },
        { name: 'Leg Massage (30 Min)', price: 'AED 90.30' },
        { name: 'Relaxing Body Massage (1 Hour)', price: 'AED 200' },
        { name: 'Relaxing Body Massage (1 Hour 30 Min)', price: 'AED 300' },
        { name: 'Full Body Deep Tissue Massage (1:15 Min)', price: 'AED 299.25' },
        { name: 'Hot Stone Body Massage (1:15 Min)', price: 'AED 295.05' },
        { name: 'Ayurvedic Full Body Massage', price: 'AED 367.50' },
        { name: 'Lymphatic Drainage Massage (1:15 Min)', price: 'AED 347.55' },
        { name: 'Balinese Massage (2 Hours)', price: 'AED 420' },
        { name: 'Reflexology (1 Hour)', price: 'AED 200.55' },
        { name: 'Espresso Latte Sugar Scrub With Massage (1 Hour)', price: 'AED 350.70' },
        { name: 'Madero/Slimming Massage (1:30 Min) (5+1)', price: 'AED 350' },
      ],
    },
    {
      id: 'makeup',
      title: 'Makeup Services',
      image: 'https://images.unsplash.com/photo-1614006659838-d4ca51cbd117?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=2670',
      subservices: [
        { name: 'Day Makeup – From', price: 'AED 250' },
        { name: 'Simple Makeup', price: 'AED 367.50' },
        { name: 'Party Makeup', price: 'AED 350.70' },
        { name: 'Evening Make Up', price: 'AED 472.50' },
        { name: 'Bridal Makeup – From', price: 'AED 600' },
        { name: 'Eye Makeup Simple', price: 'AED 150.15' },
        { name: 'Eye Makeup Luxury', price: 'AED 250.95' },
        { name: 'Eyebrow Racer', price: 'AED 31.50' },
        { name: 'Saree Drape – From', price: 'AED 150.15' },
        { name: 'Party Makeup Add On – From', price: 'AED 52.50' },
        { name: 'Day Makeup Add On – From', price: 'AED 52.50' },
      ],
    },
    {
      id: 'henna-mehandi',
      title: 'Henna & Mehandi',
      image: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
      subservices: [
        { name: 'Henna Tattoo – One Hand, One Side', price: 'AED 52.50' },
        { name: 'Henna Tattoo – One Hand, Both Sides', price: 'AED 105' },
        { name: 'Henna Tattoo – Two Hands, One Side', price: 'AED 105' },
        { name: 'Henna Tattoo – Two Hands, Both Sides', price: 'AED 210' },
        { name: 'Henna For Eid – One Hand, One Side', price: 'AED 78.75' },
        { name: 'Henna For Eid – One Hand, Both Sides', price: 'AED 157.50' },
        { name: 'Henna For Eid – Two Hands, One Side', price: 'AED 157.50' },
        { name: 'Henna For Eid – Two Hands, Both Sides', price: 'AED 315' },
        { name: 'Henna For Eid – Kid, One Hand, One Side', price: 'AED 31.50' },
        { name: 'Henna For Hair (Own Product, Without Wash)', price: 'AED 107.10' },
        { name: 'Henna For Hair (Without Wash)', price: 'AED 128.10' },
        { name: 'Henna For Hair (With Wash)', price: 'AED 201.60' },
      ],
    },
    {
      id: 'little-ladies',
      title: 'Little Ladies (Under 10)',
      image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
      subservices: [
        { name: 'Hair Cut', price: 'AED 50.40' },
        { name: 'Wash & Blowdry', price: 'AED 78.75' },
        { name: 'Shampoo Only', price: 'AED 40.95' },
        { name: 'Hair Styling', price: 'AED 100.80' },
        { name: 'Hair Spa – From', price: 'AED 150' },
        { name: 'Kids Hair Braiding', price: 'AED 105' },
        { name: 'Mini Manicure', price: 'AED 49.35' },
        { name: 'Mini Pedicure', price: 'AED 60.90' },
        { name: 'Repolish', price: 'AED 15.75' },
        { name: 'Nail Art', price: 'AED 49.35' },
        { name: 'Glam Facial', price: 'AED 100.80' },
        { name: 'Day Makeup', price: 'AED 100.80' },
        { name: 'Party Day Makeup', price: 'AED 100.80' },
        { name: 'Kids Eye Makeup', price: 'AED 105' },
        { name: 'Body Massage', price: 'AED 100.80' },
        { name: 'Pampering Treatment', price: 'AED 300.30' },
      ],
    }
  ];
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
    </div>
  );
}
