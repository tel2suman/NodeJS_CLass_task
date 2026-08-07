const Post = require('../models/Post');
const mongoose = require('mongoose');

class PostController {
    async create(req, res) {
        try {
            const { title, content, category, tags } = req.body;
            const post = await Post.create({
                title,
                content,
                category,
                tags,
                author: req.user.id
            });
            res.status(201).json({ success: true, data: post });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const { title, content, category, tags } = req.body;
            const post = await Post.findById(req.params.id);
            if (!post) return res.status(404).json({ message: 'Post not found' });
            if (post.author.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to edit this post' });
            }

            const updatedPost = await Post.findByIdAndUpdate(
                req.params.id,
                { title, content, category, tags },
                { new: true }
            );
            res.status(200).json({ success: true, data: updatedPost });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const post = await Post.findById(req.params.id);
            if (!post) return res.status(404).json({ message: 'Post not found' });
            if (post.author.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to delete this post' });
            }

            await Post.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, message: 'Post deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async listSortedByLikes(req, res) {
        try {
            const posts = await Post.aggregate([
                {
                    $addFields: {
                        likeCount: { $size: { $ifNull: ['$likes', []] } }
                    }
                },
                {
                    $sort: { likeCount: -1 }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'author',
                        foreignField: '_id',
                        as: 'authorDetails'
                    }
                },
                {
                    $unwind: '$authorDetails'
                },
                {
                    $project: {
                        'authorDetails.password': 0,
                        'authorDetails.verificationToken': 0
                    }
                }
            ]);
            res.status(200).json({ success: true, data: posts });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new PostController();
