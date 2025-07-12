import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import axios from 'axios';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ area: '', rent: '', suitableFor: '' });
  const [areas, setAreas] = useState([]);
  const [suitableForOptions, setSuitableForOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
      if (filters.rent) params.maxRent = filters.rent;
      if (filters.suitableFor) params.suitableFor = filters.suitableFor;
      const res = await axios.get('http://localhost:8000/api/rooms', { params });
      setRooms(res.data);
      // Extract unique areas for filter dropdowns
      setAreas([...new Set(res.data.map(r => r.area))]);
      setSuitableForOptions([...new Set(res.data.map(r => r.suitableFor).filter(Boolean))]);
      // Reset to first page when filters change
      setCurrentPage(1);
    } catch (err) {
      setRooms([]);
    }
    setLoading(false);
  };

  const handleMarkRented = (roomId) => {
    setRooms(rooms => rooms.map(r => r._id === roomId ? { ...r, status: 'rented' } : r));
  };

  // Calculate pagination
  const totalPages = Math.ceil(rooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRooms = rooms.slice(startIndex, endIndex);
  const hasMorePages = currentPage < totalPages;

  const handleNextPage = () => {
    if (hasMorePages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  // Calculate pagination range
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    rented: rooms.filter(r => r.status === 'rented').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
          
          {/* Category Hero */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 capitalize">
              {decodeURIComponent(categoryName)}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Discover the perfect {decodeURIComponent(categoryName).toLowerCase()} for your needs
            </p>
            
            {/* Quick Stats */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Rooms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.available}</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.rented}</div>
                <div className="text-sm text-gray-600">Rented</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Filter Section */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-red-100/50 p-8">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-2-1A1 1 0 009 18v-4.586a1 1 0 00-.293-.707L2.293 6.707A1 1 0 012 6V4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Refine Your Search</h3>
                  <p className="text-sm text-gray-600">Find your perfect room with these filters</p>
                </div>
              </div>
              
              {/* Active Filters Count */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold shadow-md">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {Object.values(filters).filter(f => f !== '').length} active filters
                  </div>
                </div>
              </div>
            </div>
            
            {/* Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Area Filter */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="p-1.5 bg-red-100 rounded-lg">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  Location
                </label>
                <div className="relative">
                  <select
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 group-hover:shadow-md appearance-none cursor-pointer"
                    value={filters.area}
                    onChange={e => setFilters(f => ({ ...f, area: e.target.value }))}
                  >
                    <option value="" className="text-gray-500">All Areas</option>
                    {areas.map(area => (
                      <option key={area} value={area} className="text-gray-700">{area}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Rent Filter */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  Max Rent
                </label>
                <div className="relative">
                  <select
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white hover:border-green-300 group-hover:shadow-md appearance-none cursor-pointer"
                    value={filters.rent}
                    onChange={e => setFilters(f => ({ ...f, rent: e.target.value }))}
                  >
                    <option value="" className="text-gray-500">Any Rent</option>
                    <option value="5000" className="text-gray-700">Up to ₹5,000</option>
                    <option value="10000" className="text-gray-700">Up to ₹10,000</option>
                    <option value="15000" className="text-gray-700">Up to ₹15,000</option>
                    <option value="20000" className="text-gray-700">Up to ₹20,000</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Suitable For Filter */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  Suitable For
                </label>
                <div className="relative">
                  <select
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white hover:border-purple-300 group-hover:shadow-md appearance-none cursor-pointer"
                    value={filters.suitableFor}
                    onChange={e => setFilters(f => ({ ...f, suitableFor: e.target.value }))}
                  >
                    <option value="" className="text-gray-500">Any Number</option>
                    {suitableForOptions.map(num => (
                      <option key={num} value={num} className="text-gray-700">{num} People</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Filter Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{rooms.length}</span> rooms found
                </div>
                <div className="hidden sm:block text-gray-400">•</div>
                <div className="text-sm text-gray-600">
                  Page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Active Filters Display */}
                {Object.values(filters).some(f => f !== '') && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Active Filters:</span>
                    <div className="flex items-center gap-2">
                      {filters.area && (
                        <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold shadow-sm border border-red-200 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {filters.area}
                        </span>
                      )}
                      {filters.rent && (
                        <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold shadow-sm border border-green-200 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          ₹{filters.rent}
                        </span>
                      )}
                      {filters.suitableFor && (
                        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold shadow-sm border border-purple-200 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {filters.suitableFor} people
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <button
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  onClick={() => setFilters({ area: '', rent: '', suitableFor: '' })}
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All Filters
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-full flex flex-col items-center justify-center">
                <span className="loader"></span>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or check back later for new listings.</p>
            <button
              onClick={() => setFilters({ area: '', rent: '', suitableFor: '' })}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentRooms.map(room => {
                // Related rooms: same area or type, not self
                const related = rooms.filter(r => r._id !== room._id && (r.area === room.area)).slice(0, 3);
                return (
                  <div key={room._id} className="h-full flex flex-col transform hover:scale-105 transition-transform duration-300">
                    <div className="flex-1">
                      <RoomCard room={room} onMarkRented={handleMarkRented} relatedRooms={related} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Section */}
            <div className="mt-12 flex flex-col items-center">
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <button onClick={handlePrevPage} disabled={currentPage === 1} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {getPageNumbers().map((page, index) => (
                    <span
                      key={index}
                      onClick={() => typeof page === 'number' && handlePageClick(page)}
                      className={`p-2 rounded-full cursor-pointer hover:bg-gray-100 ${
                        typeof page === 'number' && page === currentPage
                          ? 'bg-red-500 text-white font-semibold'
                          : 'text-gray-600'
                      }`}
                    >
                      {page}
                    </span>
                  ))}
                  <button onClick={handleNextPage} disabled={!hasMorePages} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* No more content message - show on last page or when there's only one page */}
              {(totalPages === 1 || (totalPages > 1 && currentPage === totalPages)) && (
                <div className="text-center py-8 mt-6">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No more content</h3>
                  <p className="text-gray-600">You've reached the end of all available rooms in this category.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPage; 