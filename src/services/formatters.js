/**
 * Format runtime from minutes to hours and minutes
 * @param {number} minutes - Runtime in minutes
 * @returns {string} Formatted runtime (e.g., "2h 15m")
 */
export const formatRuntime = (minutes) => {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

/**
 * Extract year from date string
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {string|number} Year or "N/A"
 */
export const getYear = (date) => {
  return date ? new Date(date).getFullYear() : "N/A";
};

/**
 * Format content rating for display
 * @param {string} rating - Content rating code
 * @returns {string} Formatted rating
 */
export const formatContentRating = (rating) => {
  if (!rating || rating === "NR" || rating === "TV-NR") {
    return "Not Rated";
  }
  return rating;
};

/**
 * Get detailed description for a content rating
 * @param {string} rating - Content rating code
 * @returns {string} Rating description
 */
export const getRatingDescription = (rating) => {
  const descriptions = {
    G: "General Audiences - All ages admitted",
    PG: "Parental Guidance Suggested - Some material may not be suitable for children",
    "PG-13":
      "Parents Strongly Cautioned - Some material may be inappropriate for children under 13",
    R: "Restricted - Under 17 requires accompanying parent or adult guardian",
    "NC-17": "Adults Only - No one 17 and under admitted",
    "TV-Y": "All Children - Appropriate for all children",
    "TV-Y7": "Directed to Older Children - Suitable for ages 7 and up",
    "TV-G": "General Audience - Suitable for all ages",
    "TV-PG":
      "Parental Guidance Suggested - May contain material unsuitable for younger children",
    "TV-14":
      "Parents Strongly Cautioned - May be unsuitable for children under 14",
    "TV-MA": "Mature Audience Only - Specifically designed for adults",
    NR: "Not Rated",
    "TV-NR": "Not Rated",
  };
  return descriptions[rating] || "Not Rated";
};

/**
 * Format number of seasons for display
 * @param {number} count - Number of seasons
 * @returns {string} Formatted seasons text
 */
export const formatSeasons = (count) => {
  if (!count) return "? Season";
  return `${count} Season${count !== 1 ? "s" : ""}`;
};

/**
 * Format release date to readable format
 * @param {string} date - Date string
 * @returns {string} Formatted date (e.g., "January 15, 2024")
 */
export const formatReleaseDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format currency to readable format
 * @param {number} amount - Amount in dollars
 * @returns {string} Formatted currency (e.g., "$150M")
 */
export const formatCurrency = (amount) => {
  if (!amount) return "N/A";
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(0)}M`;
  }
  return `$${amount.toLocaleString()}`;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text with ellipsis
 */
export const truncateText = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};
