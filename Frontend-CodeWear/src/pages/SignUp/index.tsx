import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiLock,
  FiCreditCard,
  FiArrowLeft,
  FiShoppingCart,
  FiPhone,
  FiMapPin
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { usersApi } from '../../services/api';
import { Button } from '../../components/Button';
import { maskCPF, sanitizeCPF, validateCPF } from '../../utils/cpf';
import type { ApiErrorResponse } from '../../types/api';
import * as S from './styles';

export function SignUp() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function maskPhone(value: string) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('E-mail inválido.', { theme: 'dark' });
      return;
    }

    const cleanCpf = sanitizeCPF(cpf);
    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (!validateCPF(cleanCpf)) {
      toast.error('CPF inválido.', { theme: 'dark' });
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      toast.error('As senhas não coincidem!', { theme: 'dark' });
      return;
    }

    setLoading(true);

    try {
      await usersApi.create({
        name,
        email: cleanEmail,
        password: cleanPassword,
        cpf: cleanCpf,
        phone,
        address
      });

      toast.success('Conta criada com sucesso! Faça login para continuar.', { theme: 'dark' });
      navigate('/login');

    } catch (error) {
      const errorMessage = axios.isAxiosError<ApiErrorResponse>(error)
        ? error.response?.data?.message || 'Erro ao criar conta.'
        : 'Erro ao criar conta.';
      toast.error(errorMessage, { theme: 'dark' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <S.Container>
      <S.Content>
        <S.LogoSection>
          <div className="icon-box"><FiShoppingCart /></div>
          <h1>CodeWear</h1>
          <p>Cadastre-se</p>
        </S.LogoSection>

        <S.FormCard onSubmit={handleSubmit}>
          <h2>Cadastro</h2>

          <div className="input-group">
            <label><FiUser size={14} /> Nome Completo</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" required />
          </div>

          <div className="input-group">
            <label><FiMail size={14} /> E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemplo@email.com" required />
          </div>

          <div className="input-group">
            <label><FiCreditCard size={14} /> CPF</label>
            <input
              value={cpf}
              onChange={e => setCpf(maskCPF(e.target.value))}
              onBlur={() => {
                if (cpf && !validateCPF(cpf)) {
                  toast.error('CPF inválido.', { theme: 'dark' });
                }
              }}
              placeholder="000.000.000-00"
              required
            />
          </div>

          <div className="input-group">
            <label><FiPhone size={14} /> Telefone</label>
            <input value={phone} onChange={e => setPhone(maskPhone(e.target.value))} placeholder="(00) 00000-0000" required />
          </div>

          <div className="input-group full-width">
            <label><FiMapPin size={14} /> Endereço</label>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, número, bairro e cidade" required />
          </div>

          <div className="input-group full-width">
            <label><FiLock size={14} /> Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required />
          </div>

          <div className="input-group full-width">
            <label><FiLock size={14} /> Confirmar Senha</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repita sua senha" required />
          </div>

          <Button type="submit" loading={loading}>
            Criar Conta
          </Button>

          <Link to="/login" className="back-link">
            <FiArrowLeft /> Já tenho conta
          </Link>
        </S.FormCard>
      </S.Content>
    </S.Container>
  );
}