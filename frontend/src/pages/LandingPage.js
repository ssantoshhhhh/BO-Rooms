import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, DollarSign } from 'lucide-react';
import axios from 'axios';
import RoomCard from '../components/RoomCard';
import Navbar from '../components/Navbar';

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <Navbar />
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-8 text-center">
        {/* <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Find Your Next Home in Bhimavaram</h2> */}
        <p className="text-lg md:text-xl text-gray-600 mb-6">Browse the best properties for sale and rent, updated daily.</p>
        <button
          className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-lg text-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200"
          onClick={() => navigate('/category/For%20Rent')}
        >
          Explore Rooms
        </button>
      </div>
      {/* Categories Section */}
      <div className="mb-16">
        <div className="max-w-4xl mx-auto bg-white/80 rounded-3xl shadow-xl border border-gray-100 px-6 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:scale-105"
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
      </div>
      {/* New Updates Section */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-red-200 via-pink-200 to-blue-200" />
          <h2 className="text-2xl md:text-3xl font-bold text-pink-600 text-center whitespace-nowrap">New Updates</h2>
          <div className="flex-1 h-px bg-gradient-to-l from-red-200 via-pink-200 to-blue-200" />
        </div>
        <div className="bg-white/80 rounded-3xl shadow-xl border border-gray-100 px-6 py-10">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : latestRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestRooms.map((room) => (
                <RoomCard key={room._id} room={room} minimal />
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