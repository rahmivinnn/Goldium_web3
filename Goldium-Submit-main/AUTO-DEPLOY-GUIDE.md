# 🚀 Auto Vercel Deployment Guide

Panduan lengkap untuk menggunakan sistem auto-deployment Vercel yang telah dikonfigurasi.

## 🎯 Fitur Auto-Deployment

✅ **Deployment otomatis** setiap push ke branch `main`  
✅ **URL otomatis** tersimpan di `vercel-url.txt`  
✅ **README auto-update** dengan link live demo  
✅ **Script manual deployment** untuk testing lokal  
✅ **GitHub Actions integration** untuk CI/CD  

## 🛠️ Cara Menggunakan

### 1. Deployment Otomatis (Recommended)

```bash
# Setiap kali push ke main, deployment otomatis berjalan
git add .
git commit -m "Your changes"
git push origin main
```

**Hasil:**
- GitHub Actions otomatis build & deploy
- URL deployment tersimpan di `vercel-url.txt`
- README.md otomatis diupdate dengan live demo link

### 2. Manual Deployment

```bash
# Menggunakan script auto-deploy
npm run deploy

# Atau deployment langsung
npm run deploy:auto
```

### 3. Development Server

```bash
# Jalankan server lokal
npm run dev
# Akses: http://localhost:5000
```

## 📋 Prerequisites

### GitHub Secrets (Required)

Pastikan secrets berikut sudah dikonfigurasi di GitHub:

```
VERCEL_TOKEN     = your_vercel_token
ORG_ID           = your_vercel_org_id  
PROJECT_ID       = your_vercel_project_id
```

### Setup Vercel CLI (Optional)

Untuk manual deployment:

```bash
npm install -g vercel
vercel login
```

## 📁 File Structure

```
├── .github/workflows/deploy.yml    # GitHub Actions workflow
├── auto-deploy-vercel.js           # Script auto-deployment
├── vercel.json                     # Konfigurasi Vercel
├── vercel-url.txt                  # URL deployment (auto-generated)
└── package.json                    # NPM scripts
```

## 🔄 Workflow Process

1. **Push ke main** → GitHub Actions triggered
2. **Install dependencies** → `npm ci`
3. **Build project** → `npm run build`
4. **Deploy to Vercel** → Menggunakan Vercel Action
5. **Save URL** → Simpan ke `vercel-url.txt`
6. **Update README** → Tambah live demo link
7. **Commit changes** → Auto-commit URL updates

## 🎉 Hasil Deployment

Setelah deployment berhasil:

- ✅ Website live di Vercel URL
- ✅ URL tersimpan di `vercel-url.txt`
- ✅ README.md terupdate dengan live demo
- ✅ GitHub Actions menampilkan status sukses

## 🐛 Troubleshooting

### Deployment Gagal?

1. **Cek GitHub Secrets** - Pastikan semua secrets sudah benar
2. **Cek Build Logs** - Lihat error di GitHub Actions
3. **Cek vercel.json** - Pastikan konfigurasi benar

### URL Tidak Muncul?

1. **Cek GitHub Actions** - Lihat step "Save Deployment URL"
2. **Manual check** - Jalankan `npm run deploy` lokal
3. **Vercel Dashboard** - Cek deployment di dashboard Vercel

## 📞 Support

Jika ada masalah:
1. Cek GitHub Actions logs
2. Cek Vercel dashboard
3. Jalankan `npm run deploy` untuk testing lokal

---

**Happy Deploying! 🚀**