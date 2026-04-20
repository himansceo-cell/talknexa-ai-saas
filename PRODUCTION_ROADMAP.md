# TalkNexa: Production Deployment Roadmap

This guide outlines the steps to launch your **TalkNexa** AI WhatsApp Appointment SaaS in a production environment using your preferred stack: **Cloudflare Pages** (Frontend), **Oracle Cloud** (Backend), and **Firebase** (Auth/Database).

## Phase 1: Security Hardening

### 1. Firebase Security Rules
Deploy the `firestore.rules` file to your Firebase project. This ensures that users can only see their own appointments.
- **Action:** Go to Firebase Console > Firestore > Rules and paste the contents of `firestore.rules`.

### 2. Backend API Security
We have already implemented **Firebase Admin SDK** token verification on all critical backend routes.
- **Action:** Ensure your `firebase-service-account.json` (or environment variables) is securely handled on Oracle Cloud. **Never commit this file to GitHub.**

## Phase 2: Frontend Deployment (Cloudflare Pages)

Cloudflare Pages is perfect for React/Vite apps.

1. **Build Configuration:**
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
2. **Environment Variables:**
   - Add `VITE_BACKEND_URL`: Set this to your Oracle Cloud VPS IP or Domain (e.g., `https://api.yourdomain.com`).
   - Add all Firebase configuration variables (copy from your `.env`).
3. **CI/CD:**
   - Connect your GitHub repository to Cloudflare Pages. It will auto-deploy every time you push to `main`.

## Phase 3: Backend Deployment (Oracle Cloud VPS)

Since `whatsapp-web.js` requires a persistent environment and a browser (Chromium), a VPS like Oracle Cloud is the best choice.

### 1. Provisioning the VPS
- Choose **Ubuntu 22.04** or similar.
- **Important:** Ensure you open Port **3001** (or your chosen port) in the Oracle Cloud VCN Security List and the local `iptables`/`ufw`.

### 2. Deployment via Docker (Recommended)
We have provided a `Dockerfile` that handles all Chromium dependencies.
1. Install Docker on your VPS.
2. Clone your repo.
3. Build the image: `docker build -t whatsapp-backend .`
4. Run the container:
   ```bash
   docker run -d \
     -p 3001:3001 \
     -v whatsapp_auth:/usr/src/app/.wwebjs_auth \
     --env-file .env \
     --name whatsapp-backend \
     whatsapp-backend
   ```
   *The `-v` flag is CRITICAL to persist your WhatsApp sessions so you don't have to scan the QR code every time the server restarts.*

### 3. Reverse Proxy (Optional but Recommended)
- Use **Nginx** and **Certbot (SSL)** to serve your backend over HTTPS (e.g., `https://api.yourdomain.com`). This is required for secure communication with the frontend.

## Phase 4: AI Virtual Assistant (The Soul) Integration

Enhance the dashboard with a resident AI Assistant to help manage business logic.

1. **Voice & Text Processing:**
   - Integrate **OpenAI Whisper** for voice-to-text if clients send voice notes.
   - Integrate **ElevenLabs** for the Assistant's premium voice.
2. **Dashboard Integration:**
   - Add the floating "Soul" interface to the React frontend.
   - Connect the assistant to your Firestore data so it can answer questions like "How many bookings do I have today?"

## Phase 5: Monitoring & Scaling

---

### Key Reminders
- **WhatsApp Persistence:** Oracle Cloud instances can be "Always Free," but ensure your volume (`.wwebjs_auth`) is backed up.
- **Domain Names:** Use a service like Namecheap or Cloudflare to point a domain to your Oracle VPS IP for a professional look.
