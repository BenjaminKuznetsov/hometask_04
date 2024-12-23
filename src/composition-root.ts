import { BlogsRepository } from "./features/blog/infra/blogs.repo"
import { BlogsService } from "./features/blog/application/blogs.service"
import { BlogsController } from "./features/blog/api/blogs.controller"
import { BlogsQueryRepo } from "./features/blog/infra/blogs.queryRepo"
import { PostsRepository } from "./features/posts/infra/posts.repo"
import { PostsService } from "./features/posts/application/posts.service"
import { PostsQueryRepo } from "./features/posts/infra/posts.queryRepo"
import { PostsController } from "./features/posts/api/posts.controller"
import { CommentsQueryRepo } from "./features/comments/infra/comments.queryRepo"
import { CommentsRepo } from "./features/comments/infra/comments.repo"
import { CommentsService } from "./features/comments/application/comments.service"
import { CommentsController } from "./features/comments/api/comments.controller"

const blogsRepository = new BlogsRepository()
const blogsQueryRepo = new BlogsQueryRepo()
const blogsService = new BlogsService(blogsRepository)

const postsRepository = new PostsRepository()
const postQueryRepo = new PostsQueryRepo()
const postsService = new PostsService(postsRepository, blogsRepository)

const commentsQueryRepo = new CommentsQueryRepo()
const commentsRepo = new CommentsRepo()
const commentsService = new CommentsService(commentsRepo, postsRepository)

export const blogsController = new BlogsController(
    blogsService,
    blogsQueryRepo,
    postQueryRepo,
    postsService,
)
export const postsController = new PostsController(
    postsService,
    postsRepository,
    postQueryRepo,
    commentsService,
    commentsQueryRepo,
)
export const commentsController = new CommentsController(
    commentsService,
    commentsQueryRepo,
)