# Black Humor Productions - Enterprise Website

Enterprise-grade React application for Black Humor Productions, providing a premium digital media and agency presence.

## Technical Stack
* Framework: React 18
* Build Tool: Vite
* Language: TypeScript
* Styling: Tailwind CSS
* Routing: React Router v6
* Icons: Lucide React
* SEO: React Helmet Async

## Local Development Setup

1. **Extract Archive & Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   *The local server will start on `http://localhost:5173`.*

3. **Production Build**
   ```bash
   npm run build
   ```
   *This command compiles TypeScript and bundles the application into the `dist` folder.*

## Architecture & Configuration
All business-specific variables (Phone numbers, physical location, service definitions) are centralized in `src/config/site.ts`.

**Pending Integrations Required Before Deployment:**
1. Form submission backend (e.g., Formspree, Netlify Forms, or custom API).
2. Integration of genuine portfolio images inside `src/pages/Work.tsx`.
3. Valid domain configuration for Open Graph metadata mapping.