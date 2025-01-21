# Leave Optimizer AI

An intelligent web application that helps you maximize your time off by strategically planning annual leave around public holidays. Using AI, it generates optimized leave schedules tailored to your location and preferences.

## Features

- 🌍 Support for multiple countries and regions
- 🤖 AI-powered leave optimization
- 📅 Strategic holiday planning
- 🏖️ Vacation activity suggestions
- ⚡ Fast response with caching
- 📱 Mobile-friendly interface

## Live Demo

Visit [https://timeoffai.com/](https://timeoffai.com/) to try the application.

## Self-Hosting Guide

### Prerequisites

- Node.js (v18 or higher)
- npm (Node Package Manager)
- A Perplexity AI API key ([Get one here](https://www.perplexity.ai))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Zeb88/timeoff.git
cd timeoff
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PERPLEXITY_API_KEY=your_api_key_here
```

4. Start the server:
```bash
node server.js
```

5. Access the application at `http://localhost:3000`

### Docker Installation

```bash
# Using docker-compose (recommended)
docker-compose up -d

# Or using Docker directly
docker build -t timeoff .
docker run -p 3000:3000 -e PERPLEXITY_API_KEY=your_api_key_here timeoff
```

## API Documentation

### Optimize Leave Plan

```http
POST /optimize-leave
Content-Type: application/json

{
    "country": "Australia",
    "state": "New South Wales",
    "year": 2024
}
```

#### Response

Returns a markdown-formatted string containing:
- Summary of the optimization strategy
- Detailed breakdown of leave periods
- Public holiday information
- Activity recommendations

## Configuration

The application can be configured through environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| PERPLEXITY_API_KEY | required | Your Perplexity AI API key |
| RATE_LIMIT_WINDOW | 3600000 | Rate limit window in ms |
| RATE_LIMIT_MAX | 1000 | Max requests per window |
| CACHE_TTL | 2629800000 | Cache duration in ms |

See `.env.example` for a template of all available configuration options.

## Getting Started

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Perplexity AI API key:
```env
PERPLEXITY_API_KEY=your_api_key_here
```

3. Start the application using either Docker or Node.js as described in the installation sections above.

## Technical Stack

- **Frontend**: HTML, Alpine.js, Tailwind CSS
- **Backend**: Node.js, Express
- **AI**: Perplexity AI API
- **Caching**: node-persist
- **Rate Limiting**: express-rate-limit

## Development

### Project Structure

```
├── public/
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── server.js
├── package.json
└── README.md
```

### Running Tests

```bash
npm test
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- Rate limiting prevents API abuse
- Environment variables protect sensitive data
- Regular dependency updates
- Input validation and sanitization

## Performance

- Response caching improves speed
- Optimized AI prompt generation
- Efficient state management
- Minimal dependencies

## Support

- 🐛 Issues: [GitHub Issues](https://github.com/Zeb88/timeoff/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Zeb88/timeoff/discussions)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.