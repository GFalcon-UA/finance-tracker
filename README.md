# Finance Tracker 💰

**Finance Tracker** is a powerful web application for managing and tracking personal financial goals. The application helps you plan your savings strategy by calculating monthly savings requirements needed to achieve all your financial objectives on time.

## ✨ Key Features

### Goal Management

- **Create financial goals** with target amounts, currencies (UAH, USD, EUR), and target dates
- **Edit and delete goals** with an intuitive interface
- **Optional categories** for organizing goals (e.g., Travel, Education)
- **Accumulated amounts** - specify how much you've already saved toward each goal
- **Automatic sorting** by target date for better planning

### Recurring Goals

- **Set up recurring financial goals** that repeat at specified intervals
- **Flexible frequency** - configure goals to repeat every N months or years
- **Payment variations**:
  - Constant Amount - same amount each period
  - Fixed Increase - increase by a fixed amount each period
  - Percentage Increase - increase by a percentage each period
  - Annual Percentage Increase - increase by an annualized percentage
- **Optional end date** for recurring goals or let them continue indefinitely

### Financial Planning

- **Intelligent algorithm** calculates monthly savings requirements
- **Global savings pool** - enter your total accumulated savings to distribute across goals
- **Multi-currency support** with automatic conversion to base currency (UAH)
- **Timeline visualization** showing monthly expenses and required savings
- **Always stay on track** - the algorithm ensures you save enough to meet all future goals

### Data Persistence

- All data stored locally in your browser using **LocalStorage**
- **Automatic category suggestions** based on previously entered values
- No server required - complete privacy for your financial data

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (version 18 or higher recommended)
- **npm** (comes with Node.js)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/GFalcon-UA/finance-tracker.git
   cd finance-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open in browser**:
   Navigate to `http://localhost:4200/`.

---

## 📖 User Guide

### Getting Started

When you first open the application, you'll see three main sections:

1. **Total Savings Input** - at the top
2. **Your Goals** - list of all your financial goals
3. **Financial Plan** - calculated savings strategy

### Adding a Financial Goal

1. Click the **"Add New Goal"** button (usually prominent on the interface)

2. Fill in the goal details:
   - **Goal Name** (required) - e.g., "New Car", "Vacation to Italy"
   - **Amount** (required) - the target amount you need
   - **Currency** - select UAH, USD, or EUR
   - **Accumulated Amount** (optional) - how much you've already saved for this goal in the selected currency
   - **Target Date** (required) - when you want to achieve this goal
   - **Category** (optional) - type a category name; previously used categories will appear as suggestions

3. **(Optional) Configure as Recurring Goal**:
   - Check the **"Recurring Goal"** checkbox
   - **Payment Schedule** - choose how the amount changes over time:
     - *Constant Amount* - same amount each time (default)
     - *Increase by Fixed Amount* - add a specific amount each period
     - *Increase by Percent* - increase by a percentage each period
     - *Increase by Annual Percent* - annualized percentage increase
   - **Frequency** - specify "Every N Month(s)" or "Every N Year(s)"
   - **End Date** (optional) - when the recurring goal should stop

4. Click **"Add Goal"** to save

### Managing Your Global Savings

At the top of the page, you'll find the **"Total Savings / Deposit (Base Currency)"** input:

1. Enter the total amount you have saved up (in UAH, the base currency)
2. This amount will be automatically distributed to cover your goals, starting with the earliest ones
3. The financial plan will update automatically to show how much more you need to save

### Editing a Goal

1. Find the goal in the **"Your Goals"** section
2. Click the **"Edit"** button on the goal card
3. Modify any fields as needed
4. Click **"Update Goal"** to save changes

### Deleting a Goal

1. Find the goal you want to remove
2. Click the **"Delete"** button
3. Confirm the deletion when prompted

### Understanding the Financial Plan

The **Financial Plan** section shows:

