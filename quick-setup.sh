#!/bin/bash

# Ubuntu VPS Quick Setup Script for Captcha Automation
# Run this script on a fresh Ubuntu VPS to setup everything automatically

echo "🚀 Starting Ubuntu VPS Setup for Captcha Automation..."
echo "======================================================="

# Function to check if command succeeded
check_command() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ Failed: $1"
        exit 1
    fi
}

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y
check_command "System update"

# Install Node.js 18 LTS
echo "📦 Installing Node.js 18 LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
check_command "Node.js installation"

# Install Chrome and dependencies
echo "📦 Installing Chromium Browser and dependencies..."
sudo apt install -y \
    chromium-browser \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo-gobject2 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils
check_command "Chrome and dependencies installation"

# Install PM2
echo "📦 Installing PM2 process manager..."
sudo npm install -g pm2
check_command "PM2 installation"

# Setup project directory
echo "📁 Setting up project directory..."
cd ~
mkdir -p captcha-bot
cd captcha-bot
check_command "Project directory setup"

# Initialize npm project
echo "📦 Initializing npm project..."
npm init -y
check_command "NPM project initialization"

# Install Puppeteer
echo "📦 Installing Puppeteer..."
npm install puppeteer
check_command "Puppeteer installation"

# Verify installations
echo "🔍 Verifying installations..."
node --version
npm --version
chromium-browser --version
pm2 --version

echo ""
echo "🎯 Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo "1. Upload your captcha-automation.js file to ~/captcha-bot/"
echo "2. Test run: node captcha-automation.js"
echo "3. Start with PM2: pm2 start captcha-automation.js --name 'captcha-bot'"
echo "4. Save config: pm2 save"
echo "5. Enable startup: pm2 startup"
echo ""
echo "🔗 Useful Commands:"
echo "- Check status: pm2 status"
echo "- View logs: pm2 logs captcha-bot"
echo "- Restart: pm2 restart captcha-bot"
echo "- Stop: pm2 stop captcha-bot"
echo ""
echo "🎉 Your captcha bot will now run 24/7 on Ubuntu VPS!"
