# MyStockWidget

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.1.5.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Firebase and stock alerts

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYFTAbgtgWFDaupZv3RCkIUPCbXtfeT-E",
  authDomain: "stock-list-8fa75.firebaseapp.com",
  projectId: "stock-list-8fa75",
  storageBucket: "stock-list-8fa75.firebasestorage.app",
  messagingSenderId: "62966239058",
  appId: "1:62966239058:web:de95a02d6ceff3b9c4f48b",
  measurementId: "G-EHTG8J1MF8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

### 52-week alert flow

The Angular app writes a `stockAlerts` document only when a fresh live quote reaches its exact 52-week high or low during the 09:00-15:00 Asia/Kolkata window. Cached quotes do not send alerts. The document ID contains the India date and symbol, so each stock is notified at most once per day.

The Cloud Function in `functions/src/index.ts` listens for those documents and independently enforces the same time window. It sends one email/SMS notification per stock per day using a Firestore daily lock. The message contains only the stock name and current price.

From the project root, install and build the function dependencies:

```bash
cd functions
npm install
npm run build
cd ..
```

Configure the notification secrets with Firebase CLI. Do not put these values in Angular code:

```bash
firebase functions:secrets:set RESEND_API_KEY
firebase functions:secrets:set RESEND_FROM_EMAIL
firebase functions:secrets:set ALERT_EMAIL_TO
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set TWILIO_FROM_NUMBER
firebase functions:secrets:set ALERT_PHONE_TO
firebase deploy --only functions
```

`RESEND_*` sends the email and `TWILIO_*` sends the SMS. Both providers are optional individually, but at least one complete provider configuration is required. Firestore must allow the Angular client to create valid `stockAlerts` documents, while production deployments should protect stock and alert writes with Firebase Authentication and security rules.