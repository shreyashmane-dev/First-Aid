export interface EmergencyHotline {
  countryCode: string;
  countryName: string;
  primaryEmergencyNumber: string;
  ambulanceNumber: string;
  poisonControlNumber: string;
  toxicologyHelpline: string;
  description: string;
}

export const REGIONAL_HOTLINES: Record<string, EmergencyHotline> = {
  IN: {
    countryCode: 'IN',
    countryName: 'India',
    primaryEmergencyNumber: '112',
    ambulanceNumber: '108',
    poisonControlNumber: '1800-116-117 / +91-11-26588669',
    toxicologyHelpline: '108 / +91 (555) SNAKE-BITES',
    description: '112 is India’s pan-India single emergency response line. 108 provides free emergency ambulance & ASV dispatch.'
  },
  US: {
    countryCode: 'US',
    countryName: 'United States',
    primaryEmergencyNumber: '911',
    ambulanceNumber: '911',
    poisonControlNumber: '1-800-222-1222',
    toxicologyHelpline: '1-800-222-1222',
    description: '911 covers all police, fire, and medical emergency services across the US.'
  },
  UK: {
    countryCode: 'UK',
    countryName: 'United Kingdom',
    primaryEmergencyNumber: '999',
    ambulanceNumber: '999',
    poisonControlNumber: '111',
    toxicologyHelpline: '999',
    description: '999 is the UK primary emergency hotline. NHS 111 for non-life-threatening urgent medical advice.'
  },
  EU: {
    countryCode: 'EU',
    countryName: 'European Union',
    primaryEmergencyNumber: '112',
    ambulanceNumber: '112',
    poisonControlNumber: '112',
    toxicologyHelpline: '112',
    description: '112 is the universal emergency number valid across all EU member states.'
  }
};

class EmergencyHotlineService {
  private currentRegion: string = 'IN';

  setRegion(countryCode: string) {
    if (REGIONAL_HOTLINES[countryCode]) {
      this.currentRegion = countryCode;
    }
  }

  getHotlines(): EmergencyHotline {
    return REGIONAL_HOTLINES[this.currentRegion] || REGIONAL_HOTLINES.IN;
  }

  /**
   * Auto-detect region based on latitude / longitude
   */
  detectRegionFromCoords(latitude: number, longitude: number): EmergencyHotline {
    // Basic bounding boxes: India lat 8..37, lon 68..97
    if (latitude >= 8 && latitude <= 37 && longitude >= 68 && longitude <= 97) {
      this.currentRegion = 'IN';
    } else if (latitude >= 24 && latitude <= 49 && longitude >= -125 && longitude <= -66) {
      this.currentRegion = 'US';
    } else if (latitude >= 50 && latitude <= 60 && longitude >= -8 && longitude <= 2) {
      this.currentRegion = 'UK';
    } else {
      this.currentRegion = 'IN'; // Default to India 112 / 108
    }
    return this.getHotlines();
  }
}

export const emergencyHotlineService = new EmergencyHotlineService();
