import Stripe from 'stripe';

export interface IPrice extends Stripe.Price {
  product: Stripe.Product;
}

export async function getAllProducts() {
  const stripe = new Stripe(import.meta.env.SECRET_STRIPE, { apiVersion: '2022-08-01' });

  const prices = await stripe.prices.list({
    active: true,
    expand: ['data.product'],
    limit: 10,
  });

  return <IPrice[]>prices.data;
}
