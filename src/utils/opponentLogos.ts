export interface OpponentPreset {
  name: string;
  shortName: string;
  region: string;
  logoUrl: string;
}

export const OPPONENT_CLUB_PRESETS: OpponentPreset[] = [
  {
    name: 'Bengal Warriors (IND)',
    shortName: 'Bengal Warriors',
    region: 'India',
    logoUrl: '/opponent-logos/bengal-warriors.svg',
  },
  {
    name: 'Karachi Kickers (PAK)',
    shortName: 'Karachi Kickers',
    region: 'Pakistan',
    logoUrl: '/opponent-logos/karachi-kickers.svg',
  },
  {
    name: 'Colombo Strikers (SL)',
    shortName: 'Colombo Strikers',
    region: 'Sri Lanka',
    logoUrl: '/opponent-logos/colombo-strikers.svg',
  },
  {
    name: 'Dhaka Dragons eSports',
    shortName: 'Dhaka Dragons',
    region: 'Bangladesh',
    logoUrl: '/opponent-logos/dhaka-dragons.svg',
  },
  {
    name: 'Rajshahi Royals eSports',
    shortName: 'Rajshahi Royals',
    region: 'Bangladesh',
    logoUrl: '/opponent-logos/rajshahi-royals.svg',
  },
  {
    name: 'Chittagong Mariners',
    shortName: 'Ctg Mariners',
    region: 'Bangladesh',
    logoUrl: '/opponent-logos/chittagong-mariners.svg',
  },
];

const LEGACY_UNSPLASH_PHOTO = 'photo-1542751371-adc38448a05e';

export function getOpponentLogoUrl(clubName?: string, currentLogoUrl?: string): string {
  // If a valid uploaded logo exists and it's not the old stock gamer photo, return it
  if (currentLogoUrl && !currentLogoUrl.includes(LEGACY_UNSPLASH_PHOTO)) {
    return currentLogoUrl;
  }

  if (clubName) {
    const lower = clubName.toLowerCase();
    if (lower.includes('bengal') || lower.includes('warriors')) {
      return '/opponent-logos/bengal-warriors.svg';
    }
    if (lower.includes('karachi') || lower.includes('kickers')) {
      return '/opponent-logos/karachi-kickers.svg';
    }
    if (lower.includes('colombo') || lower.includes('strikers') && (lower.includes('sl') || lower.includes('sri'))) {
      return '/opponent-logos/colombo-strikers.svg';
    }
    if (lower.includes('dragons') || (lower.includes('dhaka') && lower.includes('dragon'))) {
      return '/opponent-logos/dhaka-dragons.svg';
    }
    if (lower.includes('rajshahi') || lower.includes('royals')) {
      return '/opponent-logos/rajshahi-royals.svg';
    }
    if (lower.includes('chittagong') || lower.includes('mariner')) {
      return '/opponent-logos/chittagong-mariners.svg';
    }
  }

  // Fallback to official esports crest
  return '/opponent-logos/generic-opponent.svg';
}
