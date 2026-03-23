 <div align="center">
  <img src="public/logo.png" alt="OriginCheck Logo" width="150"/>
  <h1>OriginCheck: AI Integrity & Humanization Suite</h1>
  <p>A high-fidelity, dual-engine platform combining professional plagiarism detection with sophisticated AI-text humanization.</p>
</div>

---

## 🌟 Overview

**OriginCheck** is a "Scientific SaaS" platform designed for educators, content creators, and professionals. It provides a robust, two-pronged approach to content integrity:

1. **The Integrity Scanner:** Deep-scans documents for both traditional web plagiarism and modern AI-generated content.
2. **The AI Humanizer:** A transformation engine that intelligently rewrites AI-generated text to bypass detection algorithms by manipulating Perplexity and Burstiness.

## ✨ Core Features

### 🔍 1. The Integrity Scanner (Detection Engine)
A Turnitin-style environment that provides comprehensive analysis of any document.

* **Drag & Drop Upload:** Seamlessly drop `.pdf`, `.docx`, or `.txt` files directly into the scanner. Text is extracted locally and reliably via `pdf-parse` and `mammoth`.
* **Similarity Layering:** Highlights suspicious text directly inline.
  * 🟥 **Red Highlights:** Indicates potential Web Plagiarism.
  * 🟪 **Purple Highlights:** Indicates AI-Generated or assisted text.
* **Match Overview Sidebar:** An interactive "Similarity Index" featuring a Donut Chart and source cards that auto-scroll the document to the corresponding highlighted text.

### ⚡ 2. The AI Humanizer (Transformation Engine)
A CopyLeaks-style engine designed to naturalize robotic text and bypass modern AI detectors.

* **Perplexity & Burstiness Algorithms:** Analyzes and modifies sentence length variation (Burstiness) and implements complex, natural vocabulary sets (Perplexity) that AI models typically avoid.
* **Adjustable Strength:**
  * **Low:** Light synonym swapping, maintains original structure.
  * **Medium:** Moderate restructuring, injects contractions, resolves passive voice.
  * **High:** Aggressive sentence breaking, structural variation, and heavy vocabulary randomization for maximum humanization.
* **Immersive UI:** A side-by-side editing interface featuring live word counts, a dynamic progress bar, and a sleek "Typewriter" effect for the generated output, complete with one-click clipboard copying.

## 🛠️ Tech Stack & Architecture

OriginCheck is built with a modern, high-performance web stack focusing on minimalism and fluid interactions.

* **Framework:** [Next.js](https://nextjs.org) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a custom Slate/Indigo/Emerald color palette and custom CSS variables.
* **Components:** Custom minimalist UI taking inspiration from *shadcn/ui*.
* **Animations:** [Framer Motion](https://www.framer.com/motion/) for smooth tab transitions and layout changes.
* **Data Visualization:** [Chart.js](https://www.chartjs.org/) & `react-chartjs-2` for the Similarity Index Donut Chart.
* **Icons:** [Lucide React](https://lucide.dev/)
* **File Parsing:** `pdf-parse` and `mammoth` for robust server-side document extraction.

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/thearjunl/OriginCheck.git
   cd OriginCheck
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

## 🎨 Design Philosophy
OriginCheck employs a "Scientific SaaS" aesthetic. This means:
* **Minimalist UI:** Generous whitespace with a focus on usability.
* **Professional Typography:** `Inter` for standard UI elements and `IBM Plex Sans` for data and components.
* **Color Psychology:** Trustworthy Indigo (`#4F46E5`) for scanning and vibrant Emerald (`#10B981`) for the successful humanization of text.

---
<div align="center">
  <p>Crafted with ❤️ by Arjun L</p>
</div>
