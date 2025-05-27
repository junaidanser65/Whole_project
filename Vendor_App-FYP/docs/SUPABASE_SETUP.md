# Supabase Backend Implementation Guide

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Project Structure](#project-structure)
3. [Authentication Implementation](#authentication-implementation)
4. [Database Tables and Relationships](#database-tables-and-relationships)
5. [API Layer Implementation](#api-layer-implementation)
6. [Real-time Features](#real-time-features)
7. [Security Rules](#security-rules)
8. [Testing](#testing)

## Initial Setup

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Note down the following credentials:
   - Project URL
   - Project API Key (anon, public)
   - Project API Key (service_role, private)

### 2. Install Dependencies
```bash
npm install @supabase/supabase-js
npm install @react-native-async-storage/async-storage
```

### 3. Environment Setup
Create/update `.env` file:
```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

## Project Structure

Create the following directory structure:
```
src/
├── api/
│   ├── supabase.js
│   ├── auth.js
│   ├── vendors.js
│   ├── bookings.js
│   ├── payments.js
│   └── notifications.js
└── services/
    ├── AuthService.js
    ├── VendorService.js
    ├── BookingService.js
    ├── PaymentService.js
    └── NotificationService.js
```

### Supabase Client Setup (src/api/supabase.js)
```javascript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## Authentication Implementation

### 1. Update AuthContext
Update `src/contexts/AuthContext.js` to use Supabase:

```javascript
import { supabase } from '../api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        },
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ... rest of the context
};
```

## Database Tables and Relationships

### 1. Create Database Tables
Execute the following SQL in Supabase SQL editor:

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users Profile table (extends Supabase auth.users)
create table user_profiles (
  id uuid references auth.users on delete cascade,
  first_name text,
  last_name text,
  phone_number text,
  address text,
  city text,
  state text,
  zip_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Vendors table
create table vendors (
  id uuid default uuid_generate_v4(),
  name text not null,
  description text,
  email text unique,
  phone_number text,
  website text,
  logo text,
  banner_image text,
  address text,
  city text,
  state text,
  zip_code text,
  latitude double precision,
  longitude double precision,
  category_id uuid references categories,
  is_featured boolean default false,
  avg_rating numeric(3,2) default 0,
  total_reviews integer default 0,
  status text check (status in ('active', 'inactive', 'pending')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Categories table
create table categories (
  id uuid default uuid_generate_v4(),
  name text not null,
  description text,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Services table
create table services (
  id uuid default uuid_generate_v4(),
  vendor_id uuid references vendors on delete cascade,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image text,
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Bookings table
create table bookings (
  id uuid default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  vendor_id uuid references vendors on delete cascade,
  event_date date not null,
  event_start_time time not null,
  event_end_time time not null,
  venue_address text,
  venue_city text,
  venue_state text,
  venue_zip_code text,
  total_amount decimal(10,2) not null,
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Booking Items table
create table booking_items (
  id uuid default uuid_generate_v4(),
  booking_id uuid references bookings on delete cascade,
  service_id uuid references services,
  quantity integer not null default 1,
  price decimal(10,2) not null,
  subtotal decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Reviews table
create table reviews (
  id uuid default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  vendor_id uuid references vendors on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  images text[],
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Notifications table
create table notifications (
  id uuid default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  title text not null,
  message text not null,
  type text check (type in ('booking', 'payment', 'system', 'promotion')),
  is_read boolean default false,
  related_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);
```

### 2. Set up Row Level Security (RLS)
```sql
-- Enable RLS
alter table user_profiles enable row level security;
alter table vendors enable row level security;
alter table services enable row level security;
alter table bookings enable row level security;
alter table booking_items enable row level security;
alter table reviews enable row level security;
alter table notifications enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on user_profiles for update
  using (auth.uid() = id);

-- Add more policies for other tables
```

## API Layer Implementation

### 1. Vendor Service (src/api/vendors.js)
```javascript
import { supabase } from './supabase';

export const vendorApi = {
  getVendors: async (filters = {}) => {
    let query = supabase
      .from('vendors')
      .select(`
        *,
        category:categories(*),
        services(*),
        reviews(*)
      `);

    // Apply filters
    if (filters.category) {
      query = query.eq('category_id', filters.category);
    }
    
    if (filters.location) {
      // Add location-based filtering
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getVendorById: async (id) => {
    const { data, error } = await supabase
      .from('vendors')
      .select(`
        *,
        category:categories(*),
        services(*),
        reviews(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};
```

### 2. Booking Service (src/api/bookings.js)
```javascript
import { supabase } from './supabase';

export const bookingApi = {
  createBooking: async (bookingData) => {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getUserBookings: async (userId) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        vendor:vendors(*),
        booking_items(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },
};
```

## Real-time Features

### 1. Implement Real-time Notifications
```javascript
// In NotificationService.js
const subscribeToNotifications = (userId, onNotification) => {
  const subscription = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onNotification(payload.new)
    )
    .subscribe();

  return subscription;
};
```

### 2. Implement Real-time Booking Updates
```javascript
// In BookingService.js
const subscribeToBookingUpdates = (bookingId, onUpdate) => {
  const subscription = supabase
    .channel(`booking-${bookingId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`,
      },
      (payload) => onUpdate(payload.new)
    )
    .subscribe();

  return subscription;
};
```

## Security Rules

1. Set up appropriate RLS policies for each table
2. Implement proper data validation
3. Set up proper authentication flows
4. Configure CORS settings
5. Set up proper backup procedures

## Testing

1. Set up test environment
2. Write unit tests for API functions
3. Write integration tests
4. Test real-time functionality
5. Test security rules
6. Load testing

## Next Steps

1. Implement the API layer for each feature
2. Set up error handling and logging
3. Implement caching strategies
4. Set up monitoring and analytics
5. Implement backup and recovery procedures

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react-native)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [Supabase Real-time](https://supabase.com/docs/guides/realtime) 