<script lang="ts">
    // --- AJUSTE: Se actualizan las rutas de importación ---
    import { authStore } from '$lib/stores/authStore';
    import Icon from '$lib/components/Icon.svelte';
  
    // --- AJUSTE: Se añaden los tipos a las variables de estado ---
    let email: string = 'juan.perez@empresa.com'; // Pre-llenado para facilitar pruebas
    let password: string = 'password123';
    let errorMessage: string = '';
    let isLoading: boolean = false;
  
    async function handleLogin() {
      isLoading = true;
      errorMessage = '';
      try {
        // La lógica de login ahora está en el store
        await authStore.login(email, password);
        // El componente App.svelte se encargará de cambiar la vista
      } catch (e) {
        // --- AJUSTE: Manejo seguro del error de tipo 'unknown' ---
        // Verificamos si el error capturado es una instancia de la clase Error.
        // Si lo es, TypeScript sabrá con certeza que tiene una propiedad '.message'.
        if (e instanceof Error) {
          errorMessage = e.message;
        } else {
          errorMessage = 'Ocurrió un error inesperado.';
        }
      } finally {
        isLoading = false;
      }
    }
  </script>

<div class="login-container">
    <div class="login-card">
        <div class="logo">
            <Icon name="zap" size={32} />
            <span class="logo-text">Flowify</span>
        </div>
        <div class="header-text">
            <h2>Bienvenido de Nuevo</h2>
            <p>Inicia sesión para continuar gestionando tus procesos.</p>
        </div>

        <form on:submit|preventDefault={handleLogin}>
            {#if errorMessage}
                <div class="error-banner">
                    <Icon name="alert-circle" size={16}/>
                    {errorMessage}
                </div>
            {/if}

            <div class="form-field">
                <label for="email">Correo Electrónico</label>
                <input type="email" id="email" bind:value={email} required placeholder="tu@empresa.com"/>
            </div>
            <div class="form-field">
                <label for="password">Contraseña</label>
                <input type="password" id="password" bind:value={password} required placeholder=""/>
            </div>
            <div class="form-options">
                <label>
                    <input type="checkbox"/>
                    Recordarme
                </label>
                <div>¿Olvidaste tu contraseña?</div>
            </div>

            <button type="submit" class="login-btn" disabled={isLoading}>
                {#if isLoading}
                    <div class="spinner"></div>
                    <span>Autenticando...</span>
                {:else}
                    <Icon name="log-in" size={20}/>
                    <span>Iniciar Sesión</span>
                {/if}
            </button>
        </form>
    </div>
</div>

<style>
    .login-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100vw;
        height: 100vh;
        background-color: var(--bg-secondary);
        color: var(--text-primary);
    }
    .login-card {
        background-color: var(--bg-primary);
        padding: 3rem;
        border-radius: 16px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
        width: 100%;
        max-width: 450px;
        border: 1px solid var(--border-color);
    }
    .logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 2rem;
        justify-content: center;
    }
    .header-text {
        text-align: center;
        margin-bottom: 2rem;
    }
    .header-text h2 {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
    }
    .header-text p {
        color: var(--text-secondary);
        margin: 0;
    }

    .form-field {
        margin-bottom: 1.5rem;
    }
    .form-field label {
        display: block;
        font-weight: 500;
        margin-bottom: 0.5rem;
    }
    .form-field input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid var(--border-color);
        background-color: var(--bg-secondary);
        color: var(--text-primary);
        border-radius: 8px;
        font-size: 1rem;
        box-sizing: border-box;
    }
    
    .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.9rem;
        margin-bottom: 2rem;
    }
    .form-options label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-secondary);
    }
    

    .login-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        background-color: var(--accent-color);
        color: white;
        border: none;
        padding: 0.85rem 1.5rem;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
    }
    .login-btn:hover:not(:disabled) {
        opacity: 0.9;
    }
    .login-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .error-banner {
        background-color: #f5656520;
        color: #c53030;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
    }
    
    /* Spinner para el estado de carga */
    .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
</style>
