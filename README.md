# NLO Charity Platform API

A NestJS-based TypeScript starter repository for donation and charity management, deployed on Firebase Functions with Firestore database integration.

## Prerequisites

- Node.js 20 or higher ([install](https://nodejs.org/) or use package manager)
- npm (comes with Node.js) or yarn
- Firebase CLI ([install](https://firebase.google.com/docs/cli#install-cli) or `npm install -g firebase-tools`)
- Git ([install](https://git-scm.com/downloads))

## Installation

1. **Clone and setup**

   ```bash
   git clone <repository-url>
   cd nlo-api
   npm install
   ```

2. **Setup environment**

   ```bash
   cp .env.example .env.development
   # Edit .env.development with your values
   ```

3. **Firebase setup**

   ```bash
   firebase login
   firebase init
   ```

4. **GitHub authentication (if switching accounts between nlo and personal)**

   ```bash
   gh auth logout
   gh auth login
   ```

## Running the Application

```bash
npm run start          # Start development server
npm run start:emulator # Start Firestore emulator
npm test               # Run tests
npm run build          # Build the project
```

## Deployment

The project uses GitHub Actions with three environments for automated deployments:

- **dev branch** automatically deploys to `dev` environment and `dev-needlist` Firebase project
- **main branch** automatically deploys to `staging` environment and `staging-needlist` Firebase project
- **Manual trigger** deploys `main` branch to `production` environment and `prod-needlist` Firebase project

### Testing Deployments

- **Test dev**: Push to `dev` branch
- **Test staging**: Push to `main` branch
- **Test production**: Go to Actions tab, click Deploy to Firebase, then click Run workflow

View deployment status in GitHub's Actions, Deployments, and Environments tabs.

**Note**: Firebase CI tokens are permanent and do not expire. You only need to regenerate if you revoke access manually.

## API Documentation

Access Swagger at: http://localhost:3000/docs
