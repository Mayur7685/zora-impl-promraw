![image](https://github.com/user-attachments/assets/02f9a18c-fc29-4ccb-b81f-845531c6db2b)



<p align="center">
  <a href="https://github.com/Mayur7685/promraw-app/new/main#overview">Overview</a> | 
  <a href="https://github.com/Mayur7685/promraw-app/new/main#features-implemented">Implemented</a> | 
  <a href="https://github.com/Mayur7685/promraw-app/new/main#upcoming-features--checkpoints">Upcoming</a> | 
  <a href="https://github.com/Mayur7685/promraw-app/new/main#high-level-architecture-diagram">Diagram</a>
</p>

## Overview
Promraw is a decentralized and AI-powered creative platform where users submit daily sketches based on AI-generated prompts. The platform scores submissions using AI and offers users the ability to mint their best artworks as NFTs using Zora’s protocol. A leaderboard system ranks artists based on AI scores, enabling rewards and additional features.

## Features Implemented
- **Drawing Canvas**: A user-friendly sketching interface.
- **AI-Generated Daily Prompt**: GPT-4 generates unique creative prompts daily.
- **AI Scoring System**: GPT-4o Vision scores drawings based on creativity, adherence to the prompt, and artistic quality.
- **NFT Card Download**: Users can download their artwork along with metadata as a pre-mint card.
  
---

## Upcoming Features & Checkpoints

- [x] Zora Minting Integration (Not in production env)
- [ ] On-Chain Leaderboard
- [ ] Artwork Gallery 
- [ ] Royalty & Secondary Market Integration
- [ ] ommunity Challenges & Rewards

---

### **Phase 1: NFT Integration & Blockchain Features**
- **Zora Minting Integration (Checkpoint 1)**
  - Implement NFT minting through Zora’s Creator Toolkit.
  - Store artwork, AI scores, and metadata on IPFS.
  - Support gasless minting options.

- **On-Chain Leaderboard (Checkpoint 2)**
  - Implement an on-chain ranking system based on AI scores.
  - Fetch real-time blockchain data for leaderboard updates.

- **Artwork Gallery (Checkpoint 3)**
  - Create an interactive gallery showcasing user-submitted artwork.
  - Allow users to filter and explore the best-ranked sketches.

---

### **Phase 2: Monetization & Community Engagement**
- **Royalty & Secondary Market Integration (Checkpoint 4)**
  - Automate royalty splits for artists.
  - Integrate secondary sales tracking and revenue-sharing mechanisms.

- **Community Challenges & Rewards (Checkpoint 5)**
  - Introduce themed challenges with prize incentives.
  - Implement voting and community-curated prompt selection.
 
---

### **Phase 3: AI & Web3 Expansion**
- **AI-Assisted Drawing (Checkpoint 6)**
  - Implement AI-based sketch enhancement tools.
  - Offer real-time AI feedback and suggestions.

- **Multi-Chain Support (Checkpoint 7)**
  - Expand Promraw to multiple blockchains (e.g., Base, Optimism).
  - Allow cross-chain NFT minting and trading.
 
---

### **High-Level Architecture Diagram**
![Editor _ Mermaid Chart-2025-04-03-114456](https://github.com/user-attachments/assets/d0afbea1-f51d-483c-a045-0363ca0a9cca)

---

## Getting Started
### Installation & Setup
```bash
# Clone the repository
git clone https://github.com/Mayur7685/promraw-app.git

# Navigate to the project directory
cd promraw-app

# Install dependencies
npm install

# Start the development server
npm run dev
```
---

### Contribution Guidelines
We welcome contributions to Promraw! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature.
3. Commit and push your changes.
4. Submit a pull request.
