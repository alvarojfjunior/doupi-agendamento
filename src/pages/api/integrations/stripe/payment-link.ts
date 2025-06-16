import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-05-28.basil',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const {
      name,
      description,
      amount,
      currency = 'brl',
      successUrl,
      cancelUrl,
    } = req.body;

    // Validação básica
    if (!name || !amount || !successUrl || !cancelUrl) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios: name, amount, successUrl, cancelUrl',
      });
    }

    // Cria um produto para o link de pagamento
    const product = await stripe.products.create({
      name,
      description: description || name,
    });

    // Cria um preço para o produto
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100), // Stripe trabalha com centavos
      currency,
    });

    // Cria o link de pagamento
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: successUrl,
        },
      },
      // URL para onde o cliente será redirecionado se cancelar o pagamento
      custom_text: {
        submit: {
          message: 'Prosseguir para o pagamento',
        },
      },
    });

    return res.status(200).json({
      success: true,
      url: paymentLink.url,
      id: paymentLink.id,
    });
  } catch (error: any) {
    console.error('Erro ao criar link de pagamento:', error);
    return res.status(500).json({
      error: 'Erro ao criar link de pagamento',
      message: error.message,
    });
  }
}