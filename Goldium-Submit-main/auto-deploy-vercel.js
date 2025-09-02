#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting automatic Vercel deployment...');

// Check if vercel.json exists
if (!fs.existsSync('vercel.json')) {
  console.error('❌ vercel.json not found!');
  process.exit(1);
}

try {
  // Install Vercel CLI if not installed
  console.log('📦 Checking Vercel CLI...');
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI already installed');
  } catch {
    console.log('📥 Installing Vercel CLI...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }

  // Build the project
  console.log('🔨 Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Deploy to Vercel
  console.log('🚀 Deploying to Vercel...');
  const deployOutput = execSync('vercel --prod --yes', { encoding: 'utf8' });
  
  // Extract URL from output
  const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
  if (urlMatch) {
    const deployUrl = urlMatch[0];
    console.log('\n🎉 Deployment successful!');
    console.log('🔗 Live URL:', deployUrl);
    
    // Save URL to file
    fs.writeFileSync('vercel-url.txt', deployUrl);
    console.log('💾 URL saved to vercel-url.txt');
    
    // Update README with live URL
    const readmePath = 'README.md';
    if (fs.existsSync(readmePath)) {
      let readme = fs.readFileSync(readmePath, 'utf8');
      const urlSection = `\n\n## 🌐 Live Demo\n[View Live Application](${deployUrl})\n`;
      
      if (readme.includes('## 🌐 Live Demo')) {
        readme = readme.replace(/## 🌐 Live Demo[\s\S]*?(?=\n##|$)/, urlSection.trim());
      } else {
        readme += urlSection;
      }
      
      fs.writeFileSync(readmePath, readme);
      console.log('📝 README.md updated with live URL');
    }
    
  } else {
    console.log('⚠️ Could not extract URL from deployment output');
    console.log('Deployment output:', deployOutput);
  }
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

console.log('\n✨ Auto-deployment completed!');