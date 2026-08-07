const Category = require('../models/Category');

class CategoryController {
    async listCategories(req, res) {
        try {
            const categories = await Category.aggregate([
                { $match: { type: 'category' } },
                {
                    $lookup: {
                        from: 'categories',
                        localField: '_id',
                        foreignField: 'parentId',
                        as: 'subcategories'
                    }
                },
                {
                    $project: {
                        name: 1,
                        subCount: { $size: '$subcategories' }
                    }
                }
            ]);

            const subcategories = await Category.aggregate([
                { $match: { type: 'subcategory' } },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'parentId',
                        foreignField: '_id',
                        as: 'parent'
                    }
                },
                { $unwind: '$parent' }
            ]);

            res.render('categories/index', { 
                title: 'Categories & Subcategories',
                categories,
                subcategories
            });
        } catch (error) {
            console.error(error);
            req.flash('error_msg', 'Error fetching categories');
            res.redirect('/dashboard');
        }
    }

    async addCategoryPage(req, res) {
        const categories = await Category.find({ type: 'category' });
        res.render('categories/add', { title: 'Add Category/Subcategory', categories });
    }

    async addCategory(req, res) {
        try {
            const { name, type, parentId } = req.body;
            
            const newCategory = new Category({
                name,
                type,
                parentId: type === 'subcategory' ? parentId : null
            });

            await newCategory.save();
            req.flash('success_msg', `${type} added successfully`);
            res.redirect('/categories');
        } catch (error) {
            req.flash('error_msg', 'Error adding category');
            res.redirect('/categories/add');
        }
    }

    async deleteCategory(req, res) {
        try {
            const category = await Category.findById(req.params.id);
            if (!category) return res.redirect('/categories');

            if (category.type === 'category') {
                await Category.deleteMany({ parentId: category._id });
            }

            await Category.findByIdAndDelete(req.params.id);
            req.flash('success_msg', 'Deleted successfully');
            res.redirect('/categories');
        } catch (error) {
            req.flash('error_msg', 'Error deleting');
            res.redirect('/categories');
        }
    }
}

module.exports = new CategoryController();
