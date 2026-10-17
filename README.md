# InfluenceIQ — Instagram Influencer Analytics System

**InfluenceIQ** is a full-stack, data-driven web application designed for marketing companies, digital agencies, and analytics teams to evaluate Instagram influencer performance. Built with **FastAPI (Python)** and **React with Vite (Tailwind CSS, Recharts)**, it enables teams to benchmark creators, compare audiences and engagement rates, analyze geographical and category distributions, and make evidence-based marketing decisions.

---

## 1. Project Overview & Problem Statement

### Problem Statement
Marketing companies often struggle to evaluate influencer partnerships objectively. Common pitfalls include relying solely on raw follower counts (which ignore engagement quality), comparing creators unfairly across disparate niches, and assuming high follower reach automatically translates into campaign ROI. 

InfluenceIQ addresses these challenges by answering key questions:
- **Which influencers have the highest engagement rates?**
- **Which countries and influencer categories perform best?**
- **Which creators offer the optimal balance of audience size and engagement health?**
- **How can influencers be compared fairly without declaring arbitrary winners?**
- **Why is a particular influencer ranked higher than another?**
- **What metrics must a marketing company evaluate prior to influencer selection?**
- **What are the boundaries and limitations of the available dataset?**

> **Core Principle:** InfluenceIQ is a true data analytics platform driven by authentic data from Kaggle, featuring robust data cleaning, strictly applied multi-filter AND logic, transparent scoring, and zero synthetic metric fabrication.

---

## 2. Technology Stack

### Backend
- **Python 3.10+ / 3.14**
- **FastAPI**: High-performance asynchronous REST API framework
- **Uvicorn**: Lightning-fast ASGI web server
- **Pandas & NumPy**: Rigorous numeric parsing (k/m/b units, percentages), cohort aggregation, percentiles, and multi-field filtering
- **Pydantic v2**: Strict schema validation for all API inputs and outputs
- **Pytest**: Automated test suite for data cleaning, AND filtering, scoring, and API routes

### Frontend
- **React 19 with Vite 8**: Modern, reactive frontend build toolchain
- **Tailwind CSS v4**: Polished, professional UI styling with dark navy sidebar, clean cards, and purple/blue accents
- **Recharts**: Interactive data visualizations (bar charts, scatter plots, cohort distributions)
- **Lucide React**: Clean, accessible iconography
- **React Router v7**: Seamless multi-page client-side navigation

---

## 3. Kaggle Dataset Integration & Attribution

