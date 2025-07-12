import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import RoomCard from '../components/RoomCard';
import MapPreview from '../components/MapPreview';
import Navbar from '../components/Navbar';

// Compact Similar Room Card Component
const SimilarRoomCard = ({ room }) => {
  const navigate = useNavigate();
  
  return (
    <div
      className="group bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-0 border border-red-100 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-105 hover:ring-2 hover:ring-pink-200 h-full flex flex-col"
      onClick={() => navigate(`/room/${room._id}`)}
    >
      {/* Image */}
      <div className="relative w-full h-32 bg-red-50 flex items-center justify-center overflow-hidden flex-shrink-0">
        {room.images && room.images[0] && (() => {
          const filename = room.images[0].split('/').pop().split('\\').pop();
          const imageUrl = `http://localhost:8000/uploads/${filename}`;
          return (
            <div className="relative w-full h-32">
              <img
                src={imageUrl}
                alt={room.title}
                className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          );
        })()}
        {/* Rented badge */}
        {room.status === 'rented' && (
          <span className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
            Rented
          </span>
        )}
      </div>
      {/* Info section */}
      <div className="p-3 flex-1 flex flex-col">
        <h4 className="text-sm font-bold text-gray-900 truncate mb-1" title={room.title}>{room.title}</h4>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-red-600 font-bold">₹{room.propertyType === 'sale' ? room.price : room.rent}</span>
          <span className="text-xs text-gray-600">{room.area}</span>
        </div>
        <div className="flex items-center gap-1 mt-auto">
          <a
            href={`tel:${room.ownerPhone}`}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow hover:from-red-600 hover:to-pink-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 active:scale-95 text-center"
            onClick={e => e.stopPropagation()}
          >
            Call
          </a>
          {room.ownerWhatsapp && (
            <a
              href={`https://wa.me/${room.ownerWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow hover:from-green-600 hover:to-emerald-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-300 active:scale-95 text-center"
              onClick={e => e.stopPropagation()}
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const RoomDetailsPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [similarRooms, setSimilarRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const openMapsApp = (e) => {
    e.stopPropagation();
    if (!room?.locationCoordinates || !room.locationCoordinates.latitude || !room.locationCoordinates.longitude) {
      return;
    }

    const { latitude, longitude } = room.locationCoordinates;
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Detect platform and open appropriate maps app
    if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
      // iOS - try Apple Maps first, fallback to Google Maps
      window.open(`https://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`, '_blank');
    } else if (userAgent.includes('android')) {
      // Android - try Google Maps
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
    } else {
      // Desktop - default to Google Maps
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
    }
  };

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:8000/api/rooms/${roomId}`);
        setRoom(res.data);
        // Fetch similar rooms by category (excluding this room)
        const simRes = await axios.get('http://localhost:8000/api/rooms', {
          params: { category: res.data.category }
        });
        setSimilarRooms(simRes.data.filter(r => r._id !== roomId).slice(0, 4));
      } catch (err) {
        setRoom(null);
      }
      setLoading(false);
    };
    fetchRoom();
  }, [roomId]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading room details...</p>
      </div>
    </div>
  );
  
  if (!room) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Room not found</h3>
        <p className="text-gray-600 mb-4">The room you're looking for doesn't exist.</p>
        <button 
          onClick={() => navigate(-1)}
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
      <Navbar />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            {/* Category Badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Category:</span>
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                {room.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Room Card */}
        <div className="mb-12">
          <RoomCard room={room} onMarkRented={() => {}} />
        </div>

        {/* Location Map Section */}
        {room.locationCoordinates && room.locationCoordinates.latitude && room.locationCoordinates.longitude && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Location</h2>
              <button
                onClick={openMapsApp}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a4 4 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414-1.414z" />
                </svg>
                Get Location
              </button>
            </div>
            <MapPreview 
              latitude={room.locationCoordinates.latitude}
              longitude={room.locationCoordinates.longitude}
              location={room.location}
            />
          </div>
        )}

        {/* Similar Rooms Section */}
        {similarRooms.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Similar Rooms</h2>
              <span className="text-sm text-gray-600">{similarRooms.length} rooms found</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {similarRooms.map(r => (
                <div key={r._id} className="h-full">
                  <SimilarRoomCard room={r} />
                </div>
              ))}
            </div>
            
            {/* View All Rooms Button */}
            <div className="text-center">
              <button
                onClick={() => navigate(`/category/${encodeURIComponent(room.category)}`)}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-300 shadow-lg"
              >
                View All {room.category} Rooms
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Discover more {room.category.toLowerCase()} options
              </p>
            </div>
          </div>
        )}

        {/* No Similar Rooms State */}
        {similarRooms.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No similar rooms found</h3>
            <p className="text-gray-600 mb-6">Check out other categories for more options.</p>
            <button
              onClick={() => navigate(`/category/${encodeURIComponent(room.category)}`)}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-all"
            >
              Browse {room.category} Category
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetailsPage; 