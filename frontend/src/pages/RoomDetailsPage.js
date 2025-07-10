import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import RoomCard from '../components/RoomCard';

const RoomDetailsPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [similarRooms, setSimilarRooms] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!room) return <div className="min-h-screen flex items-center justify-center text-red-600">Room not found.</div>;

  return (
    <div className="min-h-screen bg-white p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <button className="mb-4 text-blue-600 hover:underline" onClick={() => navigate(-1)}>&larr; Back</button>
        <RoomCard room={room} onMarkRented={() => {}} />
      </div>
      {/* Similar Rooms */}
      {similarRooms.length > 0 && (
        <div className="w-full max-w-2xl">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Similar Rooms</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {similarRooms.map(r => (
              <RoomCard key={r._id} room={r} onMarkRented={() => {}} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetailsPage; 