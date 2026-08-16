import type { Hospital } from '../types';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface MapSearchFilter {
  query?: string;
  maxDistanceKm?: number;
  emergencyAvailableOnly?: boolean;
  specialization?: string;
}

class MapsTrailAdapter {
  public apiKey: string;
  public baseUrl: string;

  constructor() {
    this.apiKey = (import.meta as any).env?.VITE_MAPSTRAIL_API_KEY || 'demo-mapstrail-key';
    this.baseUrl = (import.meta as any).env?.VITE_MAPSTRAIL_BASE_URL || 'https://api.mapstrail.io/v1';
  }

  /**
   * Request user's current GPS location with high accuracy
   */
  async getCurrentLocation(): Promise<LocationCoords> {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.warn('Geolocation access denied or timed out. Defaulting to Metro Center:', error);
            // Default to central Delhi / Metro region coordinates
            resolve({ latitude: 28.6139, longitude: 77.2090 });
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        resolve({ latitude: 28.6139, longitude: 77.2090 });
      }
    });
  }

  /**
   * Calculate distance between two lat/lng coordinates using Haversine formula (km)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d * 10) / 10;
  }

  /**
   * Search and filter nearby hospitals by location and criteria
   */
  filterHospitals(
    hospitals: Hospital[],
    userLocation: LocationCoords,
    filter: MapSearchFilter
  ): Hospital[] {
    return hospitals
      .map((h) => {
        const dist = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          h.latitude,
          h.longitude
        );
        return { ...h, distanceKm: dist };
      })
      .filter((h) => {
        // Query match
        if (filter.query) {
          const q = filter.query.toLowerCase();
          const matchName = h.name.toLowerCase().includes(q);
          const matchAddress = h.address.toLowerCase().includes(q);
          const matchDept = h.departments.some((d) => d.toLowerCase().includes(q));
          const matchService = h.services.some((s) => s.toLowerCase().includes(q));
          if (!matchName && !matchAddress && !matchDept && !matchService) {
            return false;
          }
        }

        // Distance filter
        if (filter.maxDistanceKm && (h.distanceKm ?? 0) > filter.maxDistanceKm) {
          return false;
        }

        // Emergency filter
        if (filter.emergencyAvailableOnly && !h.emergencyAvailable) {
          return false;
        }

        // Specialization filter
        if (filter.specialization) {
          const spec = filter.specialization.toLowerCase();
          const matchDept = h.departments.some((d) => d.toLowerCase().includes(spec));
          const matchServ = h.services.some((s) => s.toLowerCase().includes(spec));
          if (!matchDept && !matchServ) return false;
        }

        return true;
      })
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }

  /**
   * Generates navigation URL for Google Maps / MapsTrail directions
   */
  openNavigation(hLat: number, hLng: number, hospitalName: string) {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hLat},${hLng}&destination_place_id=${encodeURIComponent(hospitalName)}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  }
}

export const mapsTrailService = new MapsTrailAdapter();
