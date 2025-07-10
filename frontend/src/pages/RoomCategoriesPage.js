import React from 'react';
import { Home, BedDouble, Building2, Layers3, Crown, Warehouse, Hotel, Flower2, Users2 } from 'lucide-react';

const categories = [
  { name: 'Studio Apartment', icon: <Home className="w-8 h-8 text-red-500" />, description: 'Single room with kitchen, bedroom, and living area combined.' },
  { name: '1 BHK', icon: <BedDouble className="w-8 h-8 text-yellow-500" />, description: '1 Bedroom + 1 Hall + 1 Kitchen.' },
  { name: '2 BHK', icon: <BedDouble className="w-8 h-8 text-green-500" />, description: '2 Bedrooms + 1 Hall + 1 Kitchen.' },
  { name: '3 BHK', icon: <BedDouble className="w-8 h-8 text-blue-500" />, description: '3 Bedrooms + 1 Hall + 1 Kitchen.' },
  { name: 'Duplex Apartment', icon: <Layers3 className="w-8 h-8 text-pink-500" />, description: 'Two floors connected by an internal staircase, in a single apartment.' },
  { name: 'Triplex Apartment', icon: <Layers3 className="w-8 h-8 text-purple-500" />, description: 'Similar to duplex but with three levels.' },
  { name: 'Penthouse', icon: <Crown className="w-8 h-8 text-orange-500" />, description: 'Luxurious apartment on the top floor, usually with a terrace and great views.' },
  { name: 'Loft Apartment', icon: <Warehouse className="w-8 h-8 text-teal-500" />, description: 'Open layout with high ceilings; often in converted warehouses.' },
  { name: 'Serviced Apartment', icon: <Hotel className="w-8 h-8 text-indigo-500" />, description: 'Fully furnished, hotel-like apartment with services like housekeeping.' },
  { name: 'Garden Apartment', icon: <Flower2 className="w-8 h-8 text-lime-500" />, description: 'Located on the ground floor with direct access to a garden or backyard.' },
  { name: 'Condominium (Condo)', icon: <Building2 className="w-8 h-8 text-amber-500" />, description: 'Individually owned units in a building with shared facilities (like a gym or pool).' },
  { name: 'Co-living Space', icon: <Users2 className="w-8 h-8 text-cyan-500" />, description: 'Shared living space (like hostels or PGs) for students or young professionals.' }
];

const colors = [
  'bg-red-100', 'bg-yellow-100', 'bg-green-100', 'bg-blue-100',
  'bg-pink-100', 'bg-purple-100', 'bg-orange-100', 'bg-teal-100',
  'bg-indigo-100', 'bg-lime-100', 'bg-amber-100', 'bg-cyan-100'
];

const RoomCategoriesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex flex-col items-center p-6">
      <h1 className="text-4xl font-extrabold text-red-600 mb-10 text-center drop-shadow">Room Categories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {categories.map((cat, idx) => (
          <div
            key={cat.name}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition group border border-gray-100"
          >
            <div className={`w-16 h-16 ${colors[idx % colors.length]} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              {cat.icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center group-hover:text-red-600 transition-colors">{cat.name}</h2>
            <p className="text-gray-600 text-base text-center">{cat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomCategoriesPage; 