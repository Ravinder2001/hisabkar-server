# Hisabkar - Expense Splitting Backend

Hisabkar is a feature-rich expense splitting application with a robust backend built using **Node.js** and **PostgreSQL**. It provides secure authentication, group-based expense management, and insightful financial tracking.

## Features

- **User Authentication**: Sign Up with OTP-based email verification & Sign In via Email OTP or Google.
- **Group Management**: Create groups, invite users, and manage expenses collaboratively.
- **Expense Tracking**: Add, edit, and delete expenses with support for equal, percentage-based, or custom splits.
- **Expense Summary**: Track your **Send** & **Receive** amounts for quick settlements.
- **Audit Logs**: View changes in group expenses, including edits and deletions.
- **Spend Analysis**: Get category-wise spending breakdowns.
- **User Availability**: Mark yourself unavailable to avoid unnecessary expense allocations.
- **Notifications**: Receive notifications via **service workers** (PWA support).
- **Data Export**: Download group expense details in **Excel format**.
- **Security**: Implements JWT authentication and **AES encryption** for sensitive data.

## Tech Stack

- **Backend**: Node.js (Express.js)
- **Database**: PostgreSQL
- **Authentication**: JWT, OAuth (Google Sign-In)
- **Security**: AES Encryption, VAPID keys for push notifications
- **Email Services**: Nodemailer for OTP-based authentication
- **Cloud Storage**: Avatar generation via DiceBear API

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/hisabkar-server.git
   cd hisabkar-server
   ```
2. Install dependencies
   ```sh
   npm install
   ```
3. Setup .env

   ```sh

   NODE_ENV=prod
   PORT=5000

   # Database
   DB_URL=
   DB_HOST=
   DB_NAME=
   DB_USER=
   DB_PASSWORD=
   DB_PORT=

   # JWT Secret
   SECRET=

   # Email (Nodemailer)
   EMAIL=
   PASSWORD=

   # Avatar Generator API
   AVATAR_WEBSITE=https://api.dicebear.com/

   # Google OAuth
   GOOGLE_USER_INFO_ENDPOINT=https://www.googleapis.com/oauth2/v3/userinfo

   # Push Notification Keys
   VAPID_PUBLIC_KEY=
   VAPID_PRIVATE_KEY=

   # Crypto Encryption
   CRYPTO_SECRET_KEY=
   CRYPTO_IV=

   # PostgreSQL CA Certificate
   PG_CA_CERT=
   ```

4. Start the server
   ```sh
   npm run start
   ```
