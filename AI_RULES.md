# AI DEVELOPMENT GUIDELINES & ARCHITECTURE RULES

## 1. Project Context
- **Framework:** Next.js (App Router)
- **Architecture:** Feature-Driven Architecture (Strict)

## 2. Core Architectural Principle
We strictly follow a **Feature-Driven Architecture**. We do NOT organize files by technical type (e.g., putting all components in one huge folder). We organize by **Business Domain/Feature**.

### Directory Structure Map

```text
src/
├── app/               # Routing layer ONLY. Keep logic minimal here.
├── components/        # GLOBAL "dumb" UI components (Buttons, Inputs, etc).
├── lib/               # Third-party configurations & global utilities.
├── features/          # MAIN BUSINESS LOGIC.
│   ├── auth/          # Feature: Authentication
│   ├── dashboard/     # Feature: Dashboard
│   ├── [feature-name]/
│   │   ├── components/  # Components specific to this feature
│   │   ├── hooks/       # Hooks specific to this feature
│   │   ├── services/    # API calls/Logic specific to this feature
│   │   ├── types/       # Types specific to this feature
│   │   └── index.ts     # PUBLIC API (Barrel file)
```