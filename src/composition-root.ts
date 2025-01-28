import "reflect-metadata"
import { Container } from "inversify"

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
import { LikesService } from "./features/likes/application/likes.service"
import { LikesRepo } from "./features/likes/infra/likes.repo"

export const ioc = new Container()

ioc.bind(BlogsRepository).to(BlogsRepository)
ioc.bind(BlogsQueryRepo).to(BlogsQueryRepo)
ioc.bind(BlogsService).to(BlogsService)
ioc.bind(BlogsController).to(BlogsController)

ioc.bind(PostsRepository).to(PostsRepository)
ioc.bind(PostsQueryRepo).to(PostsQueryRepo)
ioc.bind(PostsService).to(PostsService)
ioc.bind(PostsController).to(PostsController)

ioc.bind(CommentsQueryRepo).to(CommentsQueryRepo)
ioc.bind(CommentsRepo).to(CommentsRepo)
ioc.bind(CommentsService).to(CommentsService)
ioc.bind(CommentsController).to(CommentsController)

ioc.bind(LikesService).to(LikesService)
ioc.bind(LikesRepo).to(LikesRepo)