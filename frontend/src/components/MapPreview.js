import React from 'react';

const MapPreview = ({ latitude, longitude, location }) => {
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${latitude},${longitude}`;
  
  return (
    <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg">
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        src={mapUrl}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Property Location"
      />
    </div>
  );
};

export default MapPreview; 