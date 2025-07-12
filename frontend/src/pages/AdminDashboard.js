import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapClickPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPropertyType, setFilterPropertyType] = useState('all');
  const [selectedPropertyType, setSelectedPropertyType] = useState('rent');
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const imagesInputRef = useRef();
  const [imagePreviews, setImagePreviews] = useState([]);
  const [showStats, setShowStats] = useState(false); // Add this state
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [pickedCoords, setPickedCoords] = useState(null);
  const [pickedAddress, setPickedAddress] = useState('');

  const propertyType = watch('propertyType', 'rent');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchRooms(token);
    }
    // eslint-disable-next-line
  }, [navigate]);

  const fetchRooms = async (token) => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      toast.error('Failed to fetch rooms');
      setRooms([]);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const openAddModal = (type) => {
    setEditRoom(null);
    setSelectedPropertyType(type);
    reset();
    setImagePreviews([]);
    setValue('propertyType', type);
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditRoom(room);
    setSelectedPropertyType(room.propertyType || 'rent');
    // Set form values, handling null values properly
    Object.entries(room).forEach(([key, value]) => {
      if (key !== 'images') {
        // Convert null/undefined to empty string for form fields
        setValue(key, value || '');
      }
    });
    // Set the correct property type
    setValue('propertyType', room.propertyType || 'rent');
    setImagePreviews([]);
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    const token = localStorage.getItem('adminToken');
    
    try {
      const formData = new FormData();
      
      // Add all form fields to FormData, excluding null/empty values
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'images') {
          if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
              formData.append('images', value[i]);
            }
          } else if (value && value.length) {
            for (let i = 0; i < value.length; i++) {
              formData.append('images', value[i]);
            }
          }
        } else {
          // Only add non-null and non-empty values
          if (value !== null && value !== undefined && value !== '' && value !== 'null') {
            formData.append(key, value);
          }
        }
      });
      
      // Ensure only the correct price/rent field is sent based on property type
      if (data.propertyType === 'sale') {
        formData.delete('rent'); // Remove rent field for sale properties
      } else if (data.propertyType === 'rent') {
        formData.delete('price'); // Remove price field for rent properties
      }

      if (editRoom) {
        // Update existing room
        const response = await axios.put(`http://localhost:8000/api/rooms/${editRoom._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.status === 200) {
          toast.success('Property updated successfully!');
          setShowModal(false);
          reset();
          setEditRoom(null);
          setImagePreviews([]);
          fetchRooms(token);
        } else {
          throw new Error('Update failed');
        }
      } else {
        // Create new room
        const response = await axios.post('http://localhost:8000/api/rooms', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.status === 201) {
          toast.success('Property added successfully!');
          setShowModal(false);
          reset();
          setEditRoom(null);
          setImagePreviews([]);
          fetchRooms(token);
        } else {
          throw new Error('Creation failed');
        }
      }
    } catch (err) {
      console.error('Error saving property:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save property. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.delete(`http://localhost:8000/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.status === 200) {
        toast.success('Property deleted successfully!');
        fetchRooms(token);
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      console.error('Error deleting property:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete property';
      toast.error(errorMessage);
    }
  };

  const handleToggleStatus = async (room) => {
    const token = localStorage.getItem('adminToken');
    let newStatus;
    
    if (room.propertyType === 'sale') {
      newStatus = room.status === 'sold' ? 'available' : 'sold';
    } else {
      newStatus = room.status === 'rented' ? 'available' : 'rented';
    }
    
    try {
      const response = await axios.put(`http://localhost:8000/api/rooms/${room._id}`, 
        { status: newStatus }, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.status === 200) {
        toast.success(`Property marked as ${newStatus}!`);
        fetchRooms(token);
      } else {
        throw new Error('Status update failed');
      }
    } catch (err) {
      console.error('Error updating property status:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update property status';
      toast.error(errorMessage);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setValue('images', files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          
          // Reverse geocoding to get address
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
              const address = data.display_name;
              setValue('location', address);
              setValue('locationCoordinates.latitude', latitude);
              setValue('locationCoordinates.longitude', longitude);
              toast.success('Location captured successfully!');
            })
            .catch(error => {
              console.error('Error getting address:', error);
              // Still set coordinates even if address lookup fails
              setValue('location', `Lat: ${latitude}, Lng: ${longitude}`);
              setValue('locationCoordinates.latitude', latitude);
              setValue('locationCoordinates.longitude', longitude);
              toast.success('Location coordinates captured!');
            })
            .finally(() => {
              setLocationLoading(false);
            });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get location. Please enter manually.');
          setLocationLoading(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
      setLocationLoading(false);
    }
  };

  const categories = [
    'Studio Apartment',
    '1 BHK',
    '2 BHK',
    '3 BHK',
    'Duplex Apartment',
    'Triplex Apartment',
    'Penthouse',
    'Loft Apartment',
    'Serviced Apartment',
    'Garden Apartment',
    'Condominium (Condo)',
    'Co-living Space'
  ];

  // Filter and search rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (room.location && room.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    const matchesPropertyType = filterPropertyType === 'all' || room.propertyType === filterPropertyType;
    return matchesSearch && matchesStatus && matchesPropertyType;
  });

  const stats = {
    total: rooms.length,
    sale: rooms.filter(r => r.propertyType === 'sale').length,
    rent: rooms.filter(r => r.propertyType === 'rent').length,
    available: rooms.filter(r => r.status === 'available').length,
    rented: rooms.filter(r => r.status === 'rented').length,
    sold: rooms.filter(r => r.status === 'sold').length,
  };

  // Reverse geocode coordinates to address
  async function reverseGeocode(lat, lng) {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await res.json();
    return data.display_name || '';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage your properties in Bhimavaram</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Toggle Button */}
        <div className="mb-4">
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
            onClick={() => setShowStats(s => !s)}
          >
            {showStats ? 'Hide Statistics' : 'Open Statistics'}
          </button>
        </div>
        {/* Stats Cards (collapsible) */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">For Sale</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.sale}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3v2a1 1 0 001 1h4a1 1 0 001-1v-2h3a1 1 0 001-1V7a1 1 0 00-1-1h-3V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2H4a1 1 0 00-1 1z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">For Rent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rent}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rented/Sold</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rented + stats.sold}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="sold">Sold</option>
              </select>

              {/* Property Type Filter */}
              <select
                value={filterPropertyType}
                onChange={(e) => setFilterPropertyType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Types</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => openAddModal('sale')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Sale Property
              </button>
              <button
                onClick={() => openAddModal('rent')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Rent Property
              </button>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-full flex flex-col items-center justify-center">
                <span className="loader"></span>
              </div>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new property.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div key={room._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                {/* Property Image */}
                <div className="h-48 bg-gray-200 relative flex-shrink-0">
                  {room.images && room.images[0] && (() => {
                    const filename = room.images[0].split('/').pop().split('\\').pop();
                    const imageUrl = `http://localhost:8000/uploads/${filename}`;
                    return (
                      <img
                        src={imageUrl}
                        alt={room.title}
                        className="w-full h-full object-cover"
                      />
                    );
                  })()}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      room.status === 'rented' 
                        ? 'bg-red-500 text-white' 
                        : room.status === 'sold'
                        ? 'bg-purple-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}>
                      {room.status === 'rented' ? 'Rented' : room.status === 'sold' ? 'Sold' : 'Available'}
                    </span>
                  </div>
                  {/* Property Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      room.propertyType === 'sale' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-500 text-white'
                    }`}>
                      {room.propertyType === 'sale' ? 'Sale' : 'Rent'}
                    </span>
                  </div>
                </div>
                
                {/* Property Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 truncate">{room.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{room.area}</p>
                  {room.location && (
                    <p className="text-sm text-gray-500 mt-1">{room.location}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-red-600">
                      ₹{room.propertyType === 'sale' ? room.price : room.rent}
                    </span>
                    {room.suitableFor && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {room.suitableFor} people
                      </span>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 mt-auto">
                    <button
                      onClick={() => handleToggleStatus(room)}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        room.status === 'rented' || room.status === 'sold'
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-500 text-white hover:bg-gray-600'
                      }`}
                    >
                      {room.status === 'rented' || room.status === 'sold' ? 'Mark Available' : room.propertyType === 'sale' ? 'Mark Sold' : 'Mark Rented'}
                    </button>
                    <button
                      onClick={() => openEditModal(room)}
                      className="px-3 py-2 text-xs font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room._id)}
                      className="px-3 py-2 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for adding/editing property */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editRoom ? 'Edit Property' : `Add New ${selectedPropertyType === 'sale' ? 'Sale' : 'Rent'} Property`}
                </h3>
                <button
                  onClick={() => { setShowModal(false); setEditRoom(null); setImagePreviews([]); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input {...register('title', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                  {errors.title && <span className="text-xs text-red-500">Title is required</span>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                  <select {...register('propertyType', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option value="rent">For Rent</option>
                    <option value="sale">For Sale</option>
                  </select>
                  {errors.propertyType && <span className="text-xs text-red-500">Property type is required</span>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select {...register('category', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <span className="text-xs text-red-500">Category is required</span>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
                  <input {...register('area', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                  {errors.area && <span className="text-xs text-red-500">Area is required</span>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <div className="flex gap-2">
                    <input {...register('location', { required: true })} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="Enter location or use GPS" />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {locationLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Getting...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a4 4 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414-1.414z" />
                          </svg>
                          Get Location
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 119.5 9 2.5 2.5 0 0112 11.5z" />
                      </svg>
                      Pick Location on Map
                    </button>
                  </div>
                  {errors.location && <span className="text-xs text-red-500">Location is required</span>}
                  {currentLocation && (
                    <p className="text-xs text-green-600 mt-1">
                      Coordinates: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flat Type</label>
                  <input {...register('flatType')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="e.g. 2BHK, 3BHK" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suitable For (Number of People)</label>
                  <input 
                    type="number" 
                    {...register('suitableFor')} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    placeholder="e.g. 2, 3, 4" 
                    min="1"
                  />
                </div>
                
                {propertyType === 'rent' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rent (per month) *</label>
                    <input type="number" {...register('rent', { required: propertyType === 'rent' })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                    {errors.rent && <span className="text-xs text-red-500">Rent is required</span>}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <input type="number" {...register('price', { required: propertyType === 'sale' })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                    {errors.price && <span className="text-xs text-red-500">Price is required</span>}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                  <input {...register('ownerName', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                  {errors.ownerName && <span className="text-xs text-red-500">Owner name is required</span>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Contact *</label>
                  <input {...register('ownerPhone', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                  {errors.ownerPhone && <span className="text-xs text-red-500">Owner contact is required</span>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner WhatsApp</label>
                  <input {...register('ownerWhatsapp')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea {...register('description')} rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Images *</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={imagesInputRef}
                  onChange={e => {
                    const files = Array.from(e.target.files);
                    setValue('images', files, { shouldValidate: true, shouldDirty: true });
                    setImagePreviews(files.map(file => URL.createObjectURL(file)));
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {imagePreviews.map((src, idx) => (
                      <img key={idx} src={src} alt="Preview" className="w-16 h-16 object-cover rounded-lg border" />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Saving...' : (editRoom ? 'Update Property' : 'Add Property')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditRoom(null); setImagePreviews([]); }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showMapPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
            <button onClick={() => setShowMapPicker(false)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">✕</button>
            <h3 className="text-lg font-bold mb-4">Pick Location on Map</h3>
            <div className="h-80 w-full rounded-lg border border-gray-200 overflow-hidden mb-4">
              <MapContainer center={[16.5449, 81.5212]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {pickedCoords && <Marker position={[pickedCoords.lat, pickedCoords.lng]} />}
                <MapClickPicker onPick={async (latlng) => {
                  setPickedCoords(latlng);
                  setPickedAddress('Loading...');
                  const addr = await reverseGeocode(latlng.lat, latlng.lng);
                  setPickedAddress(addr);
                }} />
              </MapContainer>
            </div>
            {pickedCoords && (
              <div className="mb-4 text-sm text-gray-700">
                <div><b>Coordinates:</b> {pickedCoords.lat.toFixed(6)}, {pickedCoords.lng.toFixed(6)}</div>
                <div><b>Address:</b> {pickedAddress}</div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowMapPicker(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={!pickedCoords}
                onClick={() => {
                  if (pickedCoords) {
                    setValue('location', pickedAddress || `Lat: ${pickedCoords.lat}, Lng: ${pickedCoords.lng}`);
                    setValue('locationCoordinates.latitude', pickedCoords.lat);
                    setValue('locationCoordinates.longitude', pickedCoords.lng);
                    setCurrentLocation({ latitude: pickedCoords.lat, longitude: pickedCoords.lng });
                    setShowMapPicker(false);
                    toast.success('Location set from map!');
                  }
                }}
              >
                Set Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 