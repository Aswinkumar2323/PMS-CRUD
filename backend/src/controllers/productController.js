const Product = require('../models/Product');

// @desc    Get products
// @route   GET /api/products
// @access  Private (USER only sees their own, ADMIN sees all)
const getProducts = async (req, res) => {
  try {
    const filter = req.user.role === 'ADMIN' ? {} : { user_id: req.user._id };
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  const { name, description, price } = req.body;

  try {
    const product = new Product({
      name,
      description,
      price,
      user_id: req.user._id,
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Owner or Admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.user_id.equals(req.user._id) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'User not authorized to update this product' });
    }

    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Owner or Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.user_id.equals(req.user._id) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'User not authorized to delete this product' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
