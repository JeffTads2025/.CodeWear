import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import api, { authApi } from '../../services/api';
import * as S from './styles';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import type { ApiErrorResponse } from '../../types/api';

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Formato de e-mail inválido.', { theme: 'dark' });
      return;
    }

    setLoading(true);

    try {
      const { token, user } = await authApi.login({
        email: email.toLowerCase().trim(),
        password: password.trim()
      });

      signIn({ token, user });

      if (api.defaults.headers.common) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      }

      toast.success(`Bem-vindo, ${user.name}!`, { theme: 'dark' });

      navigate('/');

    } catch (error) {
      const errorMessage = axios.isAxiosError<ApiErrorResponse>(error)
        ? error.response?.data?.message || 'E-mail ou senha incorretos.'
        : 'E-mail ou senha incorretos.';
      toast.error(errorMessage, { theme: 'dark' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <S.Container>
      <S.Content>
        <S.FormCard onSubmit={handleLogin} autoComplete="on">
          <h2>Login</h2>

          <div className="input-group">
            <label><FiMail size={14} /> E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              autoComplete="email"
              name="email"
              required
            />
          </div>

          <div className="input-group">
            <label><FiLock size={14} /> Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              name="password"
              required
            />
          </div>

          {/* O NOVO BOTÃO PADRONIZADO ABAIXO */}
          <Button type="submit" loading={loading}>
            {loading ? 'Conectando...' : 'Entrar'}
          </Button>

          <S.SignUpButton to="/signup">
            Cadastre-se
          </S.SignUpButton>
        </S.FormCard>
      </S.Content>
    </S.Container>
  );
}