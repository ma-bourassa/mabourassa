import { Handler } from '@netlify/functions';

import * as dotenv from 'dotenv';
dotenv.config();
import cookie from 'cookie';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27; cart_sessions_beta=v1;',
});

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 400,
      body: 'This was not a POST request!',
    };
  }
  const cartSessionCookie = cookie.parse(event.headers.cookie)['cart_session'];

  if (!cartSessionCookie) {
    return { statusCode: 400, body: JSON.stringify({ message: 'CartSession ID not found' }) };
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    from_cart_session: cartSessionCookie,
    success_url: process.env.URL,
    cancel_url: process.env.URL,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      checkoutUrl: checkoutSession.url,
    }),
  };
};
