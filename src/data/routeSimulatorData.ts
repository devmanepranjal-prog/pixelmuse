export interface LocationOption {
  id: string;
  name: string;
  region: 'Mumbai' | 'Other Metro';
  description: string;
  approxDistanceBaseKm?: number;
}

export type AccessibilityPreferenceId =
  | 'wheelchair'
  | 'reduced-mobility'
  | 'elderly'
  | 'visual-impairment'
  | 'stroller'
  | 'none';

export interface AccessibilityPreference {
  id: AccessibilityPreferenceId;
  label: string;
  iconName: string;
  priorities: string[];
  description: string;
}

export interface RouteMetrics {
  distance: number; // km
  time: number; // minutes
  stairs: number; // count
  maxSlope: number; // percentage
  barriers: number; // count
  unsafeCrossings: number; // count
}

export interface SchematicStep {
  id: string;
  title: string;
  type:
    | 'start'
    | 'stair'
    | 'ramp'
    | 'barrier'
    | 'curb_cut'
    | 'unsafe_crossing'
    | 'accessible_crossing'
    | 'smooth_footpath'
    | 'destination';
  detail: string;
  avoidedOrResolved?: boolean;
}

export interface RouteScenarioData {
  normal: RouteMetrics;
  accessible: RouteMetrics;
  normalSteps: SchematicStep[];
  accessibleSteps: SchematicStep[];
  whyChanged: string[];
  summaryText: string;
}

export interface CommunityReport {
  id: string;
  type: 'barrier' | 'facility';
  icon: string;
  title: string;
  location: string;
  timeAgo: string;
  status: 'Verified' | 'Reported' | 'Pending Review';
  confidence: number;
  upvotes: number;
}

// 1. Demo Locations
export const DEMO_LOCATIONS: LocationOption[] = [
  // Mumbai Locations (Primary)
  { id: 'dadar-station', name: 'Dadar Railway Station', region: 'Mumbai', description: 'Central suburban transit hub with multi-level pedestrian footbridges' },
  { id: 'matunga-station', name: 'Matunga Railway Station', region: 'Mumbai', description: 'Heritage suburban station connecting King\'s Circle commercial strip' },
  { id: 'shivaji-park', name: 'Shivaji Park', region: 'Mumbai', description: 'Large public civic grounds, sports tracks & wide perimeter walkways' },
  { id: 'siddhivinayak-temple', name: 'Siddhivinayak Temple', region: 'Mumbai', description: 'Major spiritual pilgrimage landmark with high pedestrian footfall' },
  { id: 'bandra-station', name: 'Bandra Railway Station', region: 'Mumbai', description: 'Western suburban transit center with crowded skywalk networks' },
  { id: 'bkc', name: 'Bandra Kurla Complex', region: 'Mumbai', description: 'Financial central business district with modern wide footpaths' },
  { id: 'kurla-station', name: 'Kurla Railway Station', region: 'Mumbai', description: 'Critical junction connecting harbor and central rail transit lines' },
  { id: 'mumbai-university', name: 'Mumbai University, Kalina', region: 'Mumbai', description: 'Large educational campus with internal pedestrian tree-lined avenues' },
  { id: 'andheri-station', name: 'Andheri Railway Station', region: 'Mumbai', description: 'Heavy metro & suburban interchange with multi-tiered escalators' },
  { id: 'powai-lake', name: 'Powai Lake', region: 'Mumbai', description: 'Lakeside recreational promenade and jogging concourse' },
  { id: 'iit-bombay', name: 'IIT Bombay', region: 'Mumbai', description: 'Premier academic campus with accessible ramps and designated pathways' },
  { id: 'thane-station', name: 'Thane Railway Station', region: 'Mumbai', description: 'Eastern suburban hub with high-density commuter platforms' },
  { id: 'kalyan-station', name: 'Kalyan Railway Station', region: 'Mumbai', description: 'Outer metropolitan multimodal rail terminal' },
  { id: 'csmt', name: 'Chhatrapati Shivaji Maharaj Terminus', region: 'Mumbai', description: 'UNESCO World Heritage central rail terminus with subterranean subways' },
  { id: 'gateway-of-india', name: 'Gateway of India', region: 'Mumbai', description: 'Iconic harbor monument and tourist esplanade at Apollo Bunder' },
  { id: 'churchgate-station', name: 'Churchgate Railway Station', region: 'Mumbai', description: 'South Mumbai terminus serving corporate Nariman Point' },
  { id: 'marine-drive', name: 'Marine Drive', region: 'Mumbai', description: '3.6 km seaside boulevard with continuous sea-facing promenade' },

  // Other Indian Cities (Testing)
  { id: 'pune-station', name: 'Pune Railway Station', region: 'Other Metro', description: 'Pune city central railway junction' },
  { id: 'bengaluru-majestic', name: 'Bengaluru Majestic', region: 'Other Metro', description: 'Kempegowda Bus Station & Metro Interchange' },
  { id: 'delhi-connaught-place', name: 'Delhi Connaught Place', region: 'Other Metro', description: 'Radial Georgian-style circular commercial hub in Central Delhi' },
  { id: 'hyderabad-hitech-city', name: 'Hyderabad Hitech City', region: 'Other Metro', description: 'Technology hub with elevated pedestrian skywalks in Cyberabad' },
];

