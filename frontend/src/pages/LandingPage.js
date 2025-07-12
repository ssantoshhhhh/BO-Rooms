import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, DollarSign, Building2 } from 'lucide-react';
import axios from 'axios';
import RoomCard from '../components/RoomCard';

const categories = [
  { 
    name: 'For Sale', 
    icon: <DollarSign className="w-8 h-8 text-green-500" />, 
    description: 'Properties available for purchase',
    type: 'sale'
  },
  { 
    name: 'For Rent', 
    icon: <Home className="w-8 h-8 text-blue-500" />, 
    description: 'Properties available for rent',
    type: 'rent'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [latestRooms, setLatestRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestRooms = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/rooms');
        // Get the latest 6 rooms
        const latest = response.data.slice(0, 6);
        setLatestRooms(latest);
      } catch (error) {
        console.error('Error fetching latest rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestRooms();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="w-full bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <Building2 className="w-8 h-8 text-red-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Bhimavaram Rooms</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Categories Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Find Your Perfect Property</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100"
                onClick={() => navigate(`/category/${encodeURIComponent(cat.name)}`)}
              >
                <div className="p-8 text-center">
                  <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {cat.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{cat.name}</h3>
                  <p className="text-gray-600">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Updates Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">New Updates</h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : latestRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestRooms.map((room) => (
                <RoomCard key={room._id} room={room} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No rooms available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 