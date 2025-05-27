# Vendors & Caterers Booking App - App Flow & Features

## Overview
The **Vendors & Caterers Booking App** allows users to find, book, and manage vendors and caterers for their events and venues. The app provides a seamless experience with a map-based dashboard, AI-powered recommendations, and an intuitive booking and payment process.

## Tech Stack:
- Frontend: React Native with JavaScript, Expo, and React Navigation
- Backend/Database: Supabase
- UI Framework: Material-UI

## App Flow

### 1. Welcome Screen
- The user sees a **clean and minimalistic** welcome screen.
- Options to **Sign Up** or **Log In**.
- Users sign up using **email authentication**.

### 2. Main Dashboard
After signing in, the user is redirected to the **Main Dashboard**, which contains:
- **Interactive Map**: Displays vendors and caterers by location.
- **Category Filters**: Users can filter vendors based on their preferred category.
- **AI-Powered Recommendations**: A list of vendors sorted based on priority AI suggestions.
- **Navigation Icons**:
  - **User Profile Icon** → Access to profile and settings.
  - **Booking Cart Icon** → Access to saved bookings.

### 3. Vendor & Caterer Details Page
When a user clicks on a vendor or caterer, they land on the **Vendor Details Page**, which includes:
- **Vendor Information** (Name, Location, Services, Reviews, etc.).
- **Product Listings** (Menu, Packages, Prices, etc.).
- **Add to Booking Button**.

### 4. Booking Process
- After clicking **Add to Booking**, the user is prompted to enter:
  - **Personal Details** (Name, Contact, etc.).
  - **Venue Details** (Location, Date, Time, etc.).
- Once submitted, the booking is added to the **Booking Cart**.

### 5. Booking Cart
- Users can view their **saved bookings**.
- Option to **Proceed to Payment**.

### 6. Payment Process
- Clicking **Proceed to Payment** initiates the **Payment Method Selection**.
- Users can choose from saved payment methods or add a new one.
- Secure payment processing and confirmation.

### 7. User Profile & Settings
Clicking the **User Profile Icon** opens a menu with:
- **My Profile** (Edit personal details).
- **Payment Methods** (Manage payment options).
- **Settings** (Customize app preferences).
- **Help** (FAQs, Customer Support).
- **Privacy Policy** (View terms and policies).
- **Log Out**.

## Key Features
1. **Map-Based Vendor Discovery**
2. **AI-Powered Vendor Recommendations**
3. **Seamless Booking & Payment Flow**
4. **Profile & Settings Management**
5. **Secure Authentication & Payments**

## Conclusion
This structured flow provides an easy-to-understand roadmap for developers, ensuring a smooth user experience and efficient vendor discovery and booking system.

## Database Schema

#Users

id: uuid (primary key)
email: string (unique)
password_hash: string
first_name: string
last_name: string
phone_number: string
created_at: timestamp
updated_at: timestamp

#User_Profiles

id: uuid (primary key)
user_id: uuid (foreign key to Users.id)
profile_picture: string (URL)
address: string
city: string
state: string
zip_code: string
preferences: jsonb
created_at: timestamp
updated_at: timestamp

#Vendors

id: uuid (primary key)
name: string
description: text
email: string
phone_number: string
website: string
logo: string (URL)
banner_image: string (URL)
address: string
city: string
state: string
zip_code: string
latitude: float
longitude: float
category_id: uuid (foreign key to Categories.id)
is_featured: boolean
avg_rating: float
total_reviews: integer
status: enum ('active', 'inactive', 'pending')
created_at: timestamp
updated_at: timestamp

#Categories

id: uuid (primary key)
name: string
description: text
icon: string (URL)
created_at: timestamp
updated_at: timestamp

#Services

id: uuid (primary key)
vendor_id: uuid (foreign key to Vendors.id)
name: string
description: text
price: decimal
image: string (URL)
is_available: boolean
created_at: timestamp
updated_at: timestamp

#Service_Packages

id: uuid (primary key)
vendor_id: uuid (foreign key to Vendors.id)
name: string
description: text
price: decimal
image: string (URL)
is_featured: boolean
created_at: timestamp
updated_at: timestamp

#Package_Services

id: uuid (primary key)
package_id: uuid (foreign key to Service_Packages.id)
service_id: uuid (foreign key to Services.id)
created_at: timestamp
updated_at: timestamp

#Reviews

id: uuid (primary key)
user_id: uuid (foreign key to Users.id)
vendor_id: uuid (foreign key to Vendors.id)
rating: integer
comment: text
images: array of strings (URLs)
created_at: timestamp
updated_at: timestamp

#Bookings

