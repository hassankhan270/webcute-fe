import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Alert, AlertDescription } from "../components/ui/alert"
import { apiService } from "../lib/axios"

interface Post {
  _id: string
  title: string
  content: string
  tags: string[]
  status: "draft" | "published"
  author: {
    _id: string
  }
}

export default function EditPostPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [status, setStatus] = useState<"draft" | "published">("draft")
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user && id) {
      fetchPost()
    }
  }, [user, id])

  const fetchPost = async () => {
    try {
      setFetchLoading(true)
      const response = await apiService.getPost(id!)
      const postData = response.data
      if (postData.author._id !== user?.id && user?.role !== "admin") {
        setError("You are not authorized to edit this post")
        return
      }
      setPost(postData)
      setTitle(postData.title)
      setContent(postData.content)
      setTags(postData.tags.join(", "))
      setStatus(postData.status)
    } catch (err) {
      showToast({
        title: "Error",
        description: "Failed to fetch post. Please try again.",
        variant: "destructive",
      })
      navigate("/all-posts")
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id) return

    try {
      setLoading(true)
      await apiService.updatePost(id, {
        title,
        content,
        tags: tags.split(",").map((tag) => tag.trim()),
        status,
      })
      showToast({
        title: "Success",
        description: "Post updated successfully",
        variant: "success",
      })
      navigate("/all-posts")
    } catch (err) {
      showToast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Please log in to edit posts</h2>
      </div>
    )
  }

  if (fetchLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error || "Post not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your post content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="min-h-[300px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                type="text"
                placeholder="e.g., technology, programming, web development"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: "draft" | "published") => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select post status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Post"}
              </Button>
              <Button type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 