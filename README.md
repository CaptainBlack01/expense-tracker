# TrackPulse - Expense Analytics Dashboard

TrackPulse is an analytics dashboard and expense tracker built with pure vanilla HTML, CSS, and JavaScript. Zero external frameworks, zero external charting libraries, persistent WebStorage, and strictly zero CSS variables.

## Features & Enhancements

### 1. Accurate Currency Valuation & Conversion Engine
- **12 Global & Regional Currencies**: Nigerian Naira (₦), British Pound (£), US Dollar ($), Euro (€), Canadian Dollar (C$), Australian Dollar (A$), Japanese Yen (¥), Indian Rupee (₹), South African Rand (R), Kenyan Shilling (KSh), Ghanaian Cedi (GH₵), and UAE Dirham (د.إ).
- **Proportional Value Conversion**: All underlying data is pegged to a USD benchmark. Switching to Naira immediately converts and evaluates figures with realistic exchange rates (e.g. `$1,450` rent displays as `₦2,320,000`, `$4,800` salary displays as `₦7,680,000`).
- **Live Exchange Rate Indicator**: Header badge shows current benchmark exchange rate (e.g. `1 USD = ₦1,600`).
- **Two-way Input Conversion**: When adding a transaction while viewing Naira or Pounds, entering local amounts converts them into the base storage value so currency switching remains mathematically consistent everywhere.

### 2. Month-over-Month (MoM) Growth Analytics
- Dynamic comparison badges on KPI cards displaying percentage growth vs. the previous calendar month (`+12.4% MoM`, `-4.2% MoM`).
- Intelligent coloring: green for higher income and net balance; green for reduced expenses.

### 3. Recurring Subscriptions & Fixed Bills Tracker
- Mark recurring expenses (rent, software, streaming, internet, gym) with a single toggle.
- Table tags recurring transactions with `🔁 Recurring`.
- Table filter allows viewing recurring fixed bills exclusively.
- Insight card highlights total **Monthly Fixed Commitments** (`/mo`).

### 4. Custom Date Range Filter
- Filter transactions by preset periods (*All Time, This Month, This Week, This Year*) or select a **Custom Range** (*Start Date to End Date*).

### 5. Backup & Restore (JSON / CSV Import & Export)
- **Export**: Generates RFC 4180 CSV files containing transaction metadata in both active currency and base USD.
- **Import**: Restore and merge transactions by uploading `.json` or `.csv` backup files directly in the browser.

### 6. One-Click Printable / PDF Report
- Clean print layout (`@media print`) that automatically formats the analytics cards, charts, and transaction ledger for saving as PDF or printing physical summaries.

## Tech Stack
- Vanilla HTML5
- Vanilla CSS3 (Strictly Zero CSS Variables)
- Vanilla JavaScript (ES6+, Canvas API, WebStorage, FileReader API)

## Getting Started
Clone or download this repository and open `index.html` in any web browser.
