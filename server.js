// Import required modules
const express = require("express"); // Express framework for building web applications
const axios = require("axios"); // Axios for making HTTP requests
const rateLimit = require("express-rate-limit"); // Express-rate-limit for rate limiting requests
const storage = require("node-persist"); // Node-persist for persistent storage
require("dotenv").config(); // dotenv for loading environment variables

// Create an Express application
const app = express();
const port = 3000; // Define the port the server will listen on

// Set 'trust proxy' to true to allow express-rate-limit to accurately identify users
app.set('trust proxy', true);

// Initialize node-persist with a specific directory for storage
(async () => {
  await storage.init({
    dir: "cache", // Directory where data will be stored
    ttl: 2629800 * 1000, // 1 month time to live in milliseconds
  });
})();

// Create a rate limiter with a 1-hour window and a maximum of 1000 requests per window
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true, // Include rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Use the rate limiter middleware
app.use(limiter);

// Serve static files from the "public" directory
app.use(express.static("public"));

// Parse JSON bodies for incoming requests
app.use(express.json());

// Retrieve the Perplexity API key from the environment variables
const { PERPLEXITY_API_KEY } = process.env ?? {};
if (!PERPLEXITY_API_KEY) {
  // Throw an error if the API key is not set
  throw new Error("PERPLEXITY_API_KEY must be set in the environment");
}

// Function to generate the prompt template with placeholders
const promptTemplate = (country, state, year) =>
  `
    Create an optimized annual leave plan for workers in ${state}, ${country} for the year ${year}. The plan should maximize total days off by strategically combining public holidays with annual leave days. Include the following details:
    
    1. **Summary**: 
       - Provide a brief overview of the most efficient leave strategy.
       - State the total number of days off achievable and the annual leave days used.
    
    2. **Detailed Breakdown**:
       - Present the information in a clear, organized table with the following columns:
         - **Holiday Period**: Name or description of the period.
         - **Public Holidays**: Dates of official holidays during the period.
         - **Leave Dates**: Recommended annual leave dates to maximize time off.
         - **Total Days Off**: Number of consecutive days off achievable.
         - **Description**: A brief overview of the holiday period and opportunities.
    
    3. **State-Specific Considerations**:
       - Highlight any unique factors, such as regional holidays or local events, that can impact or enhance the leave strategy.
    
    4. **Holiday Ideas**:
       - Suggest possible activities, destinations, or experiences within ${state} for the planned holiday periods.
    
    Format the response using proper markdown for clarity and readability. Ensure appropriate spacing and structure, focusing on accuracy and an engaging presentation. Beware of legal annual leave days available in ${state} and ${country}.
    
    Example output structure:
    
    ## Annual Leave Optimization for ${state}, ${country} in ${year}

    **Legal Considerations**
    [Highlight any legal considerations, such as annual leave days available in ${state} and ${country}.]
    
    **Summary**  
    [Provide a brief summary highlighting the total days off and annual leave days used.]
    
    | Holiday Period | Public Holidays | Leave Dates       | Total Days Off | Description                    |
    |----------------|-----------------|-------------------|----------------|--------------------------------|
    | [Period Name]  | [Dates]         | [Leave Dates]     | [Number]       | [Brief description of period] |
    | [Period Name]  | [Dates]         | [Leave Dates]     | [Number]       | [Brief description of period] |
    
    **State-Specific Considerations**  
    [Describe any additional regional factors or opportunities.]
    
    **Holiday Ideas**  
    [Include suggestions for activities or destinations within ${state} during the planned periods.]
    `;

// Handle POST requests to the /optimize-leave endpoint
app.post("/optimize-leave", async (req, res) => {
  // Destructure the country, state, and year from the request body
  const { country, state, year } = req.body;

  // Construct a unique cache key using country, state, and year
  const cacheKey = `${country}-${state}-${year}`;

  try {
    // Attempt to retrieve a cached result using the cache key
    const cachedResult = await storage.getItem(cacheKey);
    
    // If a cached result exists, send it back to the client
    if (cachedResult) {
      return res.json(cachedResult);
    }

    // Define the API endpoint URL for the Perplexity AI service
    const url = "https://api.perplexity.ai/chat/completions";

    // Set up the options for the API request
    const options = {
      method: "POST", // HTTP method
      url, // API endpoint
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`, // Authorization header with API key
        "Content-Type": "application/json", // Content type of the request
      },
      // Data payload for the API request
      data: {
        model: "llama-3.1-sonar-large-128k-online", // Model to be used
        messages: [
          {
            role: "system", // System message providing context
            content: promptTemplate(country, state, year), // Prompt generated for the model
          },
          {
            role: "user", // User message asking a question
            content: `What's the most efficient way to take annual leave in ${state}, ${country} for the year ${year}?`,
          },
        ],
        max_tokens: 1000, // Maximum number of tokens in the response
        temperature: 0.2, // Sampling temperature for randomness
        top_p: 0.9, // Nucleus sampling parameter
        search_domain_filter: ["perplexity.ai"], // Domain filter for searches
        return_images: false, // Whether to return images in the response
        return_related_questions: false, // Whether to return related questions
        search_recency_filter: "month", // Recency filter for search results
        top_k: 0, // Top-K sampling parameter
        stream: false, // Whether to stream the response
        presence_penalty: 0, // Penalty for token presence in the response
        frequency_penalty: 1, // Penalty for token frequency in the response
      },
    };

    // Make the POST request to the API using axios
    const response = await axios(options);
    // Extract the result from the API response
    const result = response.data.choices[0].message.content;

    // Cache the result with the cache key for future use
    await storage.setItem(cacheKey, result);

    // Send the result back to the client as a JSON response
    res.json(result);
  } catch (error) {
    // Log any errors that occur during the process
    console.error("Error:", error);
    // Send a 500 Internal Server Error response with an error message
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


