
/**
 * Helper function to determine if text should be white or black based on background color
 * @param hexColor - The hex color to check (e.g. #FFFFFF)
 * @returns The appropriate text color (black or white)
 */
export function getContrastColor(hexColor: string): string {
  // Default to black if invalid color
  if (!hexColor || !hexColor.startsWith('#')) return '#000000';
  
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance - if light background use dark text, if dark background use light text
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
