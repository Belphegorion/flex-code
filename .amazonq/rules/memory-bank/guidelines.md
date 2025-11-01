# Development Guidelines

## Code Quality Standards

### File Structure and Organization
- **ES6 Modules**: All files use ES6 import/export syntax with `.js` extensions explicitly specified
- **Single Responsibility**: Each file has a focused purpose (controllers handle requests, models define schemas, utils contain algorithms)
- **Consistent Imports**: External dependencies first, then internal modules, organized by type
- **Named Exports**: Controllers use named exports for individual functions; models use default exports

### Naming Conventions
- **camelCase**: Variables, functions, and parameters (`calculateDistance`, `matchingSkills`, `proId`)
- **PascalCase**: React components, model names, and classes (`User`, `Profile`, `AuthProvider`)
- **UPPER_SNAKE_CASE**: Environment variables (`MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`)
- **Descriptive Names**: Function names clearly describe actions (`createEscrow`, `releasePayment`, `checkAvailabilityMatch`)
- **Consistent Suffixes**: 
  - Controllers end with `Controller` (`escrowController.js`)
  - Routes end with `Routes` (`authRoutes`)
  - Context providers end with `Provider` (`AuthProvider`)
  - Schemas end with `Schema` (`userSchema`)

### Code Formatting
- **Indentation**: 2 spaces (no tabs)
- **Line Endings**: CRLF (`\r\n`) for Windows compatibility
- **Semicolons**: Consistently used at end of statements
- **String Quotes**: Single quotes for strings, template literals for interpolation
- **Trailing Commas**: Used in multi-line arrays and objects
- **Spacing**: Space after keywords (`if (condition)`), around operators (`score += value * 0.35`)

### Documentation Standards
- **Inline Comments**: Used sparingly to explain complex logic or business rules
- **Weight Documentation**: Algorithm weights documented inline (`// Skill match (35%)`)
- **TODO Comments**: Not present - code is production-ready
- **Function Documentation**: Implicit through descriptive naming rather than JSDoc

## Semantic Patterns

### Error Handling Pattern
**Frequency**: 5/5 files

All async functions follow consistent error handling:
```javascript
export const functionName = async (req, res) => {
  try {
    // Business logic here
    res.json({ message: 'Success message', data });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error description', 
      error: error.message 
    });
  }
};
```

Key characteristics:
- Try-catch wraps all async operations
- Specific HTTP status codes (404 for not found, 403 for unauthorized, 400 for validation, 500 for server errors)
- Consistent response format with `message` and optional `error` fields
- Error messages are descriptive and user-friendly

### Authorization Pattern
**Frequency**: 4/5 files

Role-based and ownership verification:
```javascript
// Ownership check
if (job.organizerId.toString() !== req.userId.toString()) {
  return res.status(403).json({ message: 'Unauthorized' });
}

// Role-based check
if (req.user.role !== 'admin' && condition) {
  return res.status(403).json({ message: 'Unauthorized' });
}
```

Characteristics:
- Early returns for unauthorized access
- `.toString()` comparison for MongoDB ObjectIds
- Combined role and ownership checks when needed
- Middleware attaches `req.userId` and `req.user` to requests

### Database Query Pattern
**Frequency**: 5/5 files

Mongoose operations with population and filtering:
```javascript
const entity = await Model.findOne({ _id: id, userId: req.userId });
if (!entity) {
  return res.status(404).json({ message: 'Entity not found' });
}

// With population
const entities = await Model.find(filter)
  .populate('relatedField', 'field1 field2')
  .sort({ createdAt: -1 });
```

Characteristics:
- Null checks immediately after queries
- `.populate()` for related documents with field selection
- `.sort()` for consistent ordering (typically newest first)
- Filters combine authorization and query criteria

### Async/Await with Promise.all Pattern
**Frequency**: 3/5 files

Parallel async operations for performance:
```javascript
const results = await Promise.all(items.map(async (item) => {
  const result = await someAsyncOperation(item);
  return processedResult;
}));
```

Used in:
- Releasing payments to multiple professionals
- Calculating match scores for multiple jobs
- Batch operations on collections

### Validation and Early Return Pattern
**Frequency**: 5/5 files

