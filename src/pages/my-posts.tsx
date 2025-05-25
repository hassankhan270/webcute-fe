import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Calendar, Edit, Trash2, Eye, EyeOff, ExternalLink, Search, Plus } from "lucide-react"
import { apiService } from "../lib/axios"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { ConfirmModal } from "../components/ui/confirm-modal"

interface Post {
  _id: string
  title: string
  content: string
  status: "draft" | "published"
  tags: string[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

interface PostsResponse {
  posts: Post[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function MyPostsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all")
  const [deletePostId, setDeletePostId] = useState<string | null>(null)
  const postsPerPage = 10

  useEffect(() => {
    if (user) {
      fetchMyPosts()
    }
  }, [user, currentPage, searchQuery, statusFilter])

  const fetchMyPosts = async () => {
    try {
      setLoading(true)
      const response = await apiService.getPosts(currentPage, postsPerPage, statusFilter, searchQuery)
      const data: PostsResponse = response.data
      setPosts(data.posts)
      setTotalPages(data.totalPages)
      setError("")
    } catch (err) {
      setError("Failed to fetch posts")
      showToast({
        title: "Error",
        description: "Failed to fetch posts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      await apiService.deletePost(postId)
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId))
      showToast({
        title: "Success",
        description: "Post deleted successfully",
        variant: "success",
      })
    } catch (err) {
      showToast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      })
    }
    setDeletePostId(null)
  }
  const togglePostStatus = async (postId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "published" ? "draft" : "published"
      await apiService.togglePostStatus(postId, newStatus==='published' ? "unpublish" : "publish" )
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, status: newStatus } : post
        )
      )
      showToast({
        title: "Success",
        description: `Post ${newStatus === "published" ? "published" : "unpublished"} successfully`,
        variant: "success",
      })
    } catch (err) {
      showToast({
        title: "Error",
        description: "Failed to update post status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleStatusChange = (value: "all" | "draft" | "published") => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertDescription>Please log in to view your posts.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Posts</h1>
          <p className="text-gray-600">Manage your blog posts</p>
        </div>
        {user.role === "admin" && (
          <Button onClick={() => navigate("/create-post")}>
            <Plus className="h-5 w-5 mr-2" />
            Create Post
          </Button>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>

        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first blog post to get started!"}
            </p>
            {!searchQuery && statusFilter === "all" && user.role==='admin' && (
              <Link to="/create-post">
                <Button>Create Post</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Link to={`/posts/${post._id}`} className="hover:underline">
                          <CardTitle className="text-xl">{post.title}</CardTitle>
                        </Link>
                        <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                      </div>
                      <CardDescription className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Created: {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                        {post.publishedAt && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Published: {new Date(post.publishedAt).toLocaleDateString()}
                          </div>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 line-clamp-2">{post.content.substring(0, 150)}...</p>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {user?.role === "admin" && (
                        <>
                          <Link to={`/edit-post/${post._id}`}>
                            <Button size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Button size="sm" onClick={() => togglePostStatus(post._id, post.status)}>
                            {post.status === "published" ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-1" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-1" />
                                Publish
                              </>
                            )}
                          </Button>
                        </>
                      )}
                      <Link to={`/posts/${post._id}`}>
                        <Button size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                    {user?.role === "admin" && (
                      <Button size="sm" onClick={() => setDeletePostId(post._id)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!deletePostId}
        onClose={() => setDeletePostId(null)}
        onConfirm={() => deletePostId && handleDeletePost(deletePostId)}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
      />
    </div>
  )
} 