### Dataset Details
- **Dataset Name:** Top Instagram Influencers Data (Cleaned)
- **Primary Kaggle Source:** [https://www.kaggle.com/datasets/surajjha101/top-instagram-influencers-data-cleaned](https://www.kaggle.com/datasets/surajjha101/top-instagram-influencers-data-cleaned)
- **Curator:** Suraj Jha
- **Date Accessed:** October 2026
- **License / Terms:** Open Database / Public Domain Attribution

### Actual Raw Dataset Columns vs Canonical Target Fields
The raw CSV file (`backend/data/top_insta_influencers_data.csv`) was inspected prior to designing the pipeline:

| Raw CSV Column | Canonical Field Name | Data Type | Notes / Handling |
| :--- | :--- | :--- | :--- |
| `rank` | `rank` | Integer (1–200) | Global ranking in dataset |
| `channel_info` | `username` | String | Creator's Instagram username/handle |
| — | `influencer_name` | String | Verified creator display name |
| `followers` | `followers` | Float (e.g. 475.8M) | Parsed from string (`m`, `k`) to numeric float |
| `60_day_eng_rate`| `engagement_rate` | Float (e.g. 1.39%) | Parsed from percentage string to numeric value |
| `avg_likes` | `average_likes` | Float (e.g. 8.7M) | Average likes per post |
| `new_post_avg_like`| `new_post_avg_like` | Float (e.g. 6.5M) | Average likes on recent posts |
| `total_likes` | `total_likes` | Float (e.g. 29.0B) | Cumulative likes across public posts |
| `influence_score`| `influence_score` | Float (0–100) | Influencer impact score |
| `posts` | `posts` | Float (e.g. 3.3K) | Total public post count |
| `country` | `country` | String | Origin country (missing values standardized as "Unspecified") |
| — | `category` | String | Niche/Industry (Sports, Music, Fashion, etc.) |
| — | `average_comments`| Float / String | **Not available** in raw CSV. Labeled as `"Not available"`, never fabricated as 0. |

### Data Transparency Guarantees
1. **No Fake Zeros:** If a metric (e.g., average comments or conversion rates) is absent in the dataset, it is explicitly shown as `"Not available"` or disabled, never substituted with synthetic numbers.
2. **Follower Growth Disclaimer:** Since the dataset contains a single snapshot in time without dated history, historical follower growth cannot be calculated. The methodology page clearly explains this limitation.
3. **Campaign Data Separation:** Follower counts and engagement rates are not conflated with ad conversion ROI. A dedicated **Campaign Simulator** is provided for modeling potential spend scenarios with transparent formulas.

---

## 4. Application Architecture & Project Structure

```
MFDA/project/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── analytics.py          # KPI calculations, distributions, comparison logic, custom scoring
│   │   ├── category_mapping.py   # Verified metadata and creator classification taxonomy
│   │   ├── data_cleaning.py      # String-to-number parser (k/m/b/%), null handling, quality reporting
│   │   ├── data_loader.py        # Flexible column mapper and DatasetManager singleton
│   │   ├── main.py               # FastAPI application, CORS, and REST endpoint routes
│   │   └── schemas.py            # Pydantic models for request/response validation
│   ├── data/
│   │   └── top_insta_influencers_data.csv # Authentic Kaggle Top 200 dataset
│   ├── tests/
│   │   ├── test_analytics.py     # Tests for parsing, AND filtering, scoring, zero denominators
│   │   └── test_api.py           # Tests for FastAPI endpoints and JSON schemas
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # Centralized API fetch client
│   │   ├── components/
│   │   │   ├── EmptyState.jsx    # Visual feedback for no-match filter states
│   │   │   ├── GlobalFilterBar.jsx # Country/Category multi-select, sliders, search, active tags
│   │   │   ├── InfluencerDetailModal.jsx # Detailed modal with percentile standings & benchmarks
│   │   │   ├── KPICard.jsx       # Metric cards with definitions and analytical context
│   │   │   ├── LoadingSpinner.jsx # Smooth loading state indicator
│   │   │   ├── Navbar.jsx        # Top navigation and brand actions
│   │   │   ├── Sidebar.jsx       # Dark navy sidebar with responsive mobile support
│   │   │   └── Tooltip.jsx       # Accessible tooltip for analytical jargon
│   │   ├── context/
│   │   │   └── FilterContext.jsx # Global state for filters, search, and comparison list
│   │   ├── pages/
│   │   │   ├── AnalyticsMethodology.jsx # Detailed formulas, numerical examples, and business cases
│   │   │   ├── CampaignPerformance.jsx  # Interactive campaign simulator with ROI, CPA, CPC, CTR
│   │   │   ├── CompareInfluencers.jsx   # Side-by-side benchmarking of 2–5 creators
│   │   │   ├── CountryCategoryAnalysis.jsx # Macro cohort breakdown with sample sizes (n)
│   │   │   ├── DataQuality.jsx          # Records audit, missing field analysis, Kaggle attribution
│   │   │   ├── InfluencerExplorer.jsx   # Directory with search, multi-column sorting, pagination
│   │   │   └── OverviewDashboard.jsx    # KPI summary cards and 7 dynamic Recharts visuals
│   │   ├── utils/
│   │   │   └── formatters.js     # Compact numbers (K/M/B), percent, currency, and badge colors
│   │   ├── App.jsx               # React Router layout and routing
│   │   ├── index.css             # Tailwind CSS styles and font setup
│   │   └── main.jsx              # React DOM entry point
│   ├── package.json              # Frontend npm dependencies and scripts
│   └── vite.config.js            # Vite bundler configuration with backend proxy
├── pytest.ini                    # Pytest configuration
├── README.md                     # Comprehensive setup and documentation guide
└── .gitignore                    # Version control ignore rules
```

---

## 5. Navigation & Pages Walkthrough

1. **Overview Dashboard (`/`)**
   - **KPI Cards:** Total Influencers (200), Cumulative Audience Reach, Average Followers, Average 60-Day Engagement Rate, Country Count, Category Count, Average Likes.
   - **Interactive Charts (Recharts):**
     - Top Influencers by Follower Count (Audience Reach)
     - Top Influencers by 60-Day Engagement Rate
     - Creator Distribution by Category
     - Geographic Distribution by Country
     - Followers vs. Engagement Rate Scatter Plot
     - Average Follower and Engagement Performance by Category
     - Average Follower and Engagement Performance by Country
   - **Analytical Interpretations:** Concise "What does this mean?" guidelines beneath critical charts to prevent misleading conclusions.

2. **Influencer Explorer (`/explorer`)**
   - Searchable by creator name or username handle.
   - Multi-column sortable by Rank, Followers, Engagement Rate, Average Likes, Influence Score.
   - Filterable simultaneously by Country, Category, Follower range, and Engagement range.
   - Detail Modal: Click any creator to view full statistics, dataset percentiles, and comparison against top-200 benchmarks.
   - Quick "Compare" toggle to add or remove creators from the benchmarking workbench.

3. **Compare Influencers (`/compare`)**
   - Side-by-side comparison of 2 to 5 creators simultaneously.
   - Highlight badges indicating standout performance (Max Reach, Top Engagement Rate, Most Likes).
   - Comparative bar charts illustrating scale differences.
   - Strategic Campaign Advisory: Highlights why a high-engagement creator may be chosen for direct response while a mega-follower creator suits brand awareness.

4. **Country & Category Analysis (`/analysis`)**
   - Macroeconomic breakdown across all creator niches and geographic origins.
   - Toggle between **By Category** and **By Country**.
   - Highlights top engagement cohorts, highest audience sizes, and largest representations.
   - Explicit sample count badges ($n < 3$) warning of statistical variance in small cohorts.

5. **Analytics Methodology (`/methodology`)**
   - Comprehensive documentation of all analytical concepts:
     - **Follower Analysis:** Why audience scale is an estimation, not guaranteed reach.
     - **Follower Growth Limitation:** Explains why growth requires multi-period time-series data.
     - **Engagement Rate Analysis:** Follower-based formula vs. reach-based formula, with numerical examples.
     - **Content Resonance:** Per-post like averages and dataset scope.
     - **Custom Composite Scoring:** Transparent weighted formula ($w_{fol} \times \text{Norm} + w_{eng} \times \text{Norm} + w_{inf} \times \text{Norm}$) with adjustable weights.
     - **Campaign Unit Economics:** Formulas for CTR, CPC, Conversion Rate, CPA, Net Profit, ROI, and ROAS.

6. **Data Quality & Information (`/data-quality`)**
   - Live audit of active dataset: total records loaded, duplicate count (0), missing values per field.
   - Column mapping audit tracking aliases detected in uploaded CSVs.
   - Full Kaggle citation and instructions for downloading newer dataset versions.

7. **Campaign Performance Simulator (`/campaign`)**
   - Clear disclosure explaining that the Kaggle dataset does not contain proprietary client ad spend or conversion history.
   - Interactive calculator allowing marketing teams to simulate campaign scenarios with real-time computation of CTR, CPC, Conversion Rate, CPA, Net Profit, and ROI.
   - Built-in scenario presets: **Macro-Influencer Awareness Campaign**, **Micro-Influencer Conversion Drive**, and **Mid-Tier Balanced Launch**.

---

## 6. Beginner-Friendly Setup Instructions (Windows & VS Code)

### Prerequisites
- **Python 3.10 or higher** installed on Windows. Ensure "Add Python to PATH" was checked during installation.
- **Node.js (v18 or higher)** and `npm` installed.
- **VS Code** with the Python extension installed.

---

### Step 1: Open the Project in VS Code
1. Launch VS Code.
2. Go to **File -> Open Folder...** and select `b:\MFDA\project` (or your local project root).
3. Open a terminal inside VS Code: **Terminal -> New Terminal** (or press `` Ctrl + ` ``).

---

### Step 2: Set Up & Run the FastAPI Backend

1. In the terminal, navigate to the `backend` folder:
   ```powershell
   cd b:\MFDA\project\backend
   ```

2. Create a Python virtual environment:
   ```powershell
   python -m venv .venv
   ```

3. Activate the virtual environment in PowerShell:
   ```powershell
   .venv\Scripts\Activate.ps1
   ```
   *(If you see an execution policy error, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` and then run the activation script again).*

4. Install the required Python dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

5. Verify that all automated tests pass:
   ```powershell
   python -m pytest ..\backend\tests
   ```
   *(You should see `14 passed`).*

6. Start the FastAPI backend server:
   ```powershell
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

7. Verify the backend in your browser:
   - Health check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
   - Interactive Swagger API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Step 3: Set Up & Run the React Frontend

1. Open a **second terminal tab** in VS Code (click the `+` button in the terminal panel).

2. Navigate to the `frontend` folder:
   ```powershell
   cd b:\MFDA\project\frontend
   ```

3. Install frontend dependencies:
   ```powershell
   npm install
   ```

4. Start the Vite development server:
   ```powershell
   npm run dev
   ```

5. Open the web application in your browser:
   - Web Application URL: **[http://127.0.0.1:5173](http://127.0.0.1:5173)**

---

## 7. Troubleshooting Guide

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `Activate.ps1 cannot be loaded because running scripts is disabled` | Windows PowerShell execution policy restriction. | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in the PowerShell window, then retry `.venv\Scripts\Activate.ps1`. |
| `Port 8000 already in use` | Another instance of uvicorn is running. | Stop the existing process or start on a different port: `python -m uvicorn app.main:app --port 8001` and update `frontend/vite.config.js` proxy target. |
| `Failed to fetch / API connection error` in frontend | Backend server is not running on port 8000. | Ensure terminal 1 is actively running uvicorn on `http://127.0.0.1:8000`. |
| Missing CSV file error on backend startup | `top_insta_influencers_data.csv` is not in `backend/data/`. | Download `top_insta_influencers_data.csv` from Kaggle and place it in `b:\MFDA\project\backend\data\top_insta_influencers_data.csv`. |

---

## 8. Summary of Completed Deliverables

- [x] **FastAPI Backend:** Modular architecture with `main.py`, `data_loader.py`, `data_cleaning.py`, `analytics.py`, and `schemas.py`.
- [x] **React + Vite Frontend:** Modern Tailwind CSS UI with 7 dedicated pages, dark navy sidebar, and Recharts visualizations.
- [x] **Strict AND Logic Filtering:** Country, category, follower range, engagement range, and search work simultaneously across all charts and tables.
- [x] **Authentic Kaggle Data:** Exact calculations from 200 real records with no synthetic metric fabrication or fake zeros.
- [x] **Side-by-Side Influencer Comparison:** Benchmarking 2 to 5 creators with standout metric badges and strategic trade-off advice.
- [x] **Analytics Methodology Page:** Formulas, numerical examples, and business cases for follower, growth, engagement, and campaign metrics.
- [x] **Campaign Performance Simulator:** Interactive scenario modeling for spend, clicks, conversions, ROI, and CPA.
- [x] **Automated Test Suite:** 14 pytest unit tests covering data parsing, AND logic filtering, zero denominators, and API endpoints.
- [x] **Beginner-Friendly Setup Documentation:** Step-by-step instructions for Windows and VS Code.