Guard clauses prevent nested logic:
```javascript
if (!requiredField) {
  return res.status(400).json({ message: 'Field is required' });
}

if (entity.status !== 'expected') {
  return res.status(400).json({ message: 'Invalid status' });
}

// Continue with main logic
```

Characteristics:
- Validation at function start
- Early returns reduce nesting
- Specific error messages for each validation
- Status checks before state transitions

### Weighted Scoring Algorithm Pattern
**Frequency**: 2/5 files (matchingAlgorithm.js)

Multi-factor scoring with documented weights:
```javascript
let score = 0;

// Factor 1 (35%)
const factor1Score = calculateFactor1();
score += factor1Score * 0.35;

// Factor 2 (15%)
const factor2Score = calculateFactor2();
score += factor2Score * 0.15;

// Apply multiplier
score *= boostMultiplier;

return Math.round(score * 100);
```

Characteristics:
- Weights sum to 1.0 (100%)
- Each factor normalized to 0-1 range
- Comments document weight percentages
- Final score scaled to 0-100 for display

### Conditional Payment Method Pattern
**Frequency**: 2/5 files (escrowController.js)

Support for multiple payment methods:
```javascript
if (paymentMethod === 'stripe') {
  // Stripe integration
  const paymentIntent = await stripe.paymentIntents.create({...});
  // Handle Stripe-specific logic
} else {
  // Mock/fallback implementation
  // Simulate payment for development
}
```

Characteristics:
- Graceful degradation to mock payments
- Same response structure regardless of method
- Production-ready Stripe integration
- Development-friendly fallbacks

### React Context Provider Pattern
**Frequency**: 3/3 frontend files

Nested context providers for global state:
```javascript
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <JobProvider>
            {/* App content */}
          </JobProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
```

Characteristics:
- Outermost provider is theme/styling
- Router wraps authentication
- Feature-specific contexts nested inside
- Single root component structure

### Protected Route Pattern
**Frequency**: 1/1 App.jsx

Role-based route protection:
```javascript
<Route path="/path" element={
  <ProtectedRoute allowedRoles={['role1', 'role2']}>
    <ComponentName />
  </ProtectedRoute>
} />
```

Characteristics:
- Declarative role requirements
- Wrapper component handles authorization
- Consistent across all protected routes
- Multiple roles supported per route

### Socket.io Event Pattern
**Frequency**: 1/1 server.js

Event-driven real-time communication:
```javascript
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('event-name', (data) => {
    // Handle event
    io.to(roomId).emit('response-event', responseData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

Characteristics:
- Connection and disconnection logging
- Room-based messaging with `.join()` and `.to()`
- Event naming with kebab-case
- Bidirectional communication pattern

### Mongoose Schema Pattern
**Frequency**: 1/1 User.js

Comprehensive schema definitions:
```javascript
const schema = new mongoose.Schema({
  field: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  enumField: {
    type: String,
    enum: ['value1', 'value2'],
    default: 'value1'
  },
  numericField: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});
```

Characteristics:
- Explicit type definitions
- Validation rules inline (required, min, max, enum)
- String transformations (trim, lowercase)
- Timestamps enabled for audit trail
- Default values for optional fields

## Internal API Usage Patterns

### Request Object Access
```javascript
// User identification (from auth middleware)
req.userId          // Current user's ID
req.user            // Full user object with role
req.user.role       // User's role for authorization

// Route parameters
req.params.id       // URL parameter
req.params.transactionId

// Query parameters
req.query.skills    // Query string values

// Request body
req.body.jobId      // POST/PUT data
req.body.paymentMethod
```

### Response Patterns
```javascript
// Success with data
res.json({ message: 'Success', data, additionalField });

// Success with specific fields
res.json({ transactions, jobs, profile });

// Error responses
res.status(404).json({ message: 'Not found' });
res.status(403).json({ message: 'Unauthorized' });
res.status(400).json({ message: 'Validation error' });
res.status(500).json({ message: 'Error', error: error.message });
```

### Mongoose Query Methods
```javascript
// Find operations
Model.findOne({ _id: id, userId: userId })
Model.find(filter).populate('field').sort({ createdAt: -1 })
Model.findById(id).populate('relatedModel')

