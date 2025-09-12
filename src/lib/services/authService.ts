// --- AJUSTE: Importamos la 'interface' User desde nuestro archivo central de tipos ---
import type { User } from '$lib/types';

// --- BASE DE DATOS SIMULADA ---
// En un futuro, esto será reemplazado por llamadas a tu API.
// --- AJUSTE: Aplicamos el tipo 'User' a nuestro objeto de maqueta ---
const mockUser: User = {
  id: 'usr_12345',
  name: 'Juan Giraldo',
  email: 'juan.perez@empresa.com',
  role: 'Gerente de Procesos',
  avatarUrl: 'https://placehold.co/128x128/EBF8FF/4299E1?text=JP'
};

/**
 * Simula la autenticación de un usuario contra un backend.
 * @param email - El correo del usuario.
 * @param password - La contraseña del usuario.
 * @returns Una promesa que resuelve con los datos del usuario si las credenciales son correctas.
 */
// --- AJUSTE: Se añaden los tipos a los parámetros y al valor de retorno de la función ---
export const authenticateUser = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    // Simulamos una pequeña demora de red
    setTimeout(() => {
      if (email === mockUser.email && password === 'password123') {
        // Credenciales correctas: devolvemos los datos del usuario
        // TypeScript verifica que 'mockUser' cumpla con la 'interface User'
        resolve(mockUser);
      } else {
        // Credenciales incorrectas: rechazamos la promesa
        reject(new Error('Credenciales incorrectas. Inténtalo de nuevo.'));
      }
    }, 800);
  });
};