import 'dotenv/config'
import { clerkClient, getAuth, requireAuth } from '@clerk/express'
import express from 'express'

const app = express()
const PORT = 3000

// Use requireAuth() to protect this route
// If user isn't authenticated, requireAuth() will redirect back to the homepage
app.get('/protected', requireAuth(), async (req, res) => {
  // Use `getAuth()` to get the user's `userId`
  const { userId } = getAuth(req)

  // Use Clerk's JS Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId)

  return res.json({ user })
})

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})