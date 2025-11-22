export interface Sector {
  label: string;
  icon: string;
  angle: number;
}

export interface RadarChartColors {
  full: string;       // dark green (9-10)
  medium: string;     // light green (7-8)
  low: string;        // yellow (4-6)
  lowest: string;     // red (0-3)
  inactive: string;   // gray for inactive bars
  primary: string;    // primary color for borders, guidelines etc
  background: string; // background color for center circle
  labelBackground: string; // background for labels
  iconBackground: string; // background for icon badges
}

// Default color scheme matching the original design
export const DEFAULT_RADAR_COLORS: RadarChartColors = {
  full: "#3D5241",       // dark green (9-10)
  medium: "#7C987C",     // light green (7-8)
  low: "#FFAD4C",        // yellow (4-6)
  lowest: "#FF8B7B",     // red (0-3)
  inactive: "#E0E0E0",   // gray for inactive bars
  primary: "#3D5241",    // primary color for borders, guidelines etc
  background: "#F6E2CA", // background color for center circle
  labelBackground: "#FFFFFF", // background for labels
  iconBackground: "#F6E2CA", // background for icon badges
};
