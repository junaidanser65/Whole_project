const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const vendorsRoutes = require('./routes/vendors');
 
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/vendors', vendorsRoutes); 