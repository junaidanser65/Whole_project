-- Update Royal Palace's location coordinates
UPDATE vendor_locations 
SET latitude = 24.833843, 
    longitude = 67.251617, 
    updated_at = NOW() 
WHERE vendor_id = 4; 