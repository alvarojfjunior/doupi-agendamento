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

// Variável global para armazenar a conexão entre invocações serverless
declare global {
  var mongoose: {
    conn: typeof Mongoose | null;
    promise: Promise<typeof Mongoose> | null;
  };
}

// Inicializa a variável global se não existir
global.mongoose = global.mongoose || { conn: null, promise: null };

if (!process.env.MONGOOSE_URI) {
  console.log('erro');
  throw new Error('Invalid environment variable: "MONGOOSE_URI"');
}

const databaseUrl = process.env.MONGOOSE_URI;

async function connectToDatabase() {
  if (global.mongoose.conn) {
    return global.mongoose.conn;
  }

  // Se uma conexão está sendo estabelecida, aguarde-a
  if (!global.mongoose.promise) {
    const opts = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
    };

    // Armazena a promessa de conexão para reutilização
    global.mongoose.promise = Mongoose.connect(databaseUrl, opts)
      .then((mongoose) => {
        console.log('Nova conexão com MongoDB estabelecida');
        return mongoose;
      })
      .catch((error) => {
        console.error('Erro ao conectar ao MongoDB:', error);
        global.mongoose.promise = null; // Reseta a promessa em caso de erro
        throw error;
      });
  }

  try {
    // Aguarda a promessa de conexão ser resolvida
    const mongoose = await global.mongoose.promise;
    global.mongoose.conn = mongoose;
    return mongoose;
  } catch (error) {
    global.mongoose.promise = null;
    throw error;
  }
}

// Garante que a conexão seja estabelecida antes de exportar os modelos
connectToDatabase().catch(console.error);

// Adiciona listener para reconexão em caso de desconexão
Mongoose.connection.on('disconnected', () => {
  console.log('MongoDB desconectado, tentando reconectar...');
  global.mongoose.conn = null;
  global.mongoose.promise = null;
  // Tenta reconectar após um breve atraso
  setTimeout(() => connectToDatabase().catch(console.error), 5000);
});

// Exporta os modelos
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
