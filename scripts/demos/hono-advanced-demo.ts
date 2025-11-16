import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'

// Define custom environment variables for type safety
type Variables = {
  userId: string
  requestId: string
}

// Initialize Hono with typed variables
const app = new Hono<{ Variables: Variables }>()

// Global middleware - applies to all routes
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors())

// Custom middleware to add request ID
app.use('*', async (c, next) => {
  const requestId = crypto.randomUUID()
  c.set('requestId', requestId)
  await next()
})

// Public routes - no authentication required
app.get('/', (c) => {
  return c.json({
    message: 'Advanced Hono API Demo',
    version: '1.0.0',
    requestId: c.get('requestId'),
    endpoints: {
      public: ['/', '/health'],
      protected: ['/api/profile', '/api/posts']
    }
  })
})

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    requestId: c.get('requestId')
  })
})

// Protected routes - JWT authentication required
app.use('/api/*', jwt({
  secret: 'supersecret-change-in-production',
}))

app.get('/api/profile', (c) => {
  const payload = c.get('jwtPayload')
  return c.json({
    message: 'Protected profile endpoint',
    user: payload.sub,
    requestId: c.get('requestId')
  })
})

// Simulated database of posts
const posts = [
  { id: 1, title: 'Getting Started with Hono', author: 'admin', published: true },
  { id: 2, title: 'Advanced Middleware Patterns', author: 'admin', published: true },
  { id: 3, title: 'Building APIs at Edge', author: 'admin', published: false }
]

app.get('/api/posts', (c) => {
  const publishedOnly = c.req.query('published')
  const filteredPosts = publishedOnly === 'true'
    ? posts.filter(p => p.published)
    : posts
  
  return c.json({
    posts: filteredPosts,
    count: filteredPosts.length,
    requestId: c.get('requestId')
  })
})

app.get('/api/posts/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const post = posts.find(p => p.id === id)
  
  if (!post) {
    return c.json({ error: 'Post not found', requestId: c.get('requestId') }, 404)
  }
  
  return c.json({ post, requestId: c.get('requestId') })
})

// Method-specific middleware - only for DELETE
app.delete('/api/posts/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const index = posts.findIndex(p => p.id === id)
  
  if (index === -1) {
    return c.json({ error: 'Post not found', requestId: c.get('requestId') }, 404)
  }
  
  posts.splice(index, 1)
  return c.json({
    message: 'Post deleted successfully',
    id,
    requestId: c.get('requestId')
  })
})

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Route not found',
    path: c.req.path,
    requestId: c.get('requestId')
  }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`)
  return c.json({
    error: err.message,
    requestId: c.get('requestId')
  }, 500)
})

export default app