id: uuid (primary key)
user_id: uuid (foreign key to Users.id)
vendor_id: uuid (foreign key to Vendors.id)
event_date: date
event_start_time: time
event_end_time: time
venue_address: string
venue_city: string
venue_state: string
venue_zip_code: string
venue_latitude: float
venue_longitude: float
total_amount: decimal
status: enum ('pending', 'confirmed', 'completed', 'cancelled')
notes: text
created_at: timestamp
updated_at: timestamp

#Booking_Items

id: uuid (primary key)
booking_id: uuid (foreign key to Bookings.id)
service_id: uuid (foreign key to Services.id, nullable)
package_id: uuid (foreign key to Service_Packages.id, nullable)
quantity: integer
price: decimal
subtotal: decimal
created_at: timestamp
updated_at: timestamp

#Payments

id: uuid (primary key)
booking_id: uuid (foreign key to Bookings.id)
user_id: uuid (foreign key to Users.id)
amount: decimal
payment_method_id: uuid (foreign key to Payment_Methods.id)
transaction_id: string
status: enum ('pending', 'completed', 'failed', 'refunded')
created_at: timestamp
updated_at: timestamp

#Payment_Methods

id: uuid (primary key)
user_id: uuid (foreign key to Users.id)
provider: string
last_four: string
expiry_month: integer
expiry_year: integer
is_default: boolean
card_type: string
created_at: timestamp
updated_at: timestamp

#Favorites

id: uuid (primary key)
user_id: uuid (foreign key to Users.id)
vendor_id: uuid (foreign key to Vendors.id)
created_at: timestamp
updated_at: timestamp

#Notifications

id: uuid (primary key)
user_id: uuid (foreign key to Users.id)
title: string
message: text
type: enum ('booking', 'payment', 'system', 'promotion')
is_read: boolean
related_id: uuid (could be booking_id, payment_id, etc.)
created_at: timestamp
updated_at: timestamp

#AI_Recommendation_Logs

id: uuid (primary key)
user_id: uuid (foreign key to Users.id)
vendor_id: uuid (foreign key to Vendors.id)
score: float
factors: jsonb
created_at: timestamp
updated_at: timestamp


## Project Structure

vendors-caterers-app/
│
├── assets/                 # Static assets like images, fonts
│   ├── fonts/
│   ├── images/
│   └── icons/
│
├── src/
│   ├── api/                # API service layer
│   │   ├── supabase.js     # Supabase client configuration
│   │   ├── auth.js         # Authentication API functions
│   │   ├── vendors.js      # Vendors API functions
│   │   ├── bookings.js     # Bookings API functions
│   │   └── payments.js     # Payments API functions
│   │
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Shared components
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── Loader.js
│   │   │   └── ...
│   │   │
│   │   ├── vendor/         # Vendor specific components
│   │   ├── map/            # Map related components
│   │   ├── booking/        # Booking process components
│   │   ├── payment/        # Payment process components
│   │   └── profile/        # User profile components
│   │
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.js
│   │   ├── BookingContext.js
│   │   └── ...
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useBooking.js
│   │   └── ...
│   │
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── ...
│   │
│   ├── screens/            # App screens
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.js
│   │   │   ├── LoginScreen.js
│   │   │   └── SignupScreen.js
│   │   │
│   │   ├── dashboard/
│   │   │   ├── MainDashboardScreen.js
│   │   │   └── ...
│   │   │
│   │   ├── vendor/
│   │   │   ├── VendorDetailsScreen.js
│   │   │   ├── VendorListScreen.js
│   │   │   └── ...
│   │   │
│   │   ├── booking/
│   │   │   ├── BookingCartScreen.js
│   │   │   ├── BookingFormScreen.js
│   │   │   └── ...
│   │   │
│   │   ├── payment/
│   │   │   ├── PaymentMethodsScreen.js
│   │   │   ├── PaymentConfirmationScreen.js
│   │   │   └── ...
│   │   │
│   │   └── profile/
│   │       ├── UserProfileScreen.js
│   │       ├── SettingsScreen.js
│   │       └── ...
│   │
│   ├── services/           # Business logic services
│   │   ├── aiRecommendation.js
│   │   ├── locationService.js
│   │   └── ...
│   │
│   ├── store/              # State management (if using Redux)
│   │   ├── actions/
│   │   ├── reducers/
│   │   ├── selectors/
│   │   └── index.js
│   │
│   ├── styles/             # Global styles
│   │   ├── colors.js
│   │   ├── typography.js
│   │   ├── spacing.js
│   │   └── theme.js
│   │
│   ├── utils/              # Utility functions
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── ...
│   │
│   └── App.js              # Root component
│
├── .gitignore
├── app.json                # Expo configuration
├── babel.config.js
├── CONTEXT.md              # Project context and documentation
├── package.json
└── README.md