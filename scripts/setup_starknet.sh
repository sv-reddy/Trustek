#!/bin/bash

# ============================================
# Starknet Development Environment Setup
# Ubuntu (VMware) - Complete Installation
# ============================================

set -e  # Exit on error

echo "🚀 Starting Starknet Development Environment Setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential tools
echo "🔧 Installing essential tools..."
sudo apt install -y \
    curl \
    git \
    build-essential \
    pkg-config \
    libssl-dev \
    python3 \
    python3-pip \
    python3-venv \
    jq \
    unzip

# Install Rust (required for Starknet tools)
echo "🦀 Installing Rust..."
if ! command -v rustc &> /dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
    echo 'source $HOME/.cargo/env' >> ~/.bashrc
else
    echo "✅ Rust already installed"
fi

# Install Scarb (Cairo package manager)
echo "📚 Installing Scarb..."
if ! command -v scarb &> /dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
    export PATH="$HOME/.local/bin:$PATH"
else
    echo "✅ Scarb already installed"
fi

# Install Starkli (Starknet CLI)
echo "⚡ Installing Starkli..."
if ! command -v starkli &> /dev/null; then
    curl https://get.starkli.sh | sh
    ~/.starkli/bin/starkliup
    echo 'export PATH="$HOME/.starkli/bin:$PATH"' >> ~/.bashrc
    export PATH="$HOME/.starkli/bin:$PATH"
else
    echo "✅ Starkli already installed"
fi

# Install Starknet Foundry (snforge)
echo "🔨 Installing Starknet Foundry..."
if ! command -v snforge &> /dev/null; then
    curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh
    echo 'export PATH="$HOME/.foundry/bin:$PATH"' >> ~/.bashrc
    export PATH="$HOME/.foundry/bin:$PATH"
else
    echo "✅ Starknet Foundry already installed"
fi

# Install Katana (Starknet Devnet)
echo "🏗️ Installing Katana (Starknet Devnet)..."
if ! command -v katana &> /dev/null; then
    curl -L https://install.dojoengine.org | bash
    ~/.dojo/bin/dojoup
    echo 'export PATH="$HOME/.dojo/bin:$PATH"' >> ~/.bashrc
    export PATH="$HOME/.dojo/bin:$PATH"
else
    echo "✅ Katana already installed"
fi

# Install Node.js and npm (for wallet interaction)
echo "📦 Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "✅ Node.js already installed"
fi

# Create Python virtual environment for starknet-py
echo "🐍 Setting up Python environment..."
python3 -m venv ~/.starknet-venv
source ~/.starknet-venv/bin/activate
pip install --upgrade pip
pip install starknet-py cairo-lang

# Verify installations
echo ""
echo "✅ Installation Complete! Verifying..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Rust:     $(rustc --version 2>/dev/null || echo 'Not found')"
echo "Scarb:    $(scarb --version 2>/dev/null || echo 'Not found')"
echo "Starkli:  $(starkli --version 2>/dev/null || echo 'Not found')"
echo "snforge:  $(snforge --version 2>/dev/null || echo 'Not found')"
echo "Katana:   $(katana --version 2>/dev/null || echo 'Not found')"
echo "Node.js:  $(node --version 2>/dev/null || echo 'Not found')"
echo "Python:   $(python3 --version 2>/dev/null || echo 'Not found')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Reload bash profile
source ~/.bashrc

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Reload your shell: source ~/.bashrc"
echo "2. Run setup_wallet.sh to create Starknet wallet"
echo "3. Run start_devnet.sh to start local Starknet devnet"
echo "4. Run deploy_contracts.sh to deploy contracts"
