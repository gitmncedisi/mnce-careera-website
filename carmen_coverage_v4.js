const express = require('express');
const fetch = require('node-fetch'); // Ensure you have node-fetch installed
const app = express();
app.use(express.json()); // For parsing application/json

// Helper function to validate coordinates
function isValidCoordinate(coord, type) {
    // Check if coord is a number, not NaN, and within valid ranges
    if (typeof coord !== 'number' || isNaN(coord)) {
        return `${type} must be a valid number.`;
    }

    if (type === 'latitude' && (coord < -90 || coord > 90)) {
        return `${type} must be between -90 and 90.`;
    }

    if (type === 'longitude' && (coord < -180 || coord > 180)) {
        return `${type} must be between -180 and 180.`;
    }

    return null; // No error
}

// Additional helper function to check coordinate signs
function checkCoordinateSigns(lat, lng) {
    // If latitude is missing a negative sign for the southern hemisphere
    if (lat > 0) {
        return "Latitude value is missing a negative sign. Example of correct format: (-32.45761034, 22.93446926).";
    }

    // If longitude has a negative sign for the eastern hemisphere
    if (lng < 0) {
        return "Please check your coordinates. Longitude has a negative sign. Example of correct format: (-32.45761034, 22.93446926).";
    }

    return null; // No error
}

// POST endpoint for checking coverage
app.post('/check-coverage', async (req, res) => {
    const { latitude, longitude, address, medium } = req.body;

    // Convert latitude and longitude to numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Strict validation for latitude and longitude
    const latError = isValidCoordinate(lat, 'latitude');
    const lngError = isValidCoordinate(lng, 'longitude');

    // Additional sign checks for coordinates
    const signError = checkCoordinateSigns(lat, lng);

    // Check if necessary inputs are provided and if coordinates are valid
    if (!latitude || !longitude || !medium) {
        return res.status(400).json({
            error: "Latitude, longitude, and connection medium are required fields."
        });
    }
    if (latError || lngError || signError) {
        return res.status(400).json({
            error: latError || lngError || signError // Return whichever error is present
        });
    }

    try {
        // Dummy URL for WFS request to GeoServer
        // Replace 'workspace', 'layer_name' with your GeoServer details
        const wfsUrl = `http://localhost:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=workspace:layer_name&outputFormat=application/json&bbox=${lng},${lat},${medium}`;

        // Fetch data from GeoServer (WFS)
        const geoServerResponse = await fetch(wfsUrl);
        
        // Handle non-200 responses
        if (!geoServerResponse.ok) {
            return res.status(500).json({
                error: `GeoServer error: ${geoServerResponse.statusText}`
            });
        }

        const coverageData = await geoServerResponse.json();

        // If no features are returned by GeoServer, return a 'no coverage' message
        if (!coverageData.features || coverageData.features.length === 0) {
            return res.json({
                providers: [],
                message: "No coverage found for the selected medium."
            });
        }

        // Map through coverage data and extract relevant fields (dummy fields)
        const providers = coverageData.features.map(feature => ({
            provider: feature.properties.provider_name,   // Replace with actual property
            product: feature.properties.product_name,     // Replace with actual property
            price: feature.properties.price,              // Replace with actual property
            status: feature.properties.status             // Replace with actual property
        }));

        // Respond with the providers list
        return res.json({ providers });

    } catch (error) {
        console.error('Error fetching GeoServer data:', error);
        return res.status(500).json({
            error: 'An error occurred while fetching coverage data. Please try again later.'
        });
    }
});

// Dummy endpoint for 'selectPackage'
app.post('/select-package', (req, res) => {
    const { provider, product } = req.body;

    // Simulate a package selection action
    if (!provider || !product) {
        return res.status(400).json({ error: "Provider and product are required fields." });
    }

    // Here, you would normally save the selected package or perform some action
    return res.json({
        message: `Package ${product} from provider ${provider} has been successfully selected.`
    });
});

// Dummy endpoint for 'showMorePackages'
app.post('/show-more-packages', (req, res) => {
    const { provider } = req.body;

    // Simulate showing more packages for a given provider
    if (!provider) {
        return res.status(400).json({ error: "Provider is required." });
    }

    // Here, you would query your database or GeoServer for more packages
    //i want to add a loop that will loop through the product list that are available in this are, 
    // this loop must run against the package list for this products that is available that will return 
    const morePackages = [
        { product: 'Product 1', price: '100', status: 'Available' },
        { product: 'Product 2', price: '150', status: 'Available' }
    ];

    return res.json({
        provider,
        packages: morePackages
    });
});

// Set up a simple server on port 3000 (for example)
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
