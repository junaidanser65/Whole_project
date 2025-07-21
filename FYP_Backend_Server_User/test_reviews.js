const mysql = require('mysql2/promise');

// Test database connection and reviews query
async function testReviews() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fiesta_carts_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Testing reviews database connection...');
    
    // Test 1: Check if reviews table exists and has data
    const [reviewsCount] = await pool.execute('SELECT COUNT(*) as count FROM reviews');
    console.log('Total reviews in database:', reviewsCount[0].count);
    
    // Test 2: Check if vendors table exists and has data
    const [vendorsCount] = await pool.execute('SELECT COUNT(*) as count FROM vendors');
    console.log('Total vendors in database:', vendorsCount[0].count);
    
    // Test 3: Check if users table exists and has data
    const [usersCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    console.log('Total users in database:', usersCount[0].count);
    
    // Test 4: Check if bookings table exists and has data
    const [bookingsCount] = await pool.execute('SELECT COUNT(*) as count FROM bookings');
    console.log('Total bookings in database:', bookingsCount[0].count);
    
    // Test 5: Check reviews with vendor information
    const [reviewsWithVendors] = await pool.execute(`
      SELECT r.id, r.vendor_id, v.name as vendor_name, r.rating, r.comment
      FROM reviews r
      JOIN vendors v ON r.vendor_id = v.id
      LIMIT 5
    `);
    
    console.log('Sample reviews with vendor info:');
    reviewsWithVendors.forEach(review => {
      console.log(`- Review ID: ${review.id}, Vendor: ${review.vendor_name} (ID: ${review.vendor_id}), Rating: ${review.rating}`);
    });
    
    // Test 6: Test the full query that the API uses
    const [fullQueryResult] = await pool.execute(`
      SELECT r.*, u.name as user_name, b.booking_date, b.total_amount
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      WHERE r.vendor_id = 1
      ORDER BY r.created_at DESC
    `);
    
    console.log(`Full query result for vendor ID 1: ${fullQueryResult.length} reviews`);
    if (fullQueryResult.length > 0) {
      console.log('Sample review data:', fullQueryResult[0]);
    }
    
  } catch (error) {
    console.error('Database test error:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
testReviews(); 