-- Insert mock data into vendors table
INSERT INTO vendors (name, email, password, business_name, phone_number, address, profile_image, is_active) VALUES
('John Smith', 'john@catering.com', '$2b$10$YourHashedPasswordHere', 'Gourmet Catering Services', '03001234567', '123 Food Street, Karachi', 'https://images.unsplash.com/photo-1555244162-803834f70033', true),
('Sarah Khan', 'sarah@events.com', '$2b$10$YourHashedPasswordHere', 'Elegant Events & Venues', '03001234568', '456 Event Avenue, Lahore', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', true),
('Ahmed Ali', 'ahmed@photography.com', '$2b$10$YourHashedPasswordHere', 'Capture Moments Photography', '03001234569', '789 Camera Road, Islamabad', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf', true),
('Fatima Zahra', 'fatima@palace.com', '$2b$10$YourHashedPasswordHere', 'Royal Palace Events', '03001234570', '321 Palace Boulevard, Karachi', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', true),
('Usman Khan', 'usman@decor.com', '$2b$10$YourHashedPasswordHere', 'Elite Event Decorations', '03001234571', '654 Design Street, Lahore', 'https://images.unsplash.com/photo-1478146896981-b80fe463b330', true);

-- Insert mock data into vendor_locations table
INSERT INTO vendor_locations (vendor_id, address, latitude, longitude) VALUES
(1, '123 Food Street, Karachi', 24.8607, 67.0011),
(2, '456 Event Avenue, Lahore', 31.5204, 74.3587),
(3, '789 Camera Road, Islamabad', 33.6844, 73.0479),
(4, '321 Palace Boulevard, Karachi', 24.8607, 67.0011),
(5, '654 Design Street, Lahore', 31.5204, 74.3587);

-- Insert mock data into menus table
INSERT INTO menus (vendor_id, name, description, price, image, category, is_available) VALUES
-- Catering Services
(1, 'Wedding Package', 'Complete wedding catering package including appetizers, main course, and desserts', 150000.00, 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', 'Wedding', true),
(1, 'Corporate Event Package', 'Business lunch and dinner packages for corporate events', 75000.00, 'https://images.unsplash.com/photo-1555244162-803834f70033', 'Corporate', true),
(1, 'Birthday Party Package', 'Custom birthday party catering with cake and decorations', 45000.00, 'https://images.unsplash.com/photo-1520854221256-17451cc331bf', 'Birthday', true),

-- Venue Services
(2, 'Grand Ballroom', 'Elegant ballroom for weddings and large events', 200000.00, 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', 'Venue', true),
(2, 'Garden Venue', 'Beautiful outdoor garden venue for events', 150000.00, 'https://images.unsplash.com/photo-1478146896981-b80fe463b330', 'Venue', true),
(2, 'Conference Hall', 'Professional conference hall for corporate events', 100000.00, 'https://images.unsplash.com/photo-1520854221256-17451cc331bf', 'Corporate', true),

-- Photography Services
(3, 'Wedding Photography', 'Complete wedding photography package', 80000.00, 'https://images.unsplash.com/photo-1520854221256-17451cc331bf', 'Wedding', true),
(3, 'Event Coverage', 'Professional event photography services', 50000.00, 'https://images.unsplash.com/photo-1555244162-803834f70033', 'Event', true),
(3, 'Portrait Session', 'Individual and family portrait sessions', 25000.00, 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', 'Portrait', true),

-- Palace Services
(4, 'Royal Wedding Package', 'Luxury wedding package with premium services', 300000.00, 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', 'Wedding', true),
(4, 'Corporate Event Package', 'Premium corporate event services', 150000.00, 'https://images.unsplash.com/photo-1555244162-803834f70033', 'Corporate', true),
(4, 'Birthday Celebration', 'Luxury birthday celebration package', 100000.00, 'https://images.unsplash.com/photo-1520854221256-17451cc331bf', 'Birthday', true),

-- Decoration Services
(5, 'Wedding Decoration', 'Complete wedding decoration package', 120000.00, 'https://images.unsplash.com/photo-1478146896981-b80fe463b330', 'Wedding', true),
(5, 'Event Decoration', 'Professional event decoration services', 75000.00, 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', 'Event', true),
(5, 'Theme Decoration', 'Custom theme-based decoration services', 50000.00, 'https://images.unsplash.com/photo-1555244162-803834f70033', 'Theme', true);

-- Insert mock data into users table
INSERT INTO users (name, email, password, phone_number, address) VALUES
('Ali Raza', 'ali@example.com', '$2b$10$YourHashedPasswordHere', '03001234572', '123 Main Street, Karachi'),
('Sana Malik', 'sana@example.com', '$2b$10$YourHashedPasswordHere', '03001234573', '456 Park Road, Lahore'),
('Hassan Khan', 'hassan@example.com', '$2b$10$YourHashedPasswordHere', '03001234574', '789 Garden Avenue, Islamabad'),
('Ayesha Ali', 'ayesha@example.com', '$2b$10$YourHashedPasswordHere', '03001234575', '321 Lake View, Karachi'),
('Usman Malik', 'usman@example.com', '$2b$10$YourHashedPasswordHere', '03001234576', '654 Hill Road, Lahore'); 