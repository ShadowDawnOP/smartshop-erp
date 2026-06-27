# SmartShop ERP

A full-stack retail management platform for small shop owners to manage
inventory, billing, customers, and credit tracking.

## Features

- JWT authentication with Owner and Employee roles
- Product inventory with low stock alerts
- Billing system with automatic stock deduction
- PDF invoice generation and CSV export
- Udhaar (credit) tracking with partial payment history
- Analytics dashboard with revenue charts
- Search, filtering, and pagination

## Tech Stack

- **Backend:** Node.js, Express.js, REST API
- **Database:** MongoDB, Mongoose
- **Frontend:** HTML, CSS, Vanilla JavaScript, Chart.js
- **Auth:** JWT, bcrypt
- **Tools:** PDFKit, json2csv

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running locally

### Installation

clone the repository and run npm install

### Environment Variables

PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/shopdb
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d

## Default Login

After running seed.js:
- Owner: owner@shopsakhi.com / owner123@Yo
- Employee: ravi@shopsakhi.com / ravi123