// 2. Accessibility Preferences
export const ACCESSIBILITY_PREFERENCES: AccessibilityPreference[] = [
  {
    id: 'wheelchair',
    label: 'Wheelchair user',
    iconName: 'Accessibility',
    priorities: ['0 stairs / 100% step-free', 'Max 5% gentle slopes', 'Zero physical barriers', 'Accessible ramps & wide entrances', 'Controlled crossings'],
    description: 'Prioritizes step-free paths, low gradient slopes, elevator access, and curb cut ramps.'
  },
  {
    id: 'reduced-mobility',
    label: 'Reduced mobility',
    iconName: 'Footprints',
    priorities: ['Fewer or no stairs', 'Low slopes & handrails', 'Minimal obstacles', 'Step-free alternatives', 'Safe pedestrian crossings'],
    description: 'Designed for users with crutches, braces, or limited walking stamina.'
  },
  {
    id: 'elderly',
    label: 'Elderly user',
    iconName: 'UserCheck',
    priorities: ['Fewer stairs', 'Lower slope gradients', 'Shorter walking bursts with benches', 'Well-signalized pedestrian crossings'],
    description: 'Prioritizes gradual inclines, resting spots, shaded walks, and safe traffic crossings.'
  },
  {
    id: 'visual-impairment',
    label: 'Visual impairment',
    iconName: 'Eye',
    priorities: ['Audible / tactile safe crossings', 'Simpler linear routes', 'Fewer complex multi-lane intersections', 'Tactile paving infrastructure'],
    description: 'Focuses on tactile ground indicators, predictable walkway geometry, and low-traffic crosswalks.'
  },
  {
    id: 'stroller',
    label: 'Caregiver with stroller',
    iconName: 'Heart',
    priorities: ['No step curbs', 'Wide sidewalks (>1.2m)', 'Smooth paving', 'Elevator & ramp routing'],
    description: 'Avoids turnstiles, stepped footbridges, and steep stairways for smooth wheeled transport.'
  },
  {
    id: 'none',
    label: 'No accessibility preference',
    iconName: 'Navigation',
    priorities: ['Shortest total distance', 'Direct geometric route', 'Standard city sidewalks'],
    description: 'Calculates standard shortest walking routes without accessibility constraints.'
  }
];

