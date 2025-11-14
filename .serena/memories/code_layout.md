# Code Layout

## Application Structure

- `app/layout.tsx` - Root layout with font configuration and metadata
- `app/page.tsx` - Home page component
- `app/globals.css` - Global styles and Tailwind CSS configuration

## API Routes

- `app/api/restaurants/search/route.ts` - Restaurant search endpoint (GET)
- `app/api/restaurants/[id]/route.ts` - Restaurant details endpoint
- `app/api/reviews/route.ts` - Review submission endpoint
- `app/api/reviews/[restaurantId]/route.ts` - Reviews by restaurant ID endpoint
- `app/api/schedules/adjust/route.ts` - Schedule adjustment and restaurant recommendation endpoint

## Pages

- `app/restaurants/page.tsx` - Restaurant search and listing page with filters
- `app/restaurants/[id]/page.tsx` - Individual restaurant details page
- `app/restaurants/review/page.tsx` - Review page (alternative route)
- `app/review/[restaurantId]/page.tsx` - Review submission page for specific restaurant
- `app/schedule/page.tsx` - Schedule coordination page with CSV upload

## Components

- `components/footer.tsx` - Footer component
- `components/ui/accordion.tsx` - Accordion UI component
- `components/ui/avatar.tsx` - Avatar UI component
- `components/ui/badge.tsx` - Badge UI component
- `components/ui/button.tsx` - Button UI component
- `components/ui/card.tsx` - Card UI component
- `components/ui/checkbox.tsx` - Checkbox UI component
- `components/ui/dropdown-menu.tsx` - Dropdown menu UI component
- `components/ui/input.tsx` - Input field UI component
- `components/ui/label.tsx` - Label UI component
- `components/ui/select.tsx` - Select dropdown UI component
- `components/ui/tabs.tsx` - Tabs UI component
- `components/ui/textarea.tsx` - Textarea UI component

## Libraries

- `lib/db.ts` - PostgreSQL database connection configuration
- `lib/utils.ts` - Utility helper functions

## Scripts

- `scripts/setup-database.js` - Database initialization script for reviews table

## Configuration

- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `eslint.config.mjs` - ESLint configuration
- `components.json` - shadcn/ui components configuration
- `docker-compose.yml` - Docker Compose configuration
- `Dockerfile` - Docker image definition
- `.dockerignore` - Docker ignore patterns
- `.gitignore` - Git ignore patterns