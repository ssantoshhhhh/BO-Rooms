import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, BedDouble, Building2, Building, Landmark, Layers3, Crown, Warehouse, Hotel, Flower2, Users, Users2 } from 'lucide-react';

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

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Banner */}
      <div className="w-full bg-red-600 py-8 flex flex-col items-center shadow-md">
        <img src="./bo.jpeg" alt="Company Banner" className="h-20 mb-2" />
        <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow">Bhimavaram Rooms</h1>
      </div>
      {/* Categories Grid */}
      <div className="mt-10 w-full max-w-5xl px-4">
        <h2 className="text-2xl font-bold text-red-600 mb-6 text-center">Categories</h2>
        <div className="grid grid-cols-3 gap-12 justify-items-center">
          {categories.slice(0, 9).map((cat) => (
            <div
              key={cat.name}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => navigate(`/category/${encodeURIComponent(cat.name)}`)}
            >
              <div
                className="bg-white rounded-full shadow-md flex items-center justify-center w-20 h-20 mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:ring-4 group-hover:ring-red-200 group-hover:shadow-xl"
                style={{ overflow: 'hidden' }}
              >
                {cat.icon}
              </div>
              <span className="text-center text-base font-medium text-gray-800 transition-colors duration-300 group-hover:text-red-600">{cat.name}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <button
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-lg font-semibold"
            onClick={() => navigate('/room-categories')}
          >
            Know About These !
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 