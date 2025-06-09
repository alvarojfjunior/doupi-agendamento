import { NextApiRequest, NextApiResponse } from 'next';

type ValidationRule = {
  field: string;
  required?: boolean;
  type?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
};

export const validateRequest = (rules: ValidationRule[]) => {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    const errors: Record<string, string> = {};
    
    rules.forEach(rule => {
      const value = body[rule.field];
      
      // Verificar se é obrigatório
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors[rule.field] = `O campo ${rule.field} é obrigatório`;
        return;
      }
      
      if (value !== undefined && value !== null) {
        // Verificar tipo
        if (rule.type && typeof value !== rule.type) {
          errors[rule.field] = `O campo ${rule.field} deve ser do tipo ${rule.type}`;
        }
        
        // Verificar comprimento mínimo
        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
          errors[rule.field] = `O campo ${rule.field} deve ter pelo menos ${rule.minLength} caracteres`;
        }
        
        // Verificar comprimento máximo
        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
          errors[rule.field] = `O campo ${rule.field} deve ter no máximo ${rule.maxLength} caracteres`;
        }
        
        // Verificar padrão
        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
          errors[rule.field] = `O campo ${rule.field} não está no formato correto`;
        }
        
        // Verificação personalizada
        if (rule.custom && !rule.custom(value)) {
          errors[rule.field] = `O campo ${rule.field} não atende aos requisitos personalizados`;
        }
      }
    });
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }
    
    next();
  };
};

// Funções de validação comuns
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password: string) => {
  // Pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const sanitizeInput = (input: string) => {
  // Remove caracteres potencialmente perigosos
  return input.replace(/[<>"'`;\/]/g, '');
};