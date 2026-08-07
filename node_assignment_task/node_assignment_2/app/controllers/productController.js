const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');

class ProductController {
    async listProducts(req, res) {
        try {
            const products = await Product.aggregate([
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categoryId',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                { $unwind: '$category' },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'subcategoryId',
                        foreignField: '_id',
                        as: 'subcategory'
                    }
                },
                { $unwind: '$subcategory' },
                {
                    $project: {
                        name: 1,
                        price: 1,
                        image: 1,
                        categoryName: '$category.name',
                        subcategoryName: '$subcategory.name'
                    }
                },
                { $sort: { createdAt: -1 } }
            ]);

            res.render('products/index', { title: 'Products', products });
        } catch (error) {
            console.error(error);
            req.flash('error_msg', 'Error fetching products');
            res.redirect('/dashboard');
        }
    }

    async addProductPage(req, res) {
        const categories = await Category.find({ type: 'category' });
        const subcategories = await Category.find({ type: 'subcategory' });
        res.render('products/add', { title: 'Add Product', categories, subcategories });
    }

    async addProduct(req, res) {
        try {
            const { name, price, description, categoryId, subcategoryId } = req.body;
            
            if (!req.file) {
                req.flash('error_msg', 'Product image is required');
                return res.redirect('/products/add');
            }

            const newProduct = new Product({
                name,
                price,
                description,
                categoryId,
                subcategoryId,
                image: req.file.filename
            });

            await newProduct.save();
            req.flash('success_msg', 'Product added successfully');
            res.redirect('/products');
        } catch (error) {
            console.error(error);
            req.flash('error_msg', 'Error adding product');
            res.redirect('/products/add');
        }
    }

    async deleteProduct(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            if (product && product.image) {
                const imagePath = path.join(__dirname, '../../public/uploads/products/', product.image);
                if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            }
            await Product.findByIdAndDelete(req.params.id);
            req.flash('success_msg', 'Product deleted successfully');
            res.redirect('/products');
        } catch (error) {
            req.flash('error_msg', 'Error deleting product');
            res.redirect('/products');
        }
    }
}

module.exports = new ProductController();
