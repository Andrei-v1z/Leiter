# Deploy: GitHub → IONOS (`/Leiter`)

Remote: `https://github.com/Andrei-v1z/Leiter.git`

Pushing to `main` triggers `.github/workflows/deploy-ionos.yml`.

IONOS folder: `/Leiter/` on the same SFTP account as BrightPixel.

This is a Next.js app (Stripe Checkout APIs). Static HTML is mirrored for Apache. Node is needed for `/api/checkout`.
