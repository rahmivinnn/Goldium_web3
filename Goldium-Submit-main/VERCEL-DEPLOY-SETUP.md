# Setup Otomatis Deploy ke Vercel

Panduan ini akan membantu Anda mengatur otomatis deploy ke Vercel menggunakan GitHub Actions.

## Langkah 1: Setup Vercel Project

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik "Add New" → "Project"
3. Import repository GitHub Anda: `https://github.com/rahmivinnn/Goldium.git`
4. Konfigurasi project:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

## Langkah 2: Dapatkan Vercel Tokens

### Vercel Token
1. Buka [Vercel Settings → Tokens](https://vercel.com/account/tokens)
2. Klik "Create Token"
3. Beri nama token (misal: "GitHub Actions")
4. Copy token yang dihasilkan

### Project ID dan Org ID
1. Buka project Vercel Anda
2. Pergi ke Settings → General
3. Copy **Project ID**
4. Copy **Team ID** (atau **Org ID**)

## Langkah 3: Setup GitHub Secrets

1. Buka repository GitHub: `https://github.com/rahmivinnn/Goldium`
2. Pergi ke Settings → Secrets and variables → Actions
3. Klik "New repository secret" dan tambahkan:

   - **Name**: `VERCEL_TOKEN`
     **Value**: Token dari Vercel
   
   - **Name**: `ORG_ID`
     **Value**: Team/Org ID dari Vercel
   
   - **Name**: `PROJECT_ID`
     **Value**: Project ID dari Vercel

## Langkah 4: Environment Variables (Opsional)

Jika project Anda membutuhkan environment variables:

1. Di Vercel Dashboard → Project Settings → Environment Variables
2. Tambahkan semua environment variables yang diperlukan
3. Atau tambahkan di GitHub Secrets dan update workflow file

## Langkah 5: Test Deploy

1. Push perubahan ke repository:
   ```bash
   git add .
   git commit -m "Setup auto deploy to Vercel"
   git push origin master
   ```

2. Cek GitHub Actions tab di repository untuk melihat progress deploy
3. Setelah selesai, project akan otomatis ter-deploy ke Vercel

## Fitur Auto Deploy

✅ **Auto deploy** setiap push ke branch `master` atau `main`
✅ **Preview deploy** untuk Pull Requests
✅ **Build optimization** dengan cache Node.js
✅ **Error handling** jika build gagal

## Troubleshooting

### Build Error
- Pastikan semua dependencies sudah benar di `package.json`
- Cek environment variables sudah diset dengan benar
- Lihat logs di GitHub Actions untuk detail error

### Deploy Error
- Pastikan Vercel tokens sudah benar
- Cek Project ID dan Org ID sudah sesuai
- Pastikan repository sudah connected ke Vercel

### Environment Variables
- Tambahkan di Vercel Dashboard → Environment Variables
- Atau tambahkan di GitHub Secrets dan update workflow

## URL Deploy

Setelah setup berhasil:
- **Production**: `https://goldium.vercel.app` (atau domain custom)
- **Preview**: Otomatis dibuat untuk setiap PR

---

**Note**: Pastikan file `vercel.json` sudah dikonfigurasi dengan benar untuk project Anda.