// Fetch the CartSession client secret
const response = await fetch('/.netlify/functions/cart-session');
const { clientSecret } = await response.json();

// Create the Cart Element
// eslint-disable-next-line no-undef
const stripe = Stripe(import.meta.env.PUBLIC_STRIPE_KEY, {
  betas: ['cart_beta_1'],
});
// If you've used the Payment Element before, you might be accustomed to passing the
// PaymentIntent client secret here while initializing elements. For Cart, you instead pass the
// CartSession client secret while creating the Cart Element on the next line.
const elements = stripe.elements();
const cartElement = elements.create('cart', { clientSecret });

// Mount the Cart Element to document.body
cartElement.mount(document.body);

const openCartButton = document.getElementById('open-cart-button');
openCartButton.addEventListener('click', cartElement.show);

const cartCountIndicator = document.getElementById('cart-count-indicator');
const updateCartItemsCount = (cartState) => {
  cartCountIndicator.textContent = cartState.lineItems.count;
};
cartElement.on('ready', updateCartItemsCount);
cartElement.on('change', updateCartItemsCount);

// Hook up the add button
const addBtns = document.querySelectorAll('[data-add-to-cart]');
const quantityInput = document.getElementById('quantity');
const errMsg = document.getElementById('error-message');

addBtns.forEach((addBtn) => {
  addBtn.addEventListener('click', async () => {
    if (addBtn.dataset.loading === 'true') {
      return;
    }

    errMsg.innerText = '';
    addBtn.dataset.loading = 'true';

    const response = await cartElement.addLineItem({
      product: addBtn.dataset.productId,
      quantity: quantityInput?.valueAsNumber || 1,
    });

    // error.message is a user friendly error message to be displayed to your customer
    if (response.error) {
      errMsg.innerText = response.error.message;
    }

    addBtn.dataset.loading = 'false';
  });
});

// Handle checkout events
cartElement.on('checkout', async () => {
  // Submit the checkout attempt to your server
  const res = await fetch('/.netlify/functions/create-checkout-session', {
    method: 'POST',
  });
  const { error, checkoutUrl } = await res.json();
  if (error) {
    // Pass the error message to be displayed if checkout failed
    cartElement.cancelCheckout(error.message);
  } else {
    // Redirect the user to the checkout URL to finish checking out
    window.location = checkoutUrl;
  }
});
