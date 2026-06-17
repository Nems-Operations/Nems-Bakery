# Production Secrets & CI/CD Deployment Integration Guide

To prevent sensitive credentials and payment keys from being exposed in public GitHub repositories, you have successfully refactored the application to read configuration values from environmental boundaries.

Follow this guide to securely configure these keys for your automated workflows and deployment servers.

---

## 1. Setting Up GitHub Action Secrets

If you use a automated deployment pipeline with GitHub Actions (e.g. Firebase Hosting, Cloud Run, Vercel), add your variables as secure Repository Secrets:

1. Navigate to your repository on **GitHub**.
2. Go to **Settings** > **Secrets and variables** > **Actions** in the left sidebar.
3. Under the **Secrets** tab, click **New repository secret**.
4. For each variable below, enter the key as the **Name** and insert its production credentials under **Value**:

| GitHub Secret Key | Description |
| :--- | :--- |
| `VITE_PAYFAST_MERCHANT_ID` | Production PayFast Merchant ID (e.g., `24926541`) |
| `VITE_PAYFAST_MERCHANT_KEY` | Production PayFast Merchant Key (e.g., `rf1x71oxrxchi`) |
| `VITE_FIREBASE_API_KEY` | Firebase Client Web SDK API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Authentication URL Domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project Identifier |
| `VITE_FIREBASE_STORAGE_BUCKET` | Cloud Storage bucket address |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase Web Application Instance ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Analytics Measurement/Stream ID (G-...) |

---

## 2. Dynamic Injection into Build Workflows

Vite compiles variables prefixed with `VITE_` into static source structures at **build time**. Therefore, your build step must have access to these environments.

If you are using a customizable workflow `.yml` file, ensure these environment variables are passed to the build command step:

```yaml
- name: Build Production Package
  run: npm run build
  env:
    VITE_PAYFAST_MERCHANT_ID: ${{ secrets.VITE_PAYFAST_MERCHANT_ID }}
    VITE_PAYFAST_MERCHANT_KEY: ${{ secrets.VITE_PAYFAST_MERCHANT_KEY }}
    VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
    VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
    VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
    VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
    VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
    VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
    VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}
```

---

## 3. Hosting Provider Configurations

If deploying directly via a cloud platform dashboard:

### Google Cloud (Cloud Run / App Engine)
- Add them as environment variables during build triggers, or define them in your environment settings tab under Cloud Run.

### Firebase Hosting
- Set the credentials inside the CLI environment before executing the build and deploy commands (`firebase deploy` / `npm run build`).
