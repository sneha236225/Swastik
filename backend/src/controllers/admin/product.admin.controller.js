import productModel from "../../models/product/product.model.js";

const calculateDiscount = (price, discountPrice) => {
  if (discountPrice && discountPrice < price) {
    const discountPercent = ((price - discountPrice) / price) * 100;
    return {
      effectivePrice: discountPrice,
      discountPercent: Number(discountPercent.toFixed(2))
    };
  } else {
    return {
      effectivePrice: price,
      discountPercent: 0
    };
  }
};

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      capacity,
      cartridgeLife,
      warranty,
      price,
      discountPrice,
      stock,
      variants
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Product name and price are required." });
    }

    if (isNaN(price) || Number(price) < 0) {
      return res.status(400).json({ message: "Price must be a valid non-negative number." });
    }

    if (discountPrice !== undefined) {
      if (isNaN(discountPrice) || Number(discountPrice) < 0) {
        return res.status(400).json({ message: "Discount price must be a valid non-negative number." });
      }
      if (Number(discountPrice) >= Number(price)) {
        return res.status(400).json({ message: "Discount price must be less than price." });
      }
    }

    if (stock !== undefined && (isNaN(stock) || Number(stock) < 0)) {
      return res.status(400).json({ message: "Stock must be a valid non-negative number." });
    }

    const existingProduct = await productModel.findOne({ name: name.trim() });
    if (existingProduct) {
      return res.status(409).json({ message: "Product with this name already exists." });
    }

    let images = [];
    let videos = [];

    if (req.files && req.files["images"]) {
      images = req.files["images"].map(file => {
        return `${process.env.BASE_URL}/uploads/${file.filename}`;
      });
    }

    if (req.files && req.files["videos"]) {
      videos = req.files["videos"].map(file => {
        return `${process.env.BASE_URL}/uploads/${file.filename}`;
      });
    }

    const newProduct = await productModel.create({
      name: name.trim(),
      description,
      capacity,
      cartridgeLife,
      warranty,
      price: Number(price),
      discountPrice: discountPrice !== undefined ? Number(discountPrice) : undefined,
      stock: stock !== undefined ? Number(stock) : 0,
      images,
      videos,
      variants
    });

    const discountInfo = calculateDiscount(newProduct.price, newProduct.discountPrice);

    res.status(201).json({
      message: "Product added successfully.",
      product: {
        ...newProduct._doc,
        effectivePrice: discountInfo.effectivePrice,
        discountPercent: discountInfo.discountPercent
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (updateData.price !== undefined) {
      if (isNaN(updateData.price) || Number(updateData.price) < 0) {
        return res.status(400).json({ message: "Price must be a valid non-negative number." });
      }
    }

    if (updateData.discountPrice !== undefined) {
      if (isNaN(updateData.discountPrice) || Number(updateData.discountPrice) < 0) {
        return res.status(400).json({ message: "Discount price must be a valid non-negative number." });
      }
      if (
        updateData.price !== undefined &&
        Number(updateData.discountPrice) >= Number(updateData.price)
      ) {
        return res.status(400).json({
          message: "Discount price must be less than price."
        });
      }
    }

    if (updateData.stock !== undefined) {
      if (isNaN(updateData.stock) || Number(updateData.stock) < 0) {
        return res.status(400).json({ message: "Stock must be a valid non-negative number." });
      }
    }

    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }

    let images = [];
    let videos = [];

    if (req.files && req.files["images"]) {
      images = req.files["images"].map(file => {
        return `${process.env.BASE_URL}/uploads/${file.filename}`;
      });
      updateData.images = images;
    }

    if (req.files && req.files["videos"]) {
      videos = req.files["videos"].map(file => {
        return `${process.env.BASE_URL}/uploads/${file.filename}`;
      });
      updateData.videos = videos;
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    const discountInfo = calculateDiscount(updatedProduct.price, updatedProduct.discountPrice);

    res.status(200).json({
      message: "Product updated successfully.",
      product: {
        ...updatedProduct._doc,
        effectivePrice: discountInfo.effectivePrice,
        discountPercent: discountInfo.discountPercent
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || isNaN(stock) || stock < 0) {
      return res.status(400).json({ message: "Stock must be a valid non-negative number." });
    }

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    product.stock = Number(stock);
    await product.save();

    const discountInfo = calculateDiscount(product.price, product.discountPrice);

    res.status(200).json({
      message: "Stock updated successfully.",
      product: {
        ...product._doc,
        effectivePrice: discountInfo.effectivePrice,
        discountPercent: discountInfo.discountPercent
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};
