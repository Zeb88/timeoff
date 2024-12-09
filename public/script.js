const countryStates = {
    "Australia": ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Northern Territory", "Australian Capital Territory"],
    "Canada": ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan"],
    "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
    "United States": ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
    "New Zealand": ["Northland", "Auckland", "Waikato", "Bay of Plenty", "Gisborne", "Hawke's Bay", "Taranaki", "Manawatu-Whanganui", "Wellington", "Tasman", "Nelson", "Marlborough", "West Coast", "Canterbury", "Otago", "Southland"]
};

document.getElementById('leaveForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const country = document.getElementById('country').value;
    const state = document.getElementById('state').value;
    const year = document.getElementById('year').value;
    const resultDiv = document.getElementById('result');

    marked.setOptions({
        gfm: true,
        tables: true,
        linkify: true
    });

    resultDiv.innerHTML = 'Loading...';

    try {
        const response = await fetch('/optimize-leave', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ country, state, year }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        resultDiv.innerHTML = marked.parse(data); // Use marked to parse data;
    } catch (error) {
        console.error('Error:', error);
        resultDiv.innerHTML = 'An error occurred while fetching data';
    }
});

document.getElementById("country").addEventListener("change", function () {
    const country = this.value;
    const stateSelect = document.getElementById("state");
    
    // Clear existing options
    stateSelect.innerHTML = '<option value="" disabled selected>Select State</option>';

    if (country && countryStates[country]) {
        countryStates[country].forEach(state => {
            const option = document.createElement("option");
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
    }
});

// Set the year selector dynamically
const yearInput = document.getElementById("year");
const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;

yearInput.min = currentYear;
yearInput.max = nextYear;
yearInput.value = currentYear; // Default to the current year

