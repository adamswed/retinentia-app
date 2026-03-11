# Retinentia 🧠

**Retinentia** is an AI-powered educational index card application designed to help students **memorize vocabulary efficiently and privately**.

---

## 🚀 Getting Started

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
