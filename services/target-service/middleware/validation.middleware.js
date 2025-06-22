// src/middleware/validation.middleware.js

export function validateTarget(req, res, next) {
  const {
    title,
    description,
    category,
    difficulty,
    placeName,
    latitude,
    longitude,
    radius,
    deadline
  } = req.body;

  // 1) TITLE
  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Title is verplicht.' });
  }

  // 2) Deadline (blijft verplicht en in de toekomst)
  if (!deadline) {
    return res.status(400).json({ message: 'Deadline is verplicht.' });
  }
  const dl = new Date(deadline);
  if (isNaN(dl.getTime())) {
    return res.status(400).json({ message: 'Deadline moet een geldige datum (ISO-format) zijn.' });
  }
  const nu = new Date();
  if (dl <= nu) {
    return res.status(400).json({ message: 'Deadline moet in de toekomst liggen.' });
  }

  // 3) Liefst minstens één zoekoptie: либо 'placeName' либо (latitude+longitude+radius)
  const hasPlaceName = typeof placeName === 'string' && placeName.trim() !== '';
  const hasCoords = latitude !== undefined && longitude !== undefined && radius !== undefined;

  if (!hasPlaceName && !hasCoords) {
    return res.status(400).json({
      message: 'Je moet óf een placeName opgeven, óf latitude, longitude en radius.'
    });
  }

  // 4) Als coördinaten + radius zijn opgegeven, controleer ze valid
  if (hasCoords) {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const rad = parseInt(radius, 10);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ message: 'Latitude en longitude moeten getallen zijn.' });
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ message: 'Latitude/longitude buiten bereik.' });
    }
    if (isNaN(rad) || rad <= 0) {
      return res.status(400).json({ message: 'Radius moet een positief getal zijn.' });
    }
  }

  // 5) Als placeName is opgegeven, mag latitude+longitude+radius optioneel zijn.
  //    (We laten dus de check hierboven toe, en vallen door indien hasCoords = false.)
  //    Je kunt hier eventueel nog extra validatie op lengte/string-pattern doen.

  // 6) IMAGE (Multer check)
  //    We verwachten dat Multer al klaagt als er geen bestand is bij 'image'
  //    Je kunt hier desgewenst checken op req.file, maar dat doen we meestal in de controller zelf.

  next();
}
