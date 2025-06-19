// CitySelector.jsx
import React, { useEffect, useState } from 'react';

function CitySelector({ onStateChange, onCityChange }) {
  const [cityData, setCityData] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);

  // JSON file se data load
  useEffect(() => {
    fetch('/Indian_Cities_In_States_JSON.json')
      .then((res) => res.json())
      .then((data) => setCityData(data))
      .catch((err) => console.error('Error loading JSON:', err));
  }, []);

  // State change pe city filter
  useEffect(() => {
    const selected = cityData.find((item) => item.state === selectedState);
    setFilteredCities(selected ? selected.city : []);
    onStateChange(selectedState); // notify parent
  }, [selectedState]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Filter by State & City</h2>

      {/* State Dropdown */}
      <select
        className="form-select mb-3"
        value={selectedState}
        onChange={(e) => setSelectedState(e.target.value)}
      >
        <option value="">-- Select State --</option>
        {cityData.map((item) => (
          <option key={item.state} value={item.state}>
            {item.state}
          </option>
        ))}
      </select>

      {/* City Dropdown */}
      <select
        className="form-select"
        onChange={(e) => onCityChange(e.target.value)}
      >
        <option value="">-- Select City --</option>
        {filteredCities.map((city, index) => (
          <option key={index}>{city}</option>
        ))}
      </select>
    </div>
  );
}

export default CitySelector;
