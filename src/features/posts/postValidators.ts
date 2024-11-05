import { body } from "express-validator"
import { blogsService } from "../blog/blogsService"

const titleValidator = body("title")
    .isString()
    .withMessage("Title should be a string")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Title length should be between 3 and 30 characters")

const shortDescriptionValidator = body("shortDescription")
    .isString()
    .withMessage("Short description should be a string")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Short description length should be between 3 and 100 characters")

const contentValidator = body("content")
    .isString()
    .withMessage("Content should be a string")
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage("Content length should be between 3 and 1000 characters")

const blogIdValidator = body("blogId").custom(async (blogId) => {
    const blog = await blogsService.getBlogById(blogId)
    if (!blog) {
        throw new Error("Blog with such id not found")
    }
    return true
})

export const postValidators = [ titleValidator, shortDescriptionValidator, contentValidator, blogIdValidator ]