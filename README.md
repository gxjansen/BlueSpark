# BlueSpark 🌟

BlueSpark is a web application designed to enhance engagement on BlueSky by automatically generating personalized conversation starters for new followers. The app analyzes both user and follower profiles to create meaningful, context-aware welcome messages that spark genuine conversations based on shared interests.

## Features ✨

- **BlueSky Authentication**: Secure login using BlueSky username and application password
- **Automated Profile Analysis**: 
  - Analyzes user's profile and last 200 posts
  - Fetches and analyzes the last 20 new followers (configurable)
  - Processes each follower's profile and last 50 posts (configurable)
- **AI-Powered Message Generation**:
  - Creates personalized welcome messages using OpenRouter AI
  - Focuses on shared interests between user and follower
  - Includes engaging questions to start conversations
- **Message Management**:
  - Option to regenerate messages if desired
  - Direct posting to BlueSky with one click
  - Single message suggestion per user-follower pair
- **Netlify Deployment Ready**: Optimized for deployment on Netlify

## Tech Stack 🛠️

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **AI Integration**: OpenRouter API
- **BlueSky Integration**: @atproto/api
- **Build Tool**: Vite
- **UI Components**: Lucide React
- **Notifications**: React Hot Toast

## Installation 🚀

1. Clone the repository:
```bash
git clone [repository-url]
cd bluespark
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit the `.env` file and replace the placeholder values with your actual credentials:
- `VITE_OPENROUTER_API_KEY`: Your OpenRouter API key
- `VITE_OPENROUTER_MODEL`: The AI model to use (default: anthropic/claude-3.5-haiku-20241022)

## Development 💻

Start the development server:
```bash
npm run dev
```

Other available commands:
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Usage 📝

1. Log in with your BlueSky credentials (username and application password)
2. The app will automatically fetch your recent followers
3. For each follower, the app generates a personalized welcome message
4. You can:
   - Review the generated messages
   - Regenerate any message you're not satisfied with
   - Post approved messages directly to BlueSky

## Environment Variables ⚙️

The project uses environment variables for configuration. A `.env.example` file is provided as a template with all required variables:

```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
VITE_OPENROUTER_MODEL=anthropic/claude-3.5-haiku-20241022
```

Copy this file to `.env` and replace the placeholder values with your actual credentials. The `.env` file is gitignored to keep your credentials secure.

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Copy `.env.example` to `.env` and configure your environment variables
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License 📄

[Add your license information here]