- **Monthly Savings Target** (highlighted at top) - the amount you should save each month to meet all your goals on time
- **Monthly Timeline Table**:
  - **Month** - timeline from now until your last goal
  - **Expenses** - goals that are due in this month (shown with red badge)
  - **Required Savings** - the monthly savings amount needed to stay on track

The plan automatically recalculates when you:

- Add, edit, or delete goals
- Change your global savings amount
- Modify recurring goal settings

---

## 🛠️ Technical Information

### Technology Stack

- **Framework**: Angular 21.0.0 (Standalone)
- **Language**: TypeScript 5.9.2
- **Build Tool**: Angular CLI
- **Styling**: SCSS with modern CSS features (Flexbox, Grid)
- **Data Storage**: Browser LocalStorage
- **Architecture**: Standalone components (modern Angular approach)

### Project Structure

```text
src/
├── app/
│   ├── components/
│   │   ├── goal-form/
│   │   │   └── goal-form.component.ts   # Add/Edit goal form
│   │   ├── goal-list/
│   │   │   └── goal-list.component.ts   # Display goals grid
│   │   └── plan/
│   │       └── plan.component.ts        # Financial plan display
│   ├── models/
│   │   └── goal.model.ts                # Goal data structure
│   ├── services/
│   │   └── goal.service.ts              # Business logic & calculations
│   ├── pipes/
│   │   └── remove-currency.pipe.ts       # Currency formatting
│   ├── app.ts                           # Main app component
│   ├── app.html                         # App template
│   └── app.config.ts                    # App configuration
├── styles.scss                          # Global styles
├── main.ts                              # Application entry point
└── index.html                           # HTML entry point
```

### Key Components

- **GoalFormComponent** - Reactive form for creating/editing goals with validation and category suggestions.
- **GoalListComponent** - Displays goals as cards with sorting, global savings input, and actions.
- **PlanComponent** - Calculates and displays the monthly financial plan with a timeline.
- **GoalService** - Central service for managing goal data, performing calculations, and handling LocalStorage.

### Calculation Algorithm

The financial plan uses a sophisticated algorithm that:

1. Expands recurring goals into individual instances
2. Sorts all goals chronologically
3. Distributes the global savings pool across goals (earliest first)
4. Converts all amounts to base currency (UAH) for calculations
5. Calculates cumulative expenses and required monthly savings
6. Ensures you always save enough to meet future deadlines

**Currency Conversion Rates** (currently hardcoded):

- USD = 41 UAH
- EUR = 44 UAH
- UAH = 1 UAH

---

## 💻 Development

### Development Server

```bash
ng serve
```

Navigate to `http://localhost:4200/`

### Build for Production

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

### Deployment

The project is configured for automatic deployment to **GitHub Pages** via GitHub Actions.

- **Workflow**: `.github/workflows/page.yml`
- **Trigger**: Automatic deployment on every push to the `main` branch.
- **URL**: The application is typically available at `https://<username>.github.io/finance-tracker/` (depending on your GitHub configuration).

### Code Scaffolding

Generate a new component:

```bash
ng generate component component-name
```

### Running Tests

```bash
ng test
```

### Code Style

The project uses Prettier for code formatting:

- Print width: 100
- Single quotes: enabled
- Angular parser for HTML templates

---

## 📝 Data Storage

All data is stored in your browser's LocalStorage:

- **Goals** - stored as `financial_goals`
- **Categories** - stored as `financial_categories`  
- **Global Amount** - stored as `financial_global_amount`

**Note**: Clearing browser data will delete all your goals. Consider exporting your data periodically if needed.

---

## 🌐 Browser Compatibility

Works best in modern browsers:

- Chrome/Edge (recommended)
- Firefox
- Safari (with webkit prefixes for backdrop filters)

---

## 📄 License

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 21.0.0.

For more information on Angular CLI commands, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

---

## 🤝 Contributing

This is a personal finance tracker. Feel free to fork and customize for your own needs!

---

### Happy Financial Planning! 🎯📊
