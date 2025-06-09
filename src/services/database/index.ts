import Mongoose from 'mongoose';
import { CompanySchema } from './schemas/company';
import { ProfessionalSchema } from './schemas/professional';
import { ServiceSchema } from './schemas/service';
import { ClientSchema } from './schemas/client';
import { CashierSchema } from './schemas/cashier';
import { ScheduleSchemaSchema } from './schemas/schedule';

import { UserSchema } from './schemas/user';
import { DossieSchema } from './schemas/dossie';
import { PasswordResetSchema } from './schemas/passwordReset';

let isConnected = false;

if (!process.env.MONGOOSE_URI) {
  console.log('erro');
  throw new Error('Invalid environment variable: "MONGOOSE_URI"');
}

Mongoose.Promise = global.Promise;

const databaseUrl = process.env.MONGOOSE_URI;

const connectToDatabase = async (): Promise<void> => {
  if (isConnected) {
    console.log('Usando conexão existente com MongoDB');
    return;
  }

  try {
    await Mongoose.connect(databaseUrl, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
    });
    isConnected = true;
    console.log('Nova conexão com MongoDB estabelecida');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    isConnected = false;
    // Tenta reconectar após 5 segundos
    setTimeout(connectToDatabase, 5000);
  }
};

// Adiciona listeners para gerenciar a conexão
Mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('MongoDB desconectado, tentando reconectar...');
  setTimeout(connectToDatabase, 5000);
});

connectToDatabase();

export const User = Mongoose.model('User', UserSchema);
export const Dossie = Mongoose.model('Dossie', DossieSchema);
export const PasswordReset = Mongoose.model(
  'PasswordReset',
  PasswordResetSchema
);
export const Company = Mongoose.model('Company', CompanySchema);
export const Professional = Mongoose.model('Professional', ProfessionalSchema);
export const Service = Mongoose.model('Service', ServiceSchema);
export const Client = Mongoose.model('Client', ClientSchema);
export const Cashier = Mongoose.model('Cashier', CashierSchema);
export const Schedule = Mongoose.model('Schedule', ScheduleSchemaSchema);
