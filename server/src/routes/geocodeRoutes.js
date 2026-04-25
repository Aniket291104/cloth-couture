import express from 'express';

const router = express.Router();

const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

router.get('/reverse', async (req, res) => {
  const lat = toFiniteNumber(req.query.lat);
  const lon = toFiniteNumber(req.query.lon);

  if (lat === null || lon === null || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({ message: 'Valid latitude and longitude are required.' });
  }

  try {
    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(lat),
      lon: String(lon),
      addressdetails: '1',
      zoom: '18',
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en-IN,en;q=0.9',
        'User-Agent': 'ClothCouture/1.0 support@clothcouture.com',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Reverse geocoding service failed.' });
    }

    const data = await response.json();
    const address = data.address || {};
    const streetParts = [
      address.house_number,
      address.road,
      address.neighbourhood || address.suburb,
      address.city_district,
    ].filter(Boolean);

    res.json({
      address: streetParts.join(', ') || data.display_name || '',
      city: address.city || address.town || address.village || address.county || '',
      postalCode: address.postcode || '',
      country: address.country || 'India',
      displayName: data.display_name || '',
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(502).json({ message: 'Reverse geocoding failed. Please enter address manually.' });
  }
});

export default router;