// Update operations
Model.findByIdAndUpdate(id, { field: value })
Model.updateMany(filter, { $set: { field: value } })
await document.save()

// Increment operations
Model.findByIdAndUpdate(id, { $inc: { counter: 1 } })

// Create operations
await Model.create({ field: value })
```

### Stripe API Usage
```javascript
// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100), // Convert to cents
  currency: 'usd',
  metadata: { jobId: jobId.toString() }
});

// Retrieve payment status
const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
if (paymentIntent.status === 'succeeded') {
  // Process successful payment
}
```

### Socket.io API Usage
```javascript
// Server-side
app.set('io', io);                    // Store io instance
const io = req.app.get('io');         // Retrieve in routes
io.to(chatId).emit('event', data);    // Emit to room

// Client-side (implied from server patterns)
socket.join(chatId);                  // Join room
socket.emit('send-message', data);    // Send to server
socket.on('receive-message', handler); // Listen for events
```

### React Router API Usage
```javascript
// Route definition
<Route path="/path/:id" element={<Component />} />

// Navigation
<Navigate to="/" replace />

// Protected routes
<Route path="/path" element={
  <ProtectedRoute allowedRoles={['role']}>
    <Component />
  </ProtectedRoute>
} />
```

## Code Idioms

### ObjectId String Comparison
```javascript
// Always convert to string for comparison
entity.userId.toString() === req.userId.toString()
```

### Null Coalescing for Defaults
```javascript
const value = user.reliabilityScore ?? 1.0;
const method = req.body.paymentMethod || 'mock';
```

### Array Filtering and Mapping
```javascript
const matching = array.filter(item => condition);
const processed = array.map(item => ({ ...item.toObject(), newField }));
```

### Ternary for Simple Conditionals
```javascript
const score = matchingWindow ? 1 : 0;
const boost = daysSinceActive <= 7 ? 1.0 : 0.8;
```

### Destructuring with Defaults
```javascript
const { jobId, paymentMethod = 'mock' } = req.body;
```

### Template Literals for IDs
```javascript
transferId: `mock_${Date.now()}`
```

### Math Operations for Scoring
```javascript
Math.max(0, 1 - (distance / 50))      // Clamp minimum
Math.min(user.noShowCount * 0.1, 0.5) // Clamp maximum
Math.round(score * 100)                // Scale to percentage
```

### Date Calculations
```javascript
const daysSince = (Date.now() - new Date(date)) / (1000 * 60 * 60 * 24);
```

## Best Practices Observed

### Security
- Passwords hashed with bcryptjs (implied from User model)
- JWT tokens for stateless authentication
- Role-based access control on all routes
- Ownership verification before mutations
- Input validation with express-validator (imported in routes)
- CORS configured with specific origin

### Performance
- Database indexes on unique fields (email)
- Selective field population to reduce payload
- Promise.all for parallel operations
- Early returns to avoid unnecessary processing
- Efficient distance calculations with Haversine formula

### Maintainability
- Consistent error handling across all endpoints
- Centralized configuration (database, stripe, cloudinary)
- Separation of concerns (models, controllers, routes, utils)
- Reusable utility functions (matching algorithm, reliability updates)
- Environment-based configuration with dotenv

### Scalability
- Background job processing with Bull queues
- Redis for queue management and caching
- Stateless authentication with JWT
- Horizontal scaling ready (no session state)
- Socket.io rooms for targeted messaging

### Code Reusability
- Shared middleware for authentication and error handling
- Utility functions for complex calculations
- Context providers for global state
- Protected route wrapper component
- Consistent response formatting

### Development Experience
- Mock payment methods for local development
- Health check endpoint for monitoring
- Detailed error messages for debugging
- Console logging for connection events
- Hot reload with nodemon and Vite HMR

## Anti-Patterns to Avoid

Based on the codebase analysis, avoid:
- Direct database queries in routes (always use controllers)
- Hardcoded values (use environment variables)
- Nested callbacks (use async/await)
- Missing error handling (always wrap in try-catch)
- Inconsistent response formats
- Missing authorization checks
- Unvalidated user input
- Exposing sensitive data in responses
- Synchronous operations in request handlers
- Missing null checks after database queries
