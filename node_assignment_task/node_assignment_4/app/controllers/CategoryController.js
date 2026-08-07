const Category = require('../models/Category');

class CategoryController {
    async create(req, res) {
        try {
            const { name, description } = req.body;
            const category = await Category.create({ name, description });
            res.status(201).json({ success: true, data: category });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async listWithStats(req, res) {
        try {
            const categories = await Category.aggregate([
                {
                    $lookup: {
                        from: 'posts',
                        localField: '_id',
                        foreignField: 'category',
                        as: 'posts'
                    }
                },
                {
                    $addFields: {
                        totalPosts: { $size: '$posts' }
                    }
                }
            ]);
            res.status(200).json({ success: true, data: categories });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new CategoryController();
