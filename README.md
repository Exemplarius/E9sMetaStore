
# E9sMetaStore - Trading Actors Metastore

E9sMetaStore is a comprehensive management system for trading actors, their parameters, backtest results, and live trading data. Built with Node.js, TypeScript, and PostgreSQL.

## Features

- Complete CRUD operations for trading actors
- Parameter management for different actor configurations
- Backtest results storage and analysis
- Live trading tracking and monitoring
- RESTful API for integration with other systems

## Stuff Used

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with JSONB for flexible schema components
- **Authentication**: JWT-based authentication
- **Logging**: Winston
- **Security**: Helmet middleware, CORS, input validation

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Wake up

2. Install dependencies:
   ```
   npm install
   ```

3. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE e9s_metastore;
   ```

4. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file with your PostgreSQL credentials.

5. Run the database migrations:
   ```
   psql -U your_postgres_user -d e9s_metastore -f src/db/migrations/001_init.sql
   ```

6. Build the TypeScript code:
   ```
   npm run build
   ```

7. Start the server:
   ```
   npm start
   ```
   
   For development with hot-reload:
   ```
   npm run dev
   ```

## API Routes

### Actors

- `GET /api/actors` - Get all actors (with filtering options)
- `GET /api/actors/:id` - Get a single actor
- `POST /api/actors` - Create a new actor
- `PUT /api/actors/:id` - Update an actor
- `DELETE /api/actors/:id` - Delete an actor

### Parameters

- `GET /api/parameters` - Get all parameters (with filtering)
- `GET /api/parameters/:id` - Get a single parameter set
- `POST /api/parameters` - Create a new parameter set
- `PUT /api/parameters/:id` - Update a parameter set
- `DELETE /api/parameters/:id` - Delete a parameter set

### Backtests

- `GET /api/backtests` - Get all backtest results (with filtering)
- `GET /api/backtests/:id` - Get a single backtest result
- `POST /api/backtests` - Create a new backtest result
- `DELETE /api/backtests/:id` - Delete a backtest result

### Live Trading

- `GET /api/live-trades` - Get all live trading instances
- `GET /api/live-trades/:id` - Get a single live trading instance
- `POST /api/live-trades` - Create a new live trading instance
- `PUT /api/live-trades/:id` - Update a live trading instance
- `DELETE /api/live-trades/:id` - Delete a live trading instance

## Example Usage

### Creating a new actor

```bash
curl -X POST http://localhost:5000/api/actors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MA Crossover Actor",
    "description": "Moving average crossover trading actor",
    "author": "trading_team",
    "version": 1.0,
    "status": "development",
    "tags": ["trend-following", "technical", "equities"],
    "risk_profile": {
      "maxDrawdown": 15,
      "sharpeTarget": 1.5,
      "maxPositionSize": 5
    }
  }'
```

# Structure
```
src/
├── config/
│   ├── database.ts        # PostgreSQL connection configuration
│   ├── server.ts          # Server configuration
│   └── logger.ts          # Logging configuration
├── db/
│   ├── migrations/        # SQL migrations for database schema
│   │   ├── 001_init.sql   # Initial schema creation
│   │   └── ...            # Future migrations
│   ├── pool.ts            # PostgreSQL connection pool
│   └── queries/           # SQL query helper functions
│       ├── actors.ts      # Actor-related queries
│       ├── parameters.ts  # Parameters-related queries
│       ├── backtests.ts   # Backtest-related queries
│       └── live_trades.ts # Live trade-related queries
├── types/
│   ├── actor.ts           # Actor types
│   ├── parameter.ts       # Parameter types
│   ├── backtest.ts        # Backtest types
│   └── live_trade.ts      # Live trade types
├── controllers/
│   ├── actorController.ts     # Controllers for actor operations
│   ├── parameterController.ts # Controllers for parameters operations
│   ├── backtestController.ts  # Controllers for backtest operations
│   └── liveTradeController.ts # Controllers for live trading operations
├── routes/
│   ├── actorRoutes.ts     # API routes for actors
│   ├── parameterRoutes.ts # API routes for parameters
│   ├── backtestRoutes.ts  # API routes for backtest results
│   └── liveTradeRoutes.ts # API routes for live trading
├── middleware/
│   ├── auth.ts            # Authentication middleware
│   ├── validation.ts      # Request validation middleware
│   └── errorHandler.ts    # Error handling middleware
├── services/
│   ├── actorService.ts    # Business logic for actors
│   ├── backtestService.ts # Business logic for backtests
│   └── analyticsService.ts # Performance analytics service
├── utils/
│   └── helpers.ts         # Helper functions
├── app.ts                 # Express application setup
└── server.ts              # Server entry point
```