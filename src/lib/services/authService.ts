import type { User } from '$lib/types';
import { users } from '$lib/data/users'; // Importamos la lista de usuarios

// El servicio ahora usará el primer usuario de nuestra lista de datos como el usuario "correcto".
const authenticatedUser: User = users[0]; // Ana García (admin)

/**
 * Simula la autenticación de un usuario.
 * Ahora, en lugar de un mock local, valida contra el email del primer usuario de nuestros datos.
 */
export const authenticateUser = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Comparamos con el email del usuario de datos y una contraseña fija.
      if (email === authenticatedUser.email && password === 'password123') {
        resolve(authenticatedUser); // Devolvemos el objeto de usuario completo y consistente.
      } else {
        reject(new Error('Credenciales incorrectas. Inténtalo de nuevo.'));
      }
    }, 800);
  });
};
