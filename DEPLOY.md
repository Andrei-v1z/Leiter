# Deploy Leiter

`leiter.fr` shows Cloudflare **525 SSL handshake failed** because Cloudflare is proxying HTTPS to IONOS, and IONOS has no certificate for `leiter.fr`. The GitHub → IONOS upload also failed: the workflow used `IONOS_FTP_*` secrets that are not on this repo.

Working IONOS account (same as [aethoncg.com](https://github.com/Andrei-v1z/aethoncg.com)):

- SSH host: `access-5019302200.webspace-host.com`
- SSH user: `su1846070`
- Remote folder: `/Leiter/`
- Web IP: `217.160.0.114`

## 1. Stop the 525 on leiter.fr (Cloudflare)

Do this in the Cloudflare dashboard for `leiter.fr` (and `leiter.be` if it is also proxied):

1. **SSL/TLS → Overview** → set encryption mode to **Flexible** (temporary). The 525 should disappear immediately.
2. **DNS** → for `@` and `www`, set the orange cloud to **DNS only** (grey cloud).
3. Point those records at IONOS, not GitHub, while IONOS is the origin:

   - A `@` → `217.160.0.114`
   - A `www` → `217.160.0.114`

4. In **IONOS → Domains & SSL**:
   - Assign `leiter.fr` to this webspace
   - Document root = `/Leiter`
   - Issue the free SSL certificate
5. After IONOS shows a valid cert, Cloudflare can go back to **Full (strict)** and you may turn the proxy (orange cloud) on again.

`aethoncg.com` works because it uses IONOS nameservers directly and already has an IONOS certificate. `leiter.fr` is on Cloudflare without a matching origin cert.

## 2. Unlock the IONOS upload

In [Leiter repo secrets](https://github.com/Andrei-v1z/Leiter/settings/secrets/actions) add:

- `IONOS_SSH_PASSWORD` — same value as `Andrei-v1z/aethoncg.com`

Optional: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `ADMIN_TOKEN`.

Pushing `main` runs `.github/workflows/deploy-ionos.yml`.

## 3. GitHub Pages preview

`.github/workflows/deploy-pages.yml` publishes the static marketing site to:

https://andrei-v1z.github.io/Leiter/

Enable **Settings → Pages → Source: GitHub Actions**.

Do **not** orange-cloud Cloudflare to GitHub Pages. That combination is a common cause of 525. If you want `leiter.fr` on Pages instead of IONOS, keep the records grey-clouded and use GitHub's A records (`185.199.108.153`–`111.153`).
