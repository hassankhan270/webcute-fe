import { Routes, Route } from "react-router-dom"
import LoginPage from "./pages/login"
import RegisterPage from "./pages/register"
import CreatePostPage from "./pages/create-post"
import MyPostsPage from "./pages/my-posts"
import EditPostPage from "./pages/edit-post"
import PostDetailPage from "./pages/post-detail"
import Navbar from "./components/Navbar"

export default function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-6">
        <Routes>
          <Route path="/" element={<MyPostsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create-post" element={<CreatePostPage />} />
          <Route path="/all-posts" element={<MyPostsPage />} />
          <Route path="/edit-post/:id" element={<EditPostPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
        </Routes>
      </main>
    </div>
  )
} 