import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { mapsTrailService } from '../../services/mapsTrailAdapter';
import type { LocationCoords } from '../../services/mapsTrailAdapter';
import type { Hospital } from '../../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Search,
  Navigation,
  Phone,
  ShieldCheck,
  ChevronRight,
  Crosshair,
  Star,
  Compass
} from 'lucide-react';

interface HospitalMapProps {
  onSelectHospital: (hospital: Hospital) => void;
}

const RADIUS_OPTIONS = [
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: '100 km', value: 100 }
];

export const HospitalMap: React.FC<HospitalMapProps> = ({ onSelectHospital }) => {
  const { hospitals } = useApp();

  const [userLocation, setUserLocation] = useState<LocationCoords>({
    latitude: 28.6139,
    longitude: 77.2090
  });

  const [customCitySearch, setCustomCitySearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState<number>(25);
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    mapsTrailService.getCurrentLocation().then(coords => {
      setUserLocation(coords);
    });
  }, []);

  const filteredHospitals = mapsTrailService.filterHospitals(hospitals, userLocation, {
    query: searchQuery,
    maxDistanceKm: maxDistance,
    emergencyAvailableOnly: emergencyOnly,
    specialization: selectedSpecialty === 'ALL' ? undefined : selectedSpecialty
  });

  const specialties = ['ALL', 'Cardiology', 'Toxicology', 'Pulmonology', 'Pediatrics', 'Emergency Medicine'];

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map instance if not existing
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.latitude, userLocation.longitude],
        zoom: 12,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    if (map && markersGroup) {
      markersGroup.clearLayers();

      // Set center to user location
      map.setView([userLocation.latitude, userLocation.longitude], 12);

      // User location marker (Blue dot)
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `<div style="background-color: #06b6d4; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 12px #06b6d4;"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
        .addTo(markersGroup)
        .bindPopup(`<b>📍 Your Location</b><br/>GPS: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`);

      // Radius circle
      L.circle([userLocation.latitude, userLocation.longitude], {
        radius: maxDistance * 1000,
        color: '#0284c7',
        fillColor: '#0284c7',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '4, 8'
      }).addTo(markersGroup);

      // Add Hospital markers
      filteredHospitals.forEach(hosp => {
        const isER = hosp.emergencyAvailable;
        const pinColor = isER ? '#dc2626' : '#0284c7';
        
        const hospIcon = L.divIcon({
          className: 'custom-hosp-pin',
          html: `<div style="background-color: ${pinColor}; color: white; width: 32px; height: 32px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">🏥</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const popupContent = `
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="font-size: 13px; color: #0f172a;">${hosp.name}</strong><br/>
            <span style="font-size: 11px; color: #64748b;">${hosp.address}</span><br/>
            <div style="margin-top: 6px; font-size: 11px; font-weight: bold; color: ${isER ? '#dc2626' : '#0284c7'};">
              ${isER ? '🚨 24/7 ER Trauma Active' : '🏥 Specialty Hospital'} (${hosp.distanceKm ?? 2.1} km)
            </div>
            <div style="margin-top: 4px;">
              <a href="tel:${hosp.emergencyPhone}" style="color: #dc2626; font-weight: bold; font-size: 11px; text-decoration: none;">📞 Call ${hosp.emergencyPhone}</a>
            </div>
          </div>
        `;

        const marker = L.marker([hosp.latitude, hosp.longitude], { icon: hospIcon })
          .addTo(markersGroup)
          .bindPopup(popupContent);

        marker.on('click', () => {
          onSelectHospital(hosp);
        });
      });
    }
  }, [userLocation, maxDistance, filteredHospitals]);

  const handleCitySearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCitySearch.trim()) return;
    
    // Geocode simulation for major metro centers
    const city = customCitySearch.toLowerCase();
    if (city.includes('delhi') || city.includes('metro')) {
      setUserLocation({ latitude: 28.6139, longitude: 77.2090 });
    } else if (city.includes('mumbai')) {
      setUserLocation({ latitude: 19.0760, longitude: 72.8777 });
    } else if (city.includes('bangalore') || city.includes('bengaluru')) {
      setUserLocation({ latitude: 12.9716, longitude: 77.5946 });
    } else if (city.includes('york')) {
      setUserLocation({ latitude: 40.7128, longitude: -74.0060 });
    } else {
      // Default to offset
      setUserLocation({ latitude: 28.6250, longitude: 77.2180 });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Nearby Hospital Discovery & Live Map</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-mono font-bold">
                MapsTrail Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Locate 24/7 ER trauma units, snake bite antivenom hubs, and cardiac hospitals with live route navigation.
            </p>
          </div>

          {/* User Location & City Finder */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleCitySearchSubmit} className="flex items-center gap-1 bg-slate-800 p-1 rounded-2xl border border-slate-700">
              <input
                type="text"
                placeholder="Search City / Zipcode..."
                value={customCitySearch}
                onChange={(e) => setCustomCitySearch(e.target.value)}
                className="bg-transparent text-white text-xs px-3 py-1 focus:outline-none w-36"
              />
              <button type="submit" className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold">
                Set
              </button>
            </form>

            <div className="flex items-center gap-2 bg-slate-800 px-3.5 py-2 rounded-2xl border border-slate-700 text-xs shrink-0">
              <Crosshair className="w-4 h-4 text-emerald-400 animate-spin" />
              <div className="text-left hidden sm:block">
                <span className="text-slate-400 block text-[10px]">Live GPS:</span>
                <span className="text-white font-mono font-bold">
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Specialty Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search hospital name or service (e.g. Snake bite, ICU, Cardiac)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-800 px-3.5 py-2 rounded-2xl border border-slate-700 text-xs">
            <span className="text-slate-400 whitespace-nowrap">Specialty:</span>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="bg-transparent text-indigo-400 font-bold focus:outline-none cursor-pointer w-full"
            >
              {specialties.map(s => (
                <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* RADIUS SELECTION BUTTONS & ER TOGGLE BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
              <Compass className="w-4 h-4 text-sky-400" />
              Radius:
            </span>
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMaxDistance(opt.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border shrink-0 ${
                  maxDistance === opt.value
                    ? 'bg-sky-600 border-sky-500 text-white shadow-lg shadow-sky-600/30 scale-105'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border w-full sm:w-auto shrink-0 ${
              emergencyOnly
                ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>24/7 ER Only</span>
          </button>
        </div>
      </div>

      {/* Split Interactive Map & Hospital Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real Leaflet Map Canvas */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl h-[580px] relative overflow-hidden shadow-2xl flex flex-col">
          {/* Leaflet Container Mount */}
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Map Overlay Badge */}
          <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700 shadow-xl text-xs flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-red-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              24/7 ER
            </span>
            <span className="flex items-center gap-1.5 text-sky-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              Specialty
            </span>
            <span className="text-slate-400 font-mono text-[11px] border-l border-slate-700 pl-2">
              Radius: <strong className="text-white">{maxDistance} km</strong>
            </span>
          </div>
        </div>

        {/* Right Hospital Cards List */}
        <div className="lg:col-span-5 space-y-4 max-h-[580px] overflow-y-auto pr-1">
          {filteredHospitals.map((hospital) => (
            <div
              key={hospital.hospitalId}
              className="bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all space-y-4 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm group-hover:text-sky-400 transition-colors">
                      {hospital.name}
                    </h3>
                    {hospital.verificationStatus === 'verified' && (
                      <span title="Verified Hospital">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{hospital.address}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {hospital.distanceKm ?? 2.1} km
                  </span>
                  <div className="flex items-center justify-end gap-1 text-amber-400 text-xs mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold">{hospital.rating}</span>
                  </div>
                </div>
              </div>

              {/* Badges & Services */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {hospital.emergencyAvailable && (
                  <span className="px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-md font-bold">
                    🚨 24/7 ER Available
                  </span>
                )}
                {hospital.departments.slice(0, 3).map((dept, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                    {dept}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <a
                  href={`tel:${hospital.emergencyPhone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 rounded-xl text-xs font-bold transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call ER</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => mapsTrailService.openNavigation(hospital.latitude, hospital.longitude, hospital.name)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl text-xs font-bold border border-slate-700 transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate</span>
                  </button>

                  <button
                    onClick={() => onSelectHospital(hospital)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                  >
                    <span>View Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
