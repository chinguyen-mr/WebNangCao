const CartUtil = {
  getTotal(mycart) {
    var total = 0;

    for (const item of mycart) {
      total += item.product.price * item.quantity;
    }

    return total;
  },

  addToCart(context, product, quantity) {
    if (!context || !product || quantity <= 0) {
      throw new Error('Invalid parameters for addToCart');
    }

    // Ensure we have the cart array
    const mycart = Array.isArray(context.mycart) ? context.mycart : [];
    const existingItemIndex = mycart.findIndex(item =>
      item && item.product && item.product._id === product._id
    );

    if (existingItemIndex !== -1) {
      // Product already in cart, increase quantity
      mycart[existingItemIndex].quantity += quantity;
    } else {
      // Product not in cart, add new item
      mycart.push({
        product: { ...product }, // Create a copy to avoid reference issues
        quantity: quantity
      });
    }

    // Update the context with the new cart
    if (context.setMycart) {
      context.setMycart([...mycart]);
    } else {
      throw new Error('Context does not have setMycart method');
    }
  },

  removeFromCart(context, productId) {
    if (!context || !productId) {
      return;
    }

    const mycart = Array.isArray(context.mycart) ? context.mycart : [];
    const updatedCart = mycart.filter(item =>
      item && item.product && item.product._id !== productId
    );

    if (context.setMycart) {
      context.setMycart(updatedCart);
    }
  },

  updateQuantity(context, productId, newQuantity) {
    if (!context || !productId || newQuantity < 0) {
      return;
    }

    const mycart = Array.isArray(context.mycart) ? context.mycart : [];

    if (newQuantity === 0) {
      // Remove item if quantity is 0
      this.removeFromCart(context, productId);
      return;
    }

    const itemIndex = mycart.findIndex(item =>
      item && item.product && item.product._id === productId
    );

    if (itemIndex !== -1) {
      mycart[itemIndex].quantity = newQuantity;
      if (context.setMycart) {
        context.setMycart([...mycart]);
      }
    }
  }
};

export default CartUtil;