// 3. Predefined Benchmark Scenarios
export const BENCHMARK_SCENARIOS: Record<string, RouteScenarioData> = {
  'Dadar Railway Station → Shivaji Park': {
    normal: {
      distance: 2.8,
      time: 34,
      stairs: 3,
      maxSlope: 11,
      barriers: 6,
      unsafeCrossings: 3
    },
    accessible: {
      distance: 3.1,
      time: 39,
      stairs: 0,
      maxSlope: 5,
      barriers: 1,
      unsafeCrossings: 1
    },
    normalSteps: [
      { id: 'n1', title: 'Dadar Station Foot Overbridge', type: 'stair', detail: '38 steep stairs over central rail tracks with broken handrail' },
      { id: 'n2', title: 'Ranade Road Crossing', type: 'unsafe_crossing', detail: 'Unsignalized chaotic 4-lane crossing with moving bus traffic' },
      { id: 'n3', title: 'Dr. Bhalerao Marg Footpath', type: 'barrier', detail: '3 utility junction boxes & broken pavement slab obstructing sidewalk' },
      { id: 'n4', title: 'Shivaji Park Southern Gate', type: 'stair', detail: '2 concrete entrance steps without curb ramp' }
    ],
    accessibleSteps: [
      { id: 'a1', title: 'Station West Grade Concourse', type: 'ramp', detail: 'Grade-level elevator to concourse ramp with 4.2% slope' },
      { id: 'a2', title: 'Gokhale Road Signalized Crosswalk', type: 'accessible_crossing', detail: 'Pelican push-button crossing with audible countdown & curb cuts' },
      { id: 'a3', title: 'Cadell Road Continuous Sidewalk', type: 'smooth_footpath', detail: 'Wide 2.2m unobstructed concrete sidewalk with tactile paving' },
      { id: 'a4', title: 'Shivaji Park Main Accessible Gate', type: 'ramp', detail: 'Level entrance with rubberized threshold ramp' }
    ],
    whyChanged: [
      'Avoided 3 stair sections across station footbridges',
      'Reduced maximum slope from 11% → 5%',
      'Avoided 5 reported barriers (pavement breaks & utility boxes)',
      'Reduced unsafe crossings from 3 → 1 with signalized Pelican crosswalks',
      'Added 300 m to journey to ensure continuous step-free passage'
    ],
    summaryText: 'The accessible route adds 300m and 5 minutes, but eliminates all 3 stair flights and 5 high-friction obstacles.'
  },

  'Bandra Railway Station → Bandra Kurla Complex': {
    normal: {
      distance: 4.2,
      time: 51,
      stairs: 4,
      maxSlope: 10,
      barriers: 7,
      unsafeCrossings: 4
    },
    accessible: {
      distance: 4.7,
      time: 57,
      stairs: 0,
      maxSlope: 5,
      barriers: 2,
      unsafeCrossings: 2
    },
    normalSteps: [
      { id: 'n1', title: 'Bandra East Skywalk Stairs', type: 'stair', detail: '42 metal stairs connecting skywalk platform' },
      { id: 'n2', title: 'Kalanagar Junction Flyover Ramp', type: 'unsafe_crossing', detail: 'High-speed freeway merge crossing with no pedestrian phase' },
      { id: 'n3', title: 'BKC Connector Underpass', type: 'barrier', detail: 'Construction debris and steep 10% slope approach' },
      { id: 'n4', title: 'G Block Commercial Entrance', type: 'barrier', detail: 'High curb barrier without dropped curb' }
    ],
    accessibleSteps: [
      { id: 'a1', title: 'Bandra East Station Lift Exit', type: 'ramp', detail: 'Operational hydraulic elevator to ground concourse' },
      { id: 'a2', title: 'Kalanagar Grade-Separated Crosswalk', type: 'accessible_crossing', detail: 'Dedicated pedestrian refuge island with tactile warning paving' },
      { id: 'a3', title: 'BKC Boulevard Protected Cycle/Walk Track', type: 'smooth_footpath', detail: 'Continuous barrier-free shared pathway with 4.8% max gradient' },
      { id: 'a4', title: 'BKC Accessible Campus Portal', type: 'ramp', detail: 'Automated wide sliding door entrance with zero threshold' }
    ],
    whyChanged: [
      'Bypassed 4 steep skywalk staircases via station ground elevator',
      'Reduced maximum slope from 10% → 5%',
      'Eliminated 5 major construction and curb barriers',
      'Replaced 2 dangerous freeway intersections with signal-controlled crosswalks',
      'Added 500 m to ensure dedicated protected pedestrian infrastructure'
    ],
    summaryText: 'The accessible route takes a 500m detour along BKC Boulevard, replacing crowded skywalk stairs with smooth ground-level ramps.'
  },

  'Andheri Railway Station → IIT Bombay': {
    normal: {
      distance: 5.6,
      time: 68,
      stairs: 5,
      maxSlope: 12,
      barriers: 8,
      unsafeCrossings: 4
    },
    accessible: {
      distance: 6.1,
      time: 74,
      stairs: 1,
      maxSlope: 6,
      barriers: 2,
      unsafeCrossings: 2
    },
    normalSteps: [
      { id: 'n1', title: 'Andheri Metro Interchange Bridge', type: 'stair', detail: 'Steep stair descent with missing tactile pavers' },
      { id: 'n2', title: 'JVLR Highway Median Crossing', type: 'unsafe_crossing', detail: 'Uncontrolled crossing across 6 lanes of heavy freight traffic' },
      { id: 'n3', title: 'Saki Naka Road Dug-Up Footpath', type: 'barrier', detail: 'Open trench excavation with temporary wooden planks' },
      { id: 'n4', title: 'Powai Hill Incline', type: 'barrier', detail: '12% steep hill gradient without resting benches' }
    ],
    accessibleSteps: [
      { id: 'a1', title: 'Andheri Metro Concourse Lift', type: 'ramp', detail: 'Working elevator with audio floor announcements' },
      { id: 'a2', title: 'JVLR Pedestrian Subway with Ramp', type: 'accessible_crossing', detail: 'Well-lit underpass with 1:12 compliant concrete ramp' },
      { id: 'a3', title: 'Adi Shankaracharya Marg Pathway', type: 'smooth_footpath', detail: 'Smooth paved sidewalk buffered by green belt from traffic' },
      { id: 'a4', title: 'IIT Bombay Main Gate Ramp', type: 'ramp', detail: 'Gentle 5.5% ramp with dual stainless steel handrails' }
    ],
    whyChanged: [
      'Avoided 4 out of 5 stair flights using station elevator and underpass ramps',
      'Cut maximum slope in half from 12% → 6%',
      'Removed 6 hazardous obstacles (trenching, open utility pits)',
      'Replaced dangerous highway median dash with signalized crossing',
      'Added 500 m to avoid high-incline ridges'
    ],
    summaryText: 'A 500m bypass route that trades hazardous highway crossings and steep hill climbs for a gentle, ramp-accessible corridor.'
  },

  'Chhatrapati Shivaji Maharaj Terminus → Gateway of India': {
    normal: {
      distance: 2.3,
      time: 28,
      stairs: 2,
      maxSlope: 9,
      barriers: 4,
      unsafeCrossings: 2
    },
    accessible: {
      distance: 2.6,
      time: 32,
      stairs: 0,
      maxSlope: 4,
      barriers: 1,
      unsafeCrossings: 1
    },
    normalSteps: [
      { id: 'n1', title: 'CSMT Subway Stairs', type: 'stair', detail: '24 stone steps down to underground pedestrian subway' },
      { id: 'n2', title: 'Dr. DN Road Colonnade Crossing', type: 'unsafe_crossing', detail: 'Unregulated heritage street crossing with high bus frequency' },
      { id: 'n3', title: 'Kala Ghoda Footpath Curb', type: 'barrier', detail: 'Broken stone kerb with 22cm drop to road' },
      { id: 'n4', title: 'Apollo Bunder Steps', type: 'stair', detail: 'Heritage basalt stone entrance steps' }
    ],
    accessibleSteps: [
      { id: 'a1', title: 'CSMT Ground Plaza Exit', type: 'smooth_footpath', detail: 'Direct grade-level exit towards Victoria Terminus garden' },
      { id: 'a2', title: 'Mahatma Gandhi Road Pelican Crossing', type: 'accessible_crossing', detail: 'Raised pedestrian zebra table with tactile indicator tiles' },
      { id: 'a3', title: 'Colaba Causeway Accessible Sidewalk', type: 'smooth_footpath', detail: 'Wide asphalt pavement with gentle 3.8% maximum gradient' },
      { id: 'a4', title: 'Gateway of India VIP Accessible Ramp', type: 'ramp', detail: 'Compliant gentle concrete ramp leading to harbor waterfront' }
    ],
    whyChanged: [
      'Avoided 2 heritage stair obstacles (CSMT subway & Apollo Bunder stone steps)',
      'Reduced maximum slope from 9% → 4%',
      'Avoided 3 high curbs and pavement fractures in Kala Ghoda',
      'Used raised pedestrian table crossings with tactile warning blocks',
      'Added 300 m along gentler, step-free heritage corridors'
    ],
    summaryText: 'Avoids subterranean pedestrian subway stairs and cobblestone hazards by navigating the flat, paved Colaba heritage esplanade.'
  },

  'Churchgate Railway Station → Marine Drive': {
    normal: {
      distance: 2.0,
      time: 25,
      stairs: 2,
      maxSlope: 8,
      barriers: 4,
      unsafeCrossings: 2
    },
    accessible: {
      distance: 2.3,
      time: 29,
      stairs: 0,
      maxSlope: 4,
      barriers: 1,
      unsafeCrossings: 1
    },
    normalSteps: [
      { id: 'n1', title: 'Churchgate Subway Pedestrian Descent', type: 'stair', detail: 'Steep 28-step flight leading beneath Veer Nariman Road' },
      { id: 'n2', title: 'Madame Cama Road Crossing', type: 'unsafe_crossing', detail: 'Fast-moving 4-lane arterial road without pedestrian signal' },
      { id: 'n3', title: 'Oval Maidan Perimeter Path', type: 'barrier', detail: 'Tree root heaving and broken asphalt path' },
      { id: 'n4', title: 'Marine Drive Promenade Kerb', type: 'stair', detail: 'High 25cm promenade granite border without dropped ramp' }
    ],
    accessibleSteps: [
      { id: 'a1', title: 'Churchgate West Ground Ramp Exit', type: 'ramp', detail: 'Dedicated step-free station ramp exit with gentle 3.5% incline' },
      { id: 'a2', title: 'Veer Nariman Signalized Pedestrian Phase', type: 'accessible_crossing', detail: 'Wide crosswalk with dedicated 30-second pedestrian light' },
      { id: 'a3', title: 'Sundatta Hall Concourse Pathway', type: 'smooth_footpath', detail: 'Smooth paved surface with zero curb drops' },
      { id: 'a4', title: 'Marine Drive Accessible Ramp Portal', type: 'ramp', detail: 'Smooth concrete ramp directly on to the sea-facing promenade' }
    ],
    whyChanged: [
      'Completely eliminated 2 stair hazards (Churchgate subway & promenade curb)',
      'Halved maximum slope from 8% → 4%',
      'Avoided 3 unpaved sections and root heave hazards',
      'Replaced uncontrolled crossing with timed pedestrian light',
      'Added 300 m to use modern ramp portals'
    ],
    summaryText: 'Step-free transit from Churchgate directly to the iconic Marine Drive promenade via smooth grade-level crosswalks.'
  },

  'Matunga Railway Station → Dadar Railway Station': {
    normal: {
      distance: 2.1,
      time: 26,
      stairs: 3,
      maxSlope: 10,
      barriers: 5,
      unsafeCrossings: 3
    },
    accessible: {
      distance: 2.5,
      time: 31,
      stairs: 0,
      maxSlope: 5,
      barriers: 1,
      unsafeCrossings: 1
    },
    normalSteps: [
      { id: 'n1', title: 'Matunga Station East FOB', type: 'stair', detail: '32 concrete steps over central line' },
      { id: 'n2', title: 'Lakhamsi Napoo Road', type: 'barrier', detail: 'Parked two-wheelers blocking narrow pavement' },
      { id: 'n3', title: 'Tilak Bridge Crossing', type: 'unsafe_crossing', detail: 'Narrow bridge walkway with oncoming truck draft' }
    ],
    accessibleSteps: [
      { id: 'a1', title: 'Matunga West Level Concourse', type: 'ramp', detail: 'Wide ground gate with non-slip tactile tiles' },
      { id: 'a2', title: 'Bhandarkar Road Accessible Corridor', type: 'smooth_footpath', detail: 'Wide tree-shaded pedestrian sidewalk' },
      { id: 'a3', title: 'Dadar Station Level Entrance', type: 'ramp', detail: 'Direct platform 1 step-free access' }
    ],
    whyChanged: [
      'Bypassed 3 footbridge staircases',
      'Reduced maximum slope from 10% → 5%',
      'Avoided 4 vehicular obstruction barriers',
      'Avoided hazardous Tilak Bridge vehicular walkway',
      'Added 400 m along quiet residential boulevards'
    ],
    summaryText: 'Replaces narrow footbridge crossings with quiet, wide, tree-lined Matunga residential streets.'
  },

  'Kurla Railway Station → Mumbai University, Kalina': {
    normal: {
      distance: 3.4,
      time: 42,
      stairs: 3,
      maxSlope: 11,
      barriers: 6,
      unsafeCrossings: 4
    },
    accessible: {
      distance: 3.8,
      time: 48,
      stairs: 0,
      maxSlope: 5,
      barriers: 1,
      unsafeCrossings: 1
    },
    normalSteps: [
      { id: 'n1', title: 'Kurla West Market Steps', type: 'stair', detail: 'Crowded market stairs with vendor encroachment' },
      { id: 'n2', title: 'CST Road Crossing', type: 'unsafe_crossing', detail: 'High speed autorickshaw corridor without zebra lines' },
      { id: 'n3', title: 'Kalina Waterlogging Dip', type: 'barrier', detail: 'Cracked concrete dip with standing puddle' }
    ],
    accessibleSteps: [
      { id: 'a1', title: 'Kurla West New Skywalk Lift', type: 'ramp', detail: 'Heavy-duty station elevator' },
      { id: 'a2', title: 'SCLR Signalized Crosswalk', type: 'accessible_crossing', detail: 'Grade crossing with audio-visual beacon' },
      { id: 'a3', title: 'University Campus Gate 3 Ramp', type: 'ramp', detail: 'Standard 1:12 slope ramp with tactile studs' }
    ],
    whyChanged: [
      'Eliminated 3 market stair obstacles',
      'Reduced maximum slope from 11% → 5%',
      'Avoided 5 uneven pavement and waterlogged dips',
      'Reduced unsafe crossings from 4 → 1',
      'Added 400 m along the newly paved Kalina university corridor'
    ],
    summaryText: 'Safely bypasses congested Kurla market obstacles via the signalized Santacruz-Chembur Link corridor.'
  },

  'Thane Railway Station → Kalyan Railway Station': {
    normal: {
      distance: 18.5,
      time: 230,
      stairs: 6,
      maxSlope: 12,
      barriers: 10,
      unsafeCrossings: 5
    },
    accessible: {
      distance: 19.8,
      time: 248,
      stairs: 1,
      maxSlope: 6,
      barriers: 2,
      unsafeCrossings: 2
    },
    normalSteps: [
      { id: 'n1', title: 'Thane Station Deck Stairs', type: 'stair', detail: '45 steps down from SATIS elevated bus deck' },
      { id: 'n2', title: 'Kalyan Highway Junction', type: 'unsafe_crossing', detail: 'Multimodal truck crossing with zero pedestrian signals' },
      { id: 'n3', title: 'Ulhas River Bridge Approach', type: 'barrier', detail: 'Narrow curb with uneven metal expansion joints' }
    ],
    accessibleSteps: [
      { id: 'a1', title: 'Thane SATIS Elevator Portal', type: 'ramp', detail: 'Elevator access to ground transit bays' },
      { id: 'a2', title: 'Eastern Express Highway Service Road', type: 'smooth_footpath', detail: 'Dedicated barrier-separated walking track' },
      { id: 'a3', title: 'Kalyan Station West Accessible Ramp', type: 'ramp', detail: 'Broad tactile ramp connecting main booking hall' }
    ],
    whyChanged: [
      'Avoided 5 out of 6 railway bridge stair climbs',
      'Halved maximum slope from 12% → 6%',
      'Avoided 8 roadside expansion joints and debris zones',
      'Reduced unsafe highway crossings from 5 → 2',
      'Added 1.3 km along protected suburban service roads'
    ],
    summaryText: 'Inter-suburban route connecting two major outer terminals via step-free service avenues.'
  },

  'Powai Lake → IIT Bombay': {
    normal: {
      distance: 2.1,
      time: 26,
      stairs: 2,
      maxSlope: 9,
      barriers: 4,
      unsafeCrossings: 2
    },
    accessible: {
      distance: 2.4,
      time: 30,
      stairs: 0,
      maxSlope: 4,
      barriers: 1,
      unsafeCrossings: 1
    },
    normalSteps: [
      { id: 'n1', title: 'Promenade Embankment Steps', type: 'stair', detail: 'Uneven stone stairs leading from lake to street level' },
      { id: 'n2', title: 'JVLR Powai Crossing', type: 'unsafe_crossing', detail: 'Heavy vehicle corridor with no dropped curb' }
    ],
    accessibleSteps: [
      { id: 'a1', title: 'Powai Garden Accessible Ramp', type: 'ramp', detail: 'Gently graded stone ramp with 4% slope' },
      { id: 'a2', title: 'Hiranandani Link Signalized Crossing', type: 'accessible_crossing', detail: 'Raised pedestrian speed table with textured paving' }
    ],
    whyChanged: [
      'Avoided 2 lake embankment stair sections',
      'Reduced maximum slope from 9% → 4%',
      'Avoided 3 root heave and construction barriers',
      'Replaced uncontrolled JVLR crossing with safe pedestrian table',
      'Added 300 m along the wide lakeside boulevard'
    ],
    summaryText: 'Connects scenic Powai waterfront directly to IIT campus without steep embankment stairs.'
  },

  'Siddhivinayak Temple → Dadar Railway Station': {
    normal: {
      distance: 2.4,
      time: 30,
      stairs: 3,
      maxSlope: 10,
      barriers: 5,
      unsafeCrossings: 3
    },
    accessible: {
      distance: 2.7,
      time: 35,
      stairs: 0,
      maxSlope: 5,
      barriers: 1,
      unsafeCrossings: 1
    },
    normalSteps: [
      { id: 'n1', title: 'Temple Gate Security Stairs', type: 'stair', detail: 'Steep barricaded pedestrian steps' },
      { id: 'n2', title: 'Sayani Road Intersection', type: 'unsafe_crossing', detail: 'Congested junction with lack of pedestrian phase' }
    ],
    accessibleSteps: [
      { id: 'a1', title: 'Siddhivinayak South Accessible Gate', type: 'ramp', detail: 'Grade-level entrance with wheelchair check-in ramp' },
      { id: 'a2', title: 'S.K. Bole Road Signalized Crossing', type: 'accessible_crossing', detail: 'Dedicated crossing with audible signals' }
    ],
    whyChanged: [
      'Avoided 3 barricaded crowd control stairways',
      'Reduced maximum slope from 10% → 5%',
      'Bypassed 4 narrow footpath obstructions on Sayani Road',
      'Reduced unsafe crossings from 3 → 1',
      'Added 300 m for smooth, continuous sidewalk clearance'
    ],
    summaryText: 'Pilgrimage route utilizing designated accessible temple gates and signalized South Dadar boulevards.'
  }
};

