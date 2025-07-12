import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import Navbar from '../components/Navbar';

const RoomFullDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImageIdx, setMainImageIdx] = useState(0);

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:8000/api/rooms/${id}`);
        setRoom(res.data);
      } catch (err) {
        setRoom(null);
      }
      setLoading(false);
    };
    fetchRoom();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  if (!room) {
    return <div className="flex justify-center items-center min-h-screen text-red-600">Room not found.</div>;
  }

  const images = (room.images || []).map(img => {
    const filename = img.split('/').pop().split('\\').pop();
    return `http://localhost:8000/uploads/${filename}`;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-8 px-4">
      {/* <Navbar /> */}
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">&larr; Back</button>
        {/* Images Carousel */}
        <div className="w-full flex flex-col items-center mb-6">
          {images.length > 0 && (
            <>
              <img
                src={images[mainImageIdx]}
                alt="Room"
                className="object-contain max-h-72 w-full rounded-xl mb-2 bg-gray-100"
              />
              {images.length > 1 && (
                <div className="flex gap-2 justify-center mt-2">
                  {images.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`thumb-${idx}`}
                      className={`w-14 h-14 object-cover rounded-lg border-2 cursor-pointer transition-all ${mainImageIdx === idx ? 'border-blue-500' : 'border-gray-200'}`}
                      onClick={() => setMainImageIdx(idx)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.title}</h1>
        <div className="text-lg text-gray-700 mb-4">{room.description}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div><b>Area:</b> {room.area}</div>
          <div><b>Category:</b> {room.category}</div>
          <div><b>Flat Type:</b> {room.flatType}</div>
          <div><b>Suitable For:</b> {room.suitableFor}</div>
          <div><b>Status:</b> {room.status}</div>
          <div><b>Posted:</b> {room.createdAt && new Date(room.createdAt).toLocaleDateString()}</div>
          <div className="flex items-center gap-2">
            <b>Location:</b> {room.location}
            {room.location && (
              <button
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(room.location)}`, '_blank')}
                className="ml-2 bg-white/90 hover:bg-blue-100 text-blue-600 p-2 rounded-full shadow transition-colors"
                title="Open in Maps"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <g>
                    <path d="M12 2C7.03 2 3 6.03 3 11c0 5.25 7.11 10.36 8.09 11.05a1 1 0 001.18 0C13.89 21.36 21 16.25 21 11c0-4.97-4.03-9-9-9zm0 17.88C9.14 18.09 5 14.7 5 11c0-3.87 3.13-7 7-7s7 3.13 7 7c0 3.7-4.14 7.09-7 8.88z" fill="currentColor" />
                    <circle cx="12" cy="11" r="3" fill="white" />
                    <ellipse cx="12" cy="22" rx="5" ry="1.5" fill="currentColor" opacity=".3" />
                  </g>
                </svg>
              </button>
            )}
          </div>
          <div><b>Price/Rent:</b> ₹{room.propertyType === 'sale' ? room.price : room.rent} {room.propertyType === 'sale' ? '' : '/ month'}</div>
        </div>
        <div className="mb-4">
          <div><b>Owner:</b> {room.ownerName}</div>
          <div><b>Phone:</b> {room.ownerPhone}</div>
          {room.ownerWhatsapp && <div><b>WhatsApp:</b> {room.ownerWhatsapp}</div>}
        </div>
        <div className="flex gap-3 mt-4">
          {room.ownerPhone && (
            <a
              href={`tel:${room.ownerPhone}`}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2 rounded-full text-base font-bold shadow-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 active:scale-95"
            >
              Call
            </a>
          )}
          {room.ownerWhatsapp && (
            <a
              href={`https://wa.me/${room.ownerWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2 rounded-full text-base font-bold shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-300 active:scale-95"
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomFullDetailsPage; 