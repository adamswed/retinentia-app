# Retinentia 🧠

**Retinentia** is an AI-powered educational index card application designed to help students **memorize vocabulary efficiently and privately**.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 20.x or higher is required. We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage your versions.
- **npm**: Version 10.x or higher.

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/adamswed/retinentia-app.git
cd retinentia-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory. This file is already ignored by Git to keep your keys safe.

Use the following template:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Add other necessary AI/Firebase keys here
```

---

## 🔥 Firebase Configuration

1. Create a new project in the **Firebase Console**.
2. Enable **Authentication** and **Firestore**.
3. Register a **Web App** to obtain your configuration keys.

## Wikimedia OAuth Configuration

1. Log into https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose with your Wikimedia account (or create an account).
2. Access Registration: Navigate to the OAuth Consumer Registration Page at: https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose
3. Fill Application Details:
   - Application Name: Give your app a name.
   - OAuth Version: Select 2.0.
4. For instant development access: Find the checkbox that reads, "This consumer is for use only by [Your Username]" and check it
5. Set Permissions: Select the necessary permissions (e.g., \* for read-only).
6. Submit the form.
7. Obtain Tokens: You will immediately be shown your Consumer Key, Consumer Secret, and Access Token.
8. Add token values to WIKIMEDIA_CLIENT_ID and WIKIMEDIA_CLIENT_SECRET evnironment variables.

### 4. Cypress Environment Setup

Copy the example file and fill in real values for a dedicated Firebase test account:

```bash
cp cypress.env.example.json cypress.env.json
```

`cypress.env.json` is git-ignored. Never commit real credentials.

| Key | Description |
|---|---|
| `TEST_EMAIL` | Email of the dedicated Firebase test user |
| `TEST_PASSWORD` | Password of the dedicated Firebase test user |
| `TEST_USER_UID` | Firestore UID of the test user (found in Firebase Console → Authentication) |

> The test user must already exist in Firebase Auth before running tests. Create one manually in the Firebase Console or via the Admin SDK. Use a dedicated account — tests will delete and modify its Firestore data.

---

## 🧪 Cypress E2E Tests

Tests require the dev server to be running on `http://localhost:3000` and a valid `cypress.env.json`.

### Running Tests

**Interactive mode** (opens the Cypress UI — recommended during development):

```bash
npm run dev        # in one terminal
npm run cy:open    # in another terminal
```

**Headless mode** (runs all tests in Chrome — used in CI):

```bash
npm run dev        # in one terminal
npm run cy:run     # in another terminal
```

### Custom Commands

| Command | Description |
|---|---|
| `cy.login()` | Signs in the test user via the email sign-in form and waits for the session cookie to be set |

### Cypress Tasks (via `cypress.config.ts`)

These run server-side via the Firebase Admin SDK to set up and tear down test state:

| Task | Description |
|---|---|
| `clearTestUserCards` | Deletes all Firestore cards for the test user |
| `seedTestCard({ term, definition })` | Creates a single card for the test user |
| `resetAIQuota` | Resets the AI definition quota counter to 0 in Firestore |

### Notes for Contributors

- **Never use the same account for testing and personal use.** Tests call `clearTestUserCards` in `before()` hooks, which will wipe real card data.
- Tests that call AI definition lookups (e.g. `ai-quota-limit.cy.ts`) make real Vertex AI requests and count against the daily quota. The `resetAIQuota` task resets the counter before each run.
- Videos of each run are saved to `cypress/videos/` and screenshots of failures to `cypress/screenshots/`. Both are git-ignored.

### Optional (Local HTTPS Development)

If you want HTTPS locally, generate local certificates using **mkcert** and place them in a `/certificates` folder.

This folder should remain **git-ignored**.

---

## ▶️ Run the Development Server

```bash
npm run dev
```

Then open:

```
http://localhost:3000
```

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend / AI:** Firebase & Google Vertex AI

---

## 🤝 Contributing

Contributions are welcome!

Whether you're fixing a bug or suggesting a new feature, feel free to open a **Pull Request**.

Please ensure your code follows the existing **ESLint configuration** before submitting.

---

## 📄 License

Add your license here (MIT, Apache 2.0, etc.).
