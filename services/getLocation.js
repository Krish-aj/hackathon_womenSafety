/**
 * Reverse geocodes coordinates into an address using OpenStreetMap (Nominatim).
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>}
 */

// location get from log , lat
export async function getAddress(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "BackendGeocodingService/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      success: true,
      formattedAddress: data.display_name,
      details: data.address
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}