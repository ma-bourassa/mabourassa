import Stripe from 'stripe';

export interface IPrice extends Stripe.Price {
  product: Stripe.Product;
}

export async function getAllProducts() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY, { apiVersion: '2020-08-27; cart_sessions_beta=v1;' });

  const prices = await stripe.prices.list({
    active: true,
    expand: ['data.product'],
    limit: 10,
  });

  return <IPrice[]>prices.data;
}
