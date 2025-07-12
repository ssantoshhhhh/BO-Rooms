import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const imagesInputRef = useRef();
  const [imagePreviews, setImagePreviews] = useState([]);

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

  const openAddModal = () => {
    setEditRoom(null);
    reset();
    setImagePreviews([]);
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditRoom(room);
    // Set form values, handling null values properly
    Object.entries(room).forEach(([key, value]) => {
      if (key !== 'images') {
        // Convert null/undefined to empty string for form fields
        setValue(key, value || '');
      }
    });
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

      if (editRoom) {
        // Update existing room
        const response = await axios.put(`http://localhost:8000/api/rooms/${editRoom._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.status === 200) {
          toast.success('Room updated successfully!');
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
          toast.success('Room added successfully!');
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
      console.error('Error saving room:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save room. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.delete(`http://localhost:8000/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.status === 200) {
        toast.success('Room deleted successfully!');
        fetchRooms(token);
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      console.error('Error deleting room:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete room';
      toast.error(errorMessage);
    }
  };

  const handleToggleStatus = async (room) => {
    const token = localStorage.getItem('adminToken');
    const newStatus = room.status === 'rented' ? 'available' : 'rented';
    
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
        toast.success(`Room marked as ${newStatus}!`);
        fetchRooms(token);
      } else {
        throw new Error('Status update failed');
      }
    } catch (err) {
      console.error('Error updating room status:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update room status';
      toast.error(errorMessage);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setValue('images', files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
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
                         room.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    rented: rooms.filter(r => r.status === 'rented').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage your rental properties in Bhimavaram</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-sm font-medium text-gray-600">Rented</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rented}</p>
              </div>
            </div>
          </div>
        </div>

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
                  placeholder="Search rooms..."
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
              </select>
            </div>
            
            <button
              onClick={openAddModal}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Room
            </button>
          </div>
        </div>

        {/* Rooms Grid */}
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No rooms found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new room.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div key={room._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                {/* Room Image */}
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
                        : 'bg-green-500 text-white'
                    }`}>
                      {room.status === 'rented' ? 'Rented' : 'Available'}
                    </span>
                  </div>
                </div>
                
                {/* Room Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 truncate">{room.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{room.area}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-red-600">₹{room.rent}</span>
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
                        room.status === 'rented'
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-500 text-white hover:bg-gray-600'
                      }`}
                    >
                      {room.status === 'rented' ? 'Mark Available' : 'Mark Rented'}
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

      {/* Modal for adding/editing room */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editRoom ? 'Edit Room' : 'Add New Room'}
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rent *</label>
                  <input type="number" {...register('rent', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                  {errors.rent && <span className="text-xs text-red-500">Rent is required</span>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                  <input {...register('ownerName', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                  {errors.ownerName && <span className="text-xs text-red-500">Owner name is required</span>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Phone *</label>
                  <input {...register('ownerPhone', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                  {errors.ownerPhone && <span className="text-xs text-red-500">Owner phone is required</span>}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
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
                  {submitLoading ? 'Saving...' : (editRoom ? 'Update Room' : 'Add Room')}
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
    </div>
  );
};

export default AdminDashboard; 