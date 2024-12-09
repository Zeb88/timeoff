// Import required modules
const express = require("express"); // Express framework for building web applications
const axios = require("axios"); // Axios for making HTTP requests
const NodeCache = require("node-cache"); // NodeCache for caching data in memory
const rateLimit = require("express-rate-limit"); // Express-rate-limit for rate limiting requests
require('dotenv').config(); // dotenv for loading environment variables

// Create an Express application
const app = express();
const port = 3000; // Define the port the server will listen on

// Create a cache with a 1 hour time to live (TTL)
const cache = new NodeCache({ stdTTL: 3600 });

// Create a rate limiter with a 15-minute window and a maximum of 10 requests per window
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
  max: 10, // Limit each IP to 10 requests per window
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
  // Extract country, state, and year from the request body
  const { country, state, year } = req.body;

  // Create a unique cache key based on country, state, and year
  const cacheKey = `${country}-${state}-${year}`;

  // Check if the cache contains a result for the cache key
  if (cache.has(cacheKey)) {
    // If it does, return the cached result
    return res.json(cache.get(cacheKey));
  }

  try {
    // Define the API endpoint URL
    const url = "https://api.perplexity.ai/chat/completions";

    // Set up the API request options
    const options = {
      method: "POST", // HTTP method
      url: url, // API endpoint URL
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`, // Set the API key in the Authorization header
        "Content-Type": "application/json", // Set content type to JSON
      },
      data: {
        model: "llama-3.1-sonar-large-128k-online", // Specify the model to use
        messages: [
          {
            role: "system", // System role for the initial message
            content: promptTemplate(country, state, year), // Use the prompt template
          },
          {
            role: "user", // User role for the follow-up message
            content: `What's the most efficient way to take annual leave in ${state}, ${country} for the year ${year}?`, // User's question
          },
        ],
        max_tokens: 1000, // Limit the response to 500 tokens
        temperature: 0.2, // Set the randomness of the response
        top_p: 0.9, // Set the probability threshold for sampling
        search_domain_filter: ["perplexity.ai"], // Filter for search domain
        return_images: false, // Do not return images
        return_related_questions: false, // Do not return related questions
        search_recency_filter: "month", // Filter for search recency
        top_k: 0, // Set top-k sampling value
        stream: false, // Disable streaming
        presence_penalty: 0, // Set presence penalty
        frequency_penalty: 1, // Set frequency penalty
      },
    };

    // Make the API request
    const response = await axios(options);
    
    // Extract the result from the API response
    const result = response.data.choices[0].message.content;

    // Cache the result using the cache key
    cache.set(cacheKey, result);
    
    // Send the result back to the client in JSON format
    res.json(result);
  } catch (error) {
    // Log the error to the console
    console.error("Error:", error);
    
    // Send a 500 error response to the client
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

