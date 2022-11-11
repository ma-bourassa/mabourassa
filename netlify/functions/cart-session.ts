import { Handler } from '@netlify/functions';
import { Context } from '@netlify/functions/dist/function/context';
import { Event } from '@netlify/functions/dist/function/event';

import * as dotenv from 'dotenv';
dotenv.config();
import cookie from 'cookie';

const stripe = require('stripe')(process.env.SECRET_STRIPE_KEY, {
  apiVersion: '2020-08-27; cart_sessions_beta=v1;',
});

export const handler: Handler = async (event: Event, context: Context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 400,
      body: 'This was not a GET request!',
    };
  }
  const cartSessionCookie = cookie.parse(event.headers.cookie)['cart_session'];
  let cartSession;

  if (cartSessionCookie) {
    const resource = stripe.StripeResource.extend({
      request: stripe.StripeResource.method({
        method: 'GET',
        path: `cart/sessions/${cartSessionCookie}`,
      }),
    });

    cartSession = await new resource(stripe).request();
  }

  if (!cartSession) {
    const resource = stripe.StripeResource.extend({
      request: stripe.StripeResource.method({
        method: 'POST',
        path: `cart/sessions`,
      }),
    });

    cartSession = await new resource(stripe).request({
      currency: 'cad',
      settings: {
        allow_promotion_codes: false,
      },
    });
  }

  const myCookie = cookie.serialize('cart_session', cartSession.id, {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 90, // 90 days in ms
  });

  return {
    statusCode: 200,
    headers: {
      'Set-Cookie': myCookie,
    },
    body: JSON.stringify({
      clientSecret: cartSession.client_secret,
    }),
  };
};