-- Insert dummy data into vendors table
INSERT INTO vendors (name, email, password, business_name, phone_number, address, profile_image, is_active) VALUES
('Gourmet Catering Co.', 'info@gourmetcatering.com', '$2b$10$YourHashedPasswordHere', 'Gourmet Catering Services', '03001234567', '123 Food Street, Karachi', 'https://images.unsplash.com/photo-1555244162-803834f70033', true),
('Elegant Events Venue', 'contact@elegantevents.com', '$2b$10$YourHashedPasswordHere', 'Elegant Events & Venues', '03001234568', '456 Event Avenue, Lahore', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', true),
('Capture Moments', 'book@capturemoments.com', '$2b$10$YourHashedPasswordHere', 'Capture Moments Photography', '03001234569', '789 Camera Road, Islamabad', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf', true),
('Royal Palace', 'events@royalpalace.com', '$2b$10$YourHashedPasswordHere', 'Royal Palace Events', '03001234570', '321 Palace Boulevard, Karachi', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', true),
('Elite Decorators', 'decor@elitedecorators.com', '$2b$10$YourHashedPasswordHere', 'Elite Event Decorations', '03001234571', '654 Design Street, Lahore', 'https://images.unsplash.com/photo-1478146896981-b80fe463b330', true);

-- Insert corresponding vendor locations
INSERT INTO vendor_locations (vendor_id, address, latitude, longitude) VALUES
(1, '123 Food Street, Karachi', 24.8607, 67.0011),
(2, '456 Event Avenue, Lahore', 31.5204, 74.3587),
(3, '789 Camera Road, Islamabad', 33.6844, 73.0479),
(4, '321 Palace Boulevard, Karachi', 24.8607, 67.0011),
(5, '654 Design Street, Lahore', 31.5204, 74.3587); 