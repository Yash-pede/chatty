import { clerkClient, getAuth } from "@clerk/express";
import { Router } from "express";

const router = Router();

// Example route: Get user profile
router.get("/profile", (req, res) => {
  // Logic to get user profile
  res.json({ message: "User profile data" });
});

router.get('/user', async (req, res) => {
  // Use `getAuth()` to access `isAuthenticated` and the user's ID
  const { isAuthenticated, userId } = getAuth(req)

  // If user isn't authenticated, return a 401 error
  if (!isAuthenticated) {
    return res.status(401).json({ error: 'User not authenticated' })
  }

  // Use `clerkClient` to access Clerk's JS Backend SDK methods
  // and get the user's User object
  const user = await clerkClient.users.getUser(userId)

  res.json(user)
})

// Example route: Update user profile
router.put("/profile", (req, res) => {
  // Logic to update user profile
  res.json({ message: "User profile updated" });
});

export default router;