// 4. Dynamic Route Generator for any arbitrary combination
export function getRouteComparison(
  startName: string,
  destName: string,
  prefId: AccessibilityPreferenceId = 'wheelchair'
): RouteScenarioData {
  const directKey = `${startName} → ${destName}`;
  const reverseKey = `${destName} → ${startName}`;

  if (BENCHMARK_SCENARIOS[directKey]) {
    return adjustForPreference(BENCHMARK_SCENARIOS[directKey], prefId);
  }
  if (BENCHMARK_SCENARIOS[reverseKey]) {
    return adjustForPreference(BENCHMARK_SCENARIOS[reverseKey], prefId);
  }

  // Generate realistic, consistent pseudo-data for any selected locations
  const hash = Math.abs(
    (startName + destName).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  );

  const baseDist = Number((2.0 + (hash % 40) / 10).toFixed(1)); // 2.0 - 6.0 km
  const baseMins = Math.round(baseDist * 12 + (hash % 6));
  const normalStairs = 2 + (hash % 4); // 2 - 5
  const normalSlope = 8 + (hash % 6); // 8 - 13%
  const normalBarriers = 4 + (hash % 6); // 4 - 9
  const normalCrossings = 2 + (hash % 3); // 2 - 4

  const addedDistKm = 0.2 + (hash % 4) * 0.1; // +0.2 to +0.5 km
  const addedTimeMin = Math.round(addedDistKm * 14 + 1); // +3 to +7 mins

  const accessibleDist = Number((baseDist + addedDistKm).toFixed(1));
  const accessibleTime = baseMins + addedTimeMin;
  const accessibleStairs = prefId === 'wheelchair' || prefId === 'stroller' ? 0 : Math.max(0, normalStairs - 3);
  const accessibleSlope = 4 + (hash % 2); // 4 - 5%
  const accessibleBarriers = Math.max(1, Math.floor(normalBarriers / 4));
  const accessibleCrossings = 1;

  const baseData: RouteScenarioData = {
    normal: {
      distance: baseDist,
      time: baseMins,
      stairs: normalStairs,
      maxSlope: normalSlope,
      barriers: normalBarriers,
      unsafeCrossings: normalCrossings
    },
    accessible: {
      distance: accessibleDist,
      time: accessibleTime,
      stairs: accessibleStairs,
      maxSlope: accessibleSlope,
      barriers: accessibleBarriers,
      unsafeCrossings: accessibleCrossings
    },
    normalSteps: [
      { id: 'gn1', title: `${startName} Footpath`, type: 'stair', detail: `${normalStairs} elevated steps without ramp` },
      { id: 'gn2', title: 'Urban Corridor Arterial', type: 'unsafe_crossing', detail: 'Multi-lane traffic with no pedestrian signals' },
      { id: 'gn3', title: 'Approach Walkway', type: 'barrier', detail: `${normalBarriers} obstructions including broken slabs and utility poles` },
      { id: 'gn4', title: `${destName} Entry`, type: 'barrier', detail: 'High curb threshold without ramp' }
    ],
    accessibleSteps: [
      { id: 'ga1', title: `${startName} Step-Free Portal`, type: 'ramp', detail: 'Graded ramp with 4.5% incline and handrails' },
      { id: 'ga2', title: 'Protected Signalized Crossing', type: 'accessible_crossing', detail: 'Audible pelican crossing with dropped curbs' },
      { id: 'ga3', title: 'Smooth Paved Bypass', type: 'smooth_footpath', detail: 'Continuous wide concrete walkway with zero obstacles' },
      { id: 'ga4', title: `${destName} Accessible Entrance`, type: 'ramp', detail: 'Level automatic sliding door with tactile guide' }
    ],
    whyChanged: [
      `Avoided ${normalStairs - accessibleStairs} stair sections along the route`,
      `Reduced maximum slope from ${normalSlope}% → ${accessibleSlope}%`,
      `Bypassed ${normalBarriers - accessibleBarriers} community-reported pedestrian obstacles`,
      `Reduced unsafe crossings from ${normalCrossings} → ${accessibleCrossings}`,
      `Added ${Math.round(addedDistKm * 1000)} m to ensure a smooth, certified barrier-free path`
    ],
    summaryText: `The accessible route prioritizes safety and step-free convenience, adding ${Math.round(addedDistKm * 1000)}m while removing major barriers.`
  };

  return adjustForPreference(baseData, prefId);
}

function adjustForPreference(data: RouteScenarioData, prefId: AccessibilityPreferenceId): RouteScenarioData {
  if (prefId === 'none') {
    return {
      ...data,
      accessible: { ...data.normal },
      accessibleSteps: [...data.normalSteps],
      whyChanged: ['No accessibility constraints selected. Displaying direct shortest distance route.'],
      summaryText: 'Standard route displayed without accessibility filters.'
    };
  }

  if (prefId === 'elderly') {
    return {
      ...data,
      accessible: {
        ...data.accessible,
        time: data.accessible.time + 3,
        maxSlope: 4
      }
    };
  }

  if (prefId === 'visual-impairment') {
    return {
      ...data,
      accessible: {
        ...data.accessible,
        unsafeCrossings: 0,
        barriers: 0
      },
      whyChanged: [
        'Prioritized audible signalized crosswalks and tactile paving',
        'Avoided chaotic multi-leg roundabouts and median dashes',
        'Bypassed all low-hanging or ground-level tripping hazards',
        ...data.whyChanged.slice(3)
      ]
    };
  }

  return data;
}

// 5. Community-Reported Conditions (Demo Data)
export const COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'cr-1',
    type: 'barrier',
    icon: 'AlertTriangle',
    title: 'Broken footpath & exposed rebar',
    location: 'Dadar West, near Kabutar Khana',
    timeAgo: 'Reported 2 days ago',
    status: 'Reported',
    confidence: 94,
    upvotes: 42
  },
  {
    id: 'cr-2',
    type: 'facility',
    icon: 'Accessibility',
    title: 'New compliant curb ramp installed',
    location: 'Bandra West, Hill Road crossing',
    timeAgo: 'Verified 5 days ago',
    status: 'Verified',
    confidence: 98,
    upvotes: 67
  },
  {
    id: 'cr-3',
    type: 'barrier',
    icon: 'AlertTriangle',
    title: 'Temporary storm drain excavation',
    location: 'Andheri East, MV Road',
    timeAgo: 'Reported 1 day ago',
    status: 'Reported',
    confidence: 88,
    upvotes: 29
  },
  {
    id: 'cr-4',
    type: 'facility',
    icon: 'CheckCircle2',
    title: 'Step-free entrance with tactile tiles',
    location: 'BKC, Avenue 3 Commercial Hub',
    timeAgo: 'Verified 3 days ago',
    status: 'Verified',
    confidence: 99,
    upvotes: 84
  }
];
