import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Textarea } from "../components/ui/textarea"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Calendar, User, MessageCircle } from "lucide-react"
import { apiService } from "../lib/axios"

interface Post {
  _id: string
  title: string
  content: string
  author: {
    _id: string
    name: string
    email: string
  }
  tags: string[]
  publishedAt: string
}

interface Comment {
  _id: string
  content: string
  author: {
    name: string
    email: string
  }
  createdAt: string
}

export default function PostDetailPage() {
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [error, setError] = useState("")

  const { user } = useAuth()
  const { id: postId } = useParams()

  useEffect(() => {
    if (postId) {
      fetchPost()
      fetchComments()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      const response = await apiService.getPost(postId!)
      setPost(response.data)
    } catch (error) {
      setError("Failed to fetch post")
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await apiService.getComments(postId!)
      setComments(response.data.comments)
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !postId) return

    setCommentLoading(true)
    try {
      await apiService.createComment(postId, newComment)
      const response = await apiService.getComments(postId!)
      setComments(response.data.comments)
      setNewComment("")
    } catch (error) {
      setError("Failed to add comment")
    } finally {
      setCommentLoading(false)
    }
  }

  console.log(comments)
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Post Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl mb-4">{post.title}</CardTitle>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {post.author.name}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(post.publishedAt).toLocaleDateString()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card id="comments">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Comments ({comments?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
              <Button type="submit" disabled={commentLoading || !newComment.trim()}>
                {commentLoading ? "Adding..." : "Add Comment"}
              </Button>
            </form>
          ) : (
            <Alert>
              <AlertDescription>Please log in to add a comment.</AlertDescription>
            </Alert>
          )}

          {/* Comments List */}
          {comments?.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-4">
              {comments?.map((comment) => (
                <Card key={comment._id} className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{comment.author.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 