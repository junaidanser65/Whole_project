-- Update multiple vendors' locations near 24.826721, 67.262260
-- Adding slight variations to make them appear as different locations

-- Update Gourmet Catering (vendor_id = 1)
UPDATE vendor_locations 
SET latitude = 24.826721,
    longitude = 67.262260,
    updated_at = NOW()
WHERE vendor_id = 1;

-- Update Elegant Events (vendor_id = 2)
UPDATE vendor_locations 
SET latitude = 24.827721,
    longitude = 67.263260,
    updated_at = NOW()
WHERE vendor_id = 2;

-- Update Capture Moments (vendor_id = 3)
UPDATE vendor_locations 
SET latitude = 24.825721,
    longitude = 67.261260,
    updated_at = NOW()
WHERE vendor_id = 3;

-- Update Royal Palace (vendor_id = 4)
UPDATE vendor_locations 
SET latitude = 24.826921,
    longitude = 67.262460,
    updated_at = NOW()
WHERE vendor_id = 4;

-- Update Elite Decorators (vendor_id = 5)
UPDATE vendor_locations 
SET latitude = 24.826521,
    longitude = 67.262060,
    updated_at = NOW()
WHERE vendor_id = 5; 