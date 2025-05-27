-- Mock location updates for vendors
-- These updates simulate vendors moving around their cities

-- Update 1: Initial locations (same as seed data)
UPDATE vendor_locations 
SET latitude = 24.8607, longitude = 67.0011, updated_at = NOW()
WHERE vendor_id = 1; -- Gourmet Catering in Karachi

UPDATE vendor_locations 
SET latitude = 31.5204, longitude = 74.3587, updated_at = NOW()
WHERE vendor_id = 2; -- Elegant Events in Lahore

UPDATE vendor_locations 
SET latitude = 33.6844, longitude = 73.0479, updated_at = NOW()
WHERE vendor_id = 3; -- Capture Moments in Islamabad

UPDATE vendor_locations 
SET latitude = 24.8607, longitude = 67.0011, updated_at = NOW()
WHERE vendor_id = 4; -- Royal Palace in Karachi

UPDATE vendor_locations 
SET latitude = 31.5204, longitude = 74.3587, updated_at = NOW()
WHERE vendor_id = 5; -- Elite Decorations in Lahore

-- Update 2: Simulate movement after 5 minutes
UPDATE vendor_locations 
SET latitude = 24.8620, longitude = 67.0025, updated_at = DATE_ADD(NOW(), INTERVAL 5 MINUTE)
WHERE vendor_id = 1; -- Gourmet Catering moved slightly in Karachi

UPDATE vendor_locations 
SET latitude = 31.5215, longitude = 74.3600, updated_at = DATE_ADD(NOW(), INTERVAL 5 MINUTE)
WHERE vendor_id = 2; -- Elegant Events moved slightly in Lahore

UPDATE vendor_locations 
SET latitude = 33.6855, longitude = 73.0490, updated_at = DATE_ADD(NOW(), INTERVAL 5 MINUTE)
WHERE vendor_id = 3; -- Capture Moments moved slightly in Islamabad

UPDATE vendor_locations 
SET latitude = 24.8615, longitude = 67.0020, updated_at = DATE_ADD(NOW(), INTERVAL 5 MINUTE)
WHERE vendor_id = 4; -- Royal Palace moved slightly in Karachi

UPDATE vendor_locations 
SET latitude = 31.5210, longitude = 74.3595, updated_at = DATE_ADD(NOW(), INTERVAL 5 MINUTE)
WHERE vendor_id = 5; -- Elite Decorations moved slightly in Lahore

-- Update 3: Simulate movement after 10 minutes
UPDATE vendor_locations 
SET latitude = 24.8635, longitude = 67.0038, updated_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE)
WHERE vendor_id = 1; -- Gourmet Catering moved further in Karachi

UPDATE vendor_locations 
SET latitude = 31.5225, longitude = 74.3615, updated_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE)
WHERE vendor_id = 2; -- Elegant Events moved further in Lahore

UPDATE vendor_locations 
SET latitude = 33.6865, longitude = 73.0505, updated_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE)
WHERE vendor_id = 3; -- Capture Moments moved further in Islamabad

UPDATE vendor_locations 
SET latitude = 24.8625, longitude = 67.0030, updated_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE)
WHERE vendor_id = 4; -- Royal Palace moved further in Karachi

UPDATE vendor_locations 
SET latitude = 31.5220, longitude = 74.3605, updated_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE)
WHERE vendor_id = 5; -- Elite Decorations moved further in Lahore

-- Update 4: Simulate movement after 15 minutes
UPDATE vendor_locations 
SET latitude = 24.8650, longitude = 67.0050, updated_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
WHERE vendor_id = 1; -- Gourmet Catering moved to new location in Karachi

UPDATE vendor_locations 
SET latitude = 31.5235, longitude = 74.3630, updated_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
WHERE vendor_id = 2; -- Elegant Events moved to new location in Lahore

UPDATE vendor_locations 
SET latitude = 33.6875, longitude = 73.0520, updated_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
WHERE vendor_id = 3; -- Capture Moments moved to new location in Islamabad

UPDATE vendor_locations 
SET latitude = 24.8635, longitude = 67.0040, updated_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
WHERE vendor_id = 4; -- Royal Palace moved to new location in Karachi

UPDATE vendor_locations 
SET latitude = 31.5230, longitude = 74.3615, updated_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
WHERE vendor_id = 5; -- Elite Decorations moved to new location in Lahore

-- Update 5: Simulate return to original locations after 20 minutes
UPDATE vendor_locations 
SET latitude = 24.8607, longitude = 67.0011, updated_at = DATE_ADD(NOW(), INTERVAL 20 MINUTE)
WHERE vendor_id = 1; -- Gourmet Catering returned to original location

UPDATE vendor_locations 
SET latitude = 31.5204, longitude = 74.3587, updated_at = DATE_ADD(NOW(), INTERVAL 20 MINUTE)
WHERE vendor_id = 2; -- Elegant Events returned to original location

UPDATE vendor_locations 
SET latitude = 33.6844, longitude = 73.0479, updated_at = DATE_ADD(NOW(), INTERVAL 20 MINUTE)
WHERE vendor_id = 3; -- Capture Moments returned to original location

UPDATE vendor_locations 
SET latitude = 24.8607, longitude = 67.0011, updated_at = DATE_ADD(NOW(), INTERVAL 20 MINUTE)
WHERE vendor_id = 4; -- Royal Palace returned to original location

UPDATE vendor_locations 
SET latitude = 31.5204, longitude = 74.3587, updated_at = DATE_ADD(NOW(), INTERVAL 20 MINUTE)
WHERE vendor_id = 5; -- Elite Decorations returned to original location 