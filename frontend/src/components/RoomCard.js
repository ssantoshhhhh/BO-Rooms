import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RoomCard = ({ room, onMarkRented, minimal }) => {
  const navigate = useNavigate();
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [fade, setFade] = useState(true);
  const [carouselInterval, setCarouselInterval] = useState(null);

  // Image URLs
  const images = (room.images || []).map(img => {
    const filename = img.split('/').pop().split('\\').pop();
    return `http://localhost:8000/uploads/${filename}`;
  });

  // Auto-scroll carousel for minimal card with fade effect
  React.useEffect(() => {
    if (!minimal || images.length <= 1) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMainImageIdx(idx => (idx + 1) % images.length);
        setFade(true);
      }, 250); // fade out duration
    }, 2500);
    return () => clearInterval(interval);
  }, [minimal, images.length]);

  if (minimal) {
    return (
      <div
        className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
        onClick={() => navigate(`/room/${room._id}`)}
      >
        {/* Auto-scrolling Image Carousel with Fade */}
        <div className="w-full flex justify-center items-center bg-white" style={{ minHeight: '220px' }}>
          {images[mainImageIdx] ? (
            <img
              src={images[mainImageIdx]}
              alt="Room"
              className={`object-contain max-h-56 max-w-full transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
            />
          ) : (
            <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
          )}
        </div>
        <div className="flex flex-col gap-2 px-4 py-5">
          <h3 className="text-xl font-bold text-gray-900 truncate" title={room.title}>{room.title}</h3>
          <div className="text-gray-700 mb-1 line-clamp-2">{room.description}</div>
          <div className="flex gap-4 text-base font-semibold text-gray-700">
            <span>₹{room.rent || room.price}{room.propertyType === 'rent' ? ' / month' : ''}</span>
            <span className="text-gray-400">|</span>
            <span>{room.area}</span>
          </div>
        </div>
      </div>
    );
  }

  const handleShare = (e) => {
    e.stopPropagation();
    const url = window.location.origin + `/room/${room._id}`;
    if (navigator.share) {
      navigator.share({ title: room.title, url });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const openMapsApp = (e) => {
    e.stopPropagation();
    if (!room.location) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(room.location)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col relative p-4">
      {/* Action Icons */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-30">
        {/* Share icon */}
        <button
          onClick={handleShare}
          className="bg-white/90 hover:bg-green-100 text-green-600 p-2 rounded-full shadow-lg transition-colors"
          title={copied ? 'Copied!' : 'Share'}
        >
          {/* Curved Arrow Share Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M4 12v-1a7 7 0 017-7h5" />
            <polyline points="15 4 21 4 21 10" />
            <path d="M21 4l-9 9a7 7 0 01-7 7v-1" />
          </svg>
        </button>
        {/* Location icon */}
        {room.location && (
          <button
            onClick={openMapsApp}
            className="bg-white/90 hover:bg-blue-100 text-blue-600 p-2 rounded-full shadow-lg transition-colors"
            title="Open in Maps"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <g>
                <path d="M12 2C7.03 2 3 6.03 3 11c0 5.25 7.11 10.36 8.09 11.05a1 1 0 001.18 0C13.89 21.36 21 16.25 21 11c0-4.97-4.03-9-9-9zm0 17.88C9.14 18.09 5 14.7 5 11c0-3.87 3.13-7 7-7s7 3.13 7 7c0 3.7-4.14 7.09-7 8.88z" fill="currentColor" />
                <circle cx="12" cy="11" r="3" fill="white" />
                <ellipse cx="12" cy="22" rx="5" ry="1.5" fill="currentColor" opacity=".3" />
              </g>
            </svg>
          </button>
        )}
        {/* Optionally, add a heart icon here */}
      </div>
      {/* Main Image */}
      <div className="w-full flex justify-center items-center bg-white" style={{ minHeight: '220px' }}>
        {images[mainImageIdx] ? (
          <img src={images[mainImageIdx]} alt="Room" className="object-contain max-h-56 max-w-full" />
        ) : (
          <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
        )}
      </div>
      {/* Image Previews */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-center mt-2">
          {images.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`thumb-${idx}`}
              className={`w-12 h-12 object-cover rounded-lg border-2 cursor-pointer transition-all ${mainImageIdx === idx ? 'border-blue-500' : 'border-gray-200'}`}
              onClick={() => setMainImageIdx(idx)}
            />
          ))}
        </div>
      )}
      {/* Title, Price/Rent, Actions */}
      <div className="flex flex-col gap-2 px-2 py-5">
        <h3 className="text-xl font-bold text-gray-900 truncate" title={room.title}>{room.title}</h3>
        <div className="text-2xl font-extrabold text-red-600">
          ₹{room.propertyType === 'sale' ? room.price : room.rent} {room.propertyType === 'sale' ? '' : '/ month'}
        </div>
        <div className="flex gap-3 mt-2">
          <a
            href={`tel:${room.ownerPhone}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2 rounded-full text-base font-bold shadow-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 active:scale-95"
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
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2 rounded-full text-base font-bold shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-300 active:scale-95"
              onClick={e => e.stopPropagation()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A12.07 12.07 0 0012 0C5.37 0 0 5.37 0 12a11.93 11.93 0 001.64 6.06L0 24l6.18-1.62A12.07 12.07 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22c-1.61 0-3.18-.31-4.65-.92l-.33-.14-3.67.96.98-3.58-.15-.34A9.94 9.94 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.34-.26.27-1 1-.97 2.43.03 1.43 1.04 2.81 1.19 3 .15.19 2.05 3.13 5.01 4.27.7.3 1.25.48 1.68.61.71.23 1.36.2 1.87.12.57-.09 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z" /></svg>
              WhatsApp
            </a>
          )}
        </div>
        {/* Details Button (below actions, right-aligned) */}
        <div className="flex justify-end mt-2">
          <button
            onClick={e => { e.stopPropagation(); navigate(`/room/${room._id}/details`); }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300 z-30"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard; 