import React from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RoomCard = ({ room, onMarkRented, relatedRooms }) => {
  const navigate = useNavigate();
  const handleMarkRented = async (e) => {
    e.stopPropagation();
    try {
      await axios.patch(`http://localhost:8000/api/rooms/${room._id}/rented`);
      if (onMarkRented) onMarkRented(room._id);
      toast.success('Room marked as rented successfully!');
    } catch (err) {
      console.error('Error marking room as rented:', err);
      toast.error('Failed to mark room as rented');
    }
  };

  return (
    <div
      className="group relative bg-white/80 backdrop-blur-md rounded-3xl p-0 mb-8 border-2 border-transparent hover:border-gradient-to-r hover:from-red-400 hover:to-pink-400 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-[1.03] hover:ring-2 hover:ring-pink-200 h-full flex flex-col"
      style={{ minHeight: 380, boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10), 0 1.5px 6px 0 rgba(255,0,80,0.08)' }}
      onClick={() => navigate(`/room/${room._id}`)}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{background: 'radial-gradient(circle at 80% 20%, #ffe4e6 0%, transparent 70%), radial-gradient(circle at 20% 80%, #f0fdfa 0%, transparent 70%)'}} />
      {/* Status badge */}
      {(room.status === 'rented' || room.status === 'sold') && (
        <span className="absolute top-4 right-4 z-20 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-4 py-1 rounded-full font-bold shadow-lg tracking-wide animate-bounce backdrop-blur-md border border-white/30" style={{boxShadow:'0 0 16px 2px #f472b6'}}>
          {room.status === 'rented' ? 'Rented' : 'Sold'}
        </span>
      )}
      {/* Swiper image carousel with animated overlay */}
      <div className="relative w-full h-56 bg-red-50 flex items-center justify-center overflow-hidden rounded-t-3xl flex-shrink-0">
        {room.images && room.images.length > 0 && (
          <Swiper spaceBetween={10} slidesPerView={1} className="w-full h-full">
            {room.images.map((img, idx) => {
              const filename = img.split('/').pop().split('\\').pop();
              const imageUrl = `http://localhost:8000/uploads/${filename}`;
              return (
                <SwiperSlide key={idx}>
                  <div className="relative w-full h-56">
                  <img
                    src={imageUrl}
                    alt="Room"
                      className="w-full h-56 object-cover rounded-b-none rounded-t-3xl bg-gray-200 transition-transform duration-500 group-hover:scale-110"
                  />
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-3xl transition-all duration-500 group-hover:from-black/60" />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
        {/* Property Type badge */}
        <span className="absolute left-4 top-4 z-20 bg-white/60 text-red-600 text-xs px-3 py-1 rounded-full font-semibold shadow backdrop-blur-md border border-white/30 flex items-center gap-1">
          <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 7V4a2 2 0 012-2h3m6 0h3a2 2 0 012 2v3m0 6v3a2 2 0 01-2 2h-3m-6 0H6a2 2 0 01-2-2v-3" /></svg>
          {room.propertyType === 'sale' ? 'Sale' : 'Rent'}
        </span>
        {/* Category badge */}
        {room.flatType && (
          <span className="absolute left-4 top-12 z-20 bg-white/60 text-blue-600 text-xs px-3 py-1 rounded-full font-semibold shadow backdrop-blur-md border border-white/30 flex items-center gap-1">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 7V4a2 2 0 012-2h3m6 0h3a2 2 0 012 2v3m0 6v3a2 2 0 01-2 2h-3m-6 0H6a2 2 0 01-2-2v-3" /></svg>
            {room.flatType}
          </span>
        )}
      </div>
      {/* Info section with glassmorphism */}
      <div className="relative flex flex-col gap-3 px-6 py-5 z-10 bg-white/70 backdrop-blur-md rounded-b-3xl flex-1 flex flex-col">
        <h3 className="text-2xl font-extrabold text-gray-900 mb-1 truncate tracking-tight leading-tight" title={room.title} style={{letterSpacing: '-0.01em'}}>{room.title}</h3>
        {/* Description */}
        {room.description && (
          <div className="text-sm text-gray-700 mb-1 line-clamp-3">{room.description}</div>
        )}
        <div className="flex flex-wrap gap-2 items-center mb-1">
          <span className="bg-gradient-to-r from-pink-100 to-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
            <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
            ₹{room.propertyType === 'sale' ? room.price : room.rent} {room.propertyType === 'sale' ? '' : '/ month'}
          </span>
          <span className="bg-white/80 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 12.414a4 4 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414-1.414z" /></svg>
            {room.area}
          </span>
          {room.location && room.locationCoordinates && room.locationCoordinates.latitude && room.locationCoordinates.longitude && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${room.locationCoordinates.latitude},${room.locationCoordinates.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/80 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 12.414a4 4 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414-1.414z" /></svg>
              Get Location
            </a>
          )}
          <span className="bg-white/80 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 7v4a1 1 0 001 1h3v2a1 1 0 001 1h4a1 1 0 001-1v-2h3a1 1 0 001-1V7a1 1 0 00-1-1h-3V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2H4a1 1 0 00-1 1z" /></svg>
            {room.category}
          </span>
          {room.flatType && (
            <span className="bg-white/80 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 7V4a2 2 0 012-2h3m6 0h3a2 2 0 012 2v3m0 6v3a2 2 0 01-2 2h-3m-6 0H6a2 2 0 01-2-2v-3" /></svg>
              {room.flatType}
            </span>
          )}
          {room.suitableFor && (
            <span className="bg-white/80 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>
              Suitable for {room.suitableFor} people
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <a
            href={`tel:${room.ownerPhone}`}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 active:scale-95"
            onClick={e => e.stopPropagation()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.515l.3 1.2a2 2 0 01-.45 1.95l-.7.7a16.001 16.001 0 006.36 6.36l.7-.7a2 2 0 011.95-.45l1.2.3A2 2 0 0121 18.72V21a2 2 0 01-2 2h-1C9.163 23 1 14.837 1 5V4a2 2 0 012-2z" /></svg>
            Call
          </a>
          {room.ownerWhatsapp && (
            <a
              href={`https://wa.me/${room.ownerWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-300 active:scale-95"
              onClick={e => e.stopPropagation()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A12.07 12.07 0 0012 0C5.37 0 0 5.37 0 12a11.93 11.93 0 001.64 6.06L0 24l6.18-1.62A12.07 12.07 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22c-1.61 0-3.18-.31-4.65-.92l-.33-.14-3.67.96.98-3.58-.15-.34A9.94 9.94 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.34-.26.27-1 1-.97 2.43.03 1.43 1.04 2.81 1.19 3 .15.19 2.05 3.13 5.01 4.27.7.3 1.25.48 1.68.61.71.23 1.36.2 1.87.12.57-.09 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z" /></svg>
              WhatsApp
          </a>
          )}
          {room.locationCoordinates && room.locationCoordinates.latitude && room.locationCoordinates.longitude && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${room.locationCoordinates.latitude},${room.locationCoordinates.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95"
              onClick={e => e.stopPropagation()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Get Directions
            </a>
          )}
        </div>
        <div className="flex flex-col gap-1 mt-4 text-xs text-gray-500 mt-auto">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Owner: {room.ownerName}
          </div>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8v8a2 2 0 002 2h14a2 2 0 002-2V8" /></svg>
            Phone: {room.ownerPhone}
          </div>
          {room.ownerWhatsapp && (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.72 11.06a6 6 0 11-8.48 0" /></svg>
              WhatsApp: {room.ownerWhatsapp}
            </div>
          )}
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4-4 4 4m0 0V3m0 14l-4-4-4 4" /></svg>
            Status: {room.status}
          </div>
          {room.createdAt && (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
              Posted: {new Date(room.createdAt).toLocaleDateString()}
            </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard; 