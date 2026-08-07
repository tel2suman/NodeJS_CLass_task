const Product = require('../models/Product');
const Category = require('../models/Category');

class DashboardController {
    async index(req, res) {
        try {
            const totalProducts = await Product.countDocuments();

            const categoryStats = await Category.aggregate([
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 }
                    }
                }
            ]);

            let totalCategories = 0;
            let totalSubcategories = 0;
            
            categoryStats.forEach(stat => {
                if (stat._id === 'category') totalCategories = stat.count;
                if (stat._id === 'subcategory') totalSubcategories = stat.count;
            });

            const productByCat = await Product.aggregate([
                {
                    $group: {
                        _id: '$categoryId',
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                { $unwind: '$category' },
                {
                    $project: {
                        name: '$category.name',
                        count: 1
                    }
                }
            ]);

            const productBySubCat = await Product.aggregate([
                {
                    $group: {
                        _id: '$subcategoryId',
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'subcategory'
                    }
                },
                { $unwind: '$subcategory' },
                {
                    $project: {
                        name: '$subcategory.name',
                        count: 1
                    }
                }
            ]);

            res.render('dashboard/index', {
                title: 'Dashboard',
                stats: {
                    totalProducts,
                    totalCategories,
                    totalSubcategories,
                    productByCat,
                    productBySubCat
                }
            });

        } catch (error) {
            console.error(error);
            req.flash('error_msg', 'Error loading dashboard');
            res.redirect('/auth/login');
        }
    }
}

module.exports = new DashboardController();
