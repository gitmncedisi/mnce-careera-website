document.getElementById('filterBtn').addEventListener('click', async function() {
    const lat = document.getElementById('latitude').value;
    const lng = document.getElementById('longitude').value;
    const address = document.getElementById('address').value;
    const medium = document.getElementById('medium').value;

    try {
        const response = await fetch('/check-coverage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: lat, longitude: lng, address, medium })
        });
        const data = await response.json();

        const resultDiv = document.getElementById('result');
        if (data.providers && data.providers.length > 0) {
            resultDiv.innerHTML = `<table>
                <thead>
                    <tr><th>Provider</th><th>Product</th><th>Price</th><th>Status</th></tr>
                </thead>
                <tbody>
                    ${data.providers.map(provider => `
                        <tr>
                            <td>${provider.provider}</td>
                            <td>${provider.product}</td>
                            <td>${provider.price}</td>
                            <td>${provider.status}</td>
                            <td><button onclick="showMorePackages('${provider.provider}')">Show More Packages</button></td>
                            <td><button onclick="selectPackage('${provider.provider}', '${provider.product}')">Select Package</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
        } else {
            resultDiv.innerHTML = 'No coverage found for the selected medium.';
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

function showMorePackages(provider) {
    // Handle logic to show more packages
    console.log('Show more packages for:', provider);
}

function selectPackage(provider, product) {
    // Handle package selection logic
    console.log('Selected package:', product, 'from provider:', provider);
}
