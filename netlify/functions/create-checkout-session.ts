import { Handler } from '@netlify/functions';

import * as dotenv from 'dotenv';
dotenv.config();
import cookie from 'cookie';

const stripe = require('stripe')(process.env.SECRET_STRIPE_KEY, {
  apiVersion: '2020-08-27; cart_sessions_beta=v1;',
});

export const handler: Handler = async (event, context) => {
  const cookies = cookie.parse(event.headers?.cookie || '');
  const cartSessionCookie = cookies?.['cart_session'] || '';

  if (!cartSessionCookie) {
    return { statusCode: 400, body: JSON.stringify({ message: 'CartSession ID not found' }) };
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    from_cart_session: cartSessionCookie,
    success_url: process.env.URL,
    cancel_url: process.env.URL,
    locale: 'en',
  });

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      checkoutUrl: checkoutSession.url,
    }),
  };
};
