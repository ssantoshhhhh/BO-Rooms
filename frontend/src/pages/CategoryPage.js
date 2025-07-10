import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import axios from 'axios';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ area: '', flatType: '', rent: '', suitableFor: '' });
  const [areas, setAreas] = useState([]);
  const [types, setTypes] = useState([]);
  const [suitableForOptions, setSuitableForOptions] = useState([]);

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line
  }, [categoryName, filters]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const decodedCategory = decodeURIComponent(categoryName);
      const params = { category: decodedCategory };
      if (filters.area) params.area = filters.area;
      if (filters.flatType) params.flatType = filters.flatType;
      if (filters.rent) params.maxRent = filters.rent;
      if (filters.suitableFor) params.suitableFor = filters.suitableFor;
      const res = await axios.get('http://localhost:8000/api/rooms', { params });
      setRooms(res.data);
      // Extract unique areas and types for filter dropdowns
      setAreas([...new Set(res.data.map(r => r.area))]);
      setTypes([...new Set(res.data.map(r => r.flatType).filter(Boolean))]);
      setSuitableForOptions([...new Set(res.data.map(r => r.suitableFor).filter(Boolean))]);
    } catch (err) {
      setRooms([]);
    }
    setLoading(false);
  };

  const handleMarkRented = (roomId) => {
    setRooms(rooms => rooms.map(r => r._id === roomId ? { ...r, status: 'rented' } : r));
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <button className="mb-2 text-blue-600 hover:underline" onClick={() => navigate(-1)}>&larr; Back</button>
      <h2 className="text-2xl font-bold text-red-600 mb-4 capitalize">{decodeURIComponent(categoryName)}</h2>
      {/* Filter options */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <select
          className="border rounded px-2 py-1"
          value={filters.area}
          onChange={e => setFilters(f => ({ ...f, area: e.target.value }))}
        >
          <option value="">All Areas</option>
          {areas.map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
        <select
          className="border rounded px-2 py-1"
          value={filters.flatType}
          onChange={e => setFilters(f => ({ ...f, flatType: e.target.value }))}
        >
          <option value="">All Types</option>
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          className="border rounded px-2 py-1"
          value={filters.rent}
          onChange={e => setFilters(f => ({ ...f, rent: e.target.value }))}
        >
          <option value="">Any Rent</option>
          <option value="5000">Up to ₹5,000</option>
          <option value="10000">Up to ₹10,000</option>
          <option value="15000">Up to ₹15,000</option>
        </select>
        <select
          className="border rounded px-2 py-1"
          value={filters.suitableFor}
          onChange={e => setFilters(f => ({ ...f, suitableFor: e.target.value }))}
        >
          <option value="">Suitable For (People)</option>
          {suitableForOptions.map(num => (
            <option key={num} value={num}>{num} People</option>
          ))}
        </select>
      </div>
      {/* Skeleton loader */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-32 rounded" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div>No rooms found.</div>
      ) : (
        rooms.map(room => {
          // Related rooms: same area or type, not self
          const related = rooms.filter(r => r._id !== room._id && (r.area === room.area || r.flatType === room.flatType)).slice(0, 3);
          return <RoomCard key={room._id} room={room} onMarkRented={handleMarkRented} relatedRooms={related} />;
        })
      )}
    </div>
  );
};

export default CategoryPage; 