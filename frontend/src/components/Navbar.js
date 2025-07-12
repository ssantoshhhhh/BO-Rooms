import React from 'react';
import { Building2 } from 'lucide-react';

const Navbar = () => (
  <div className="w-full bg-white shadow-sm border-b border-gray-100">
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-center">
        <Building2 className="w-8 h-8 text-red-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">Bhimavaram Rooms</h1>
      </div>
    </div>
  </div>
);

export default Navbar; 