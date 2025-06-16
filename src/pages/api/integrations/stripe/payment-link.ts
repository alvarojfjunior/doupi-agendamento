import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { Company } from '../../../../services/database';
import { authenticate } from '@/utils/apiAuth';

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
      companyId,
    } = req.body;

    // Validação básica
    if (!name || !amount || !successUrl || !cancelUrl || !companyId) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios: name, amount, successUrl, cancelUrl, companyId',
      });
    }

    // Buscar a empresa e suas chaves do Stripe
    const company = await Company.findById(companyId).lean();
    
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    if (!company.isStripeEnabled) {
      return res.status(400).json({ error: 'Stripe não está habilitado para esta empresa' });
    }
    
    if (!company.stripeSecretKey) {
      return res.status(400).json({ error: 'Chave secreta do Stripe não configurada para esta empresa' });
    }

    // Inicializar o Stripe com a chave da empresa
    const stripe = new Stripe(company.stripeSecretKey, {
      apiVersion: '2025-05-28.basil',
    });

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