import { useState, useEffect } from 'react';
import { FiUser, FiEdit2, FiSave, FiMapPin, FiPhone, FiHash, FiLock, FiX } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../../services/api';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { maskCPF, sanitizeCPF, validateCPF } from '../../utils/cpf';
import type { ApiErrorResponse, UserUpdateInput } from '../../types/api';
import * as S from './styles';

type ProfileFormData = {
  name: string;
  phone: string;
  address: string;
  cpf: string;
  password: string;
};

function maskPhone(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
}

function isProfileDataComplete(user: {
  cpf?: string;
  phone?: string;
  address?: string;
} | null): boolean {
  return Boolean(user?.cpf && user?.phone && typeof user?.address === 'string');
}

function validatePasswordFields(password: string, confirmPassword: string): string | null {
  if (password.length === 0) {
    return null;
  }

  const cleanPassword = password.trim();
  const cleanConfirmPassword = confirmPassword.trim();

  if (cleanPassword.length < 8) {
    return 'Senha mínima: 8 caracteres.';
  }

  if (cleanPassword !== cleanConfirmPassword) {
    return 'As senhas não coincidem!';
  }

  return null;
}

function buildProfileUpdateData(formData: ProfileFormData): UserUpdateInput {
  const cleanCPF = sanitizeCPF(formData.cpf);
  const cleanPhone = formData.phone.replace(/\D/g, '');

  const updateData: UserUpdateInput = {
    name: formData.name,
    phone: cleanPhone,
    address: formData.address,
    cpf: cleanCPF
  };

  if (formData.password.trim() !== '') {
    updateData.password = formData.password.trim();
  }

  return updateData;
}

function formatProfileFormUser(nextUser: {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  cpf?: string;
}) {
  return {
    name: nextUser.name || '',
    email: nextUser.email || '',
    phone: maskPhone(nextUser.phone || ''),
    address: nextUser.address || '',
    cpf: maskCPF(nextUser.cpf || '')
  };
}

export function Profile() {
  const navigate = useNavigate();
  const { user, signOut, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCancellingAccount, setIsCancellingAccount] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const hydrateProfileForm = (nextUser: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    cpf?: string;
  }) => {
    const formattedUser = formatProfileFormUser(nextUser);
    setName(formattedUser.name);
    setEmail(formattedUser.email);
    setPhone(formattedUser.phone);
    setAddress(formattedUser.address);
    setCpf(formattedUser.cpf);
  };

  useEffect(() => {
    if (user) {
      hydrateProfileForm(user);
    }

    if (isProfileDataComplete(user)) {
      return;
    }

    async function loadProfile() {
      try {
        const profile = await usersApi.getProfile();
        hydrateProfileForm(profile);
      } catch {
        toast.error('Erro ao carregar dados do perfil.');
      }
    }
    loadProfile();
  }, [user]);

  async function handleSave() {
    const passwordValidationError = validatePasswordFields(password, confirmPassword);
    if (passwordValidationError) {
      return toast.error(passwordValidationError);
    }

    setLoading(true);
    try {
      const cleanCPF = sanitizeCPF(cpf);

      if (cleanCPF && !validateCPF(cleanCPF)) {
        toast.error('CPF inválido.');
        setLoading(false);
        return;
      }

      const updateData = buildProfileUpdateData({
        name,
        phone,
        address,
        cpf,
        password
      });
      const cleanPhone = updateData.phone || '';

      await usersApi.updateProfile(updateData);
      const refreshedUser = await usersApi.getProfile();
      updateUser(refreshedUser);

      toast.success('Perfil atualizado!', { theme: 'dark' });
      setIsEditing(false);
      setPassword('');
      setConfirmPassword('');
      // Mantém formatado na tela após o sucesso
      setCpf(maskCPF(cleanCPF));
      setPhone(maskPhone(cleanPhone));
    } catch (error) {
      const errorMessage = axios.isAxiosError<ApiErrorResponse>(error)
        ? error.response?.data?.message || 'Erro ao salvar alterações.'
        : 'Erro ao salvar alterações.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelAccount() {
    const confirmed = window.confirm(
      'Tem certeza que deseja cancelar sua conta? Seus pedidos continuarão registrados, mas seu acesso será encerrado.'
    );

    if (!confirmed) {
      return;
    }

    setIsCancellingAccount(true);
    try {
      await usersApi.cancelMyAccount();
      signOut();
      toast.success('Conta cancelada com sucesso.', { theme: 'dark' });
      navigate('/login');
    } catch (error) {
      const errorMessage = axios.isAxiosError<ApiErrorResponse>(error)
        ? error.response?.data?.message || 'Erro ao cancelar conta.'
        : 'Erro ao cancelar conta.';
      toast.error(errorMessage, { theme: 'dark' });
    } finally {
      setIsCancellingAccount(false);
    }
  }

  return (
    <S.Container>
      <S.Header>
        <div className="icon-bg"><FiUser /></div>
        <div>
          <h2>Meu Perfil</h2>
          <p>Gerencie suas informações e segurança</p>
        </div>
      </S.Header>

      <S.Content>
        <S.ProfileCard>
          <div className="card-header">
            <h3>Informações Pessoais</h3>
            <div className="actions">
              {isEditing ? (
                <>
                  <Button type="button" onClick={() => setIsEditing(false)} style={{ background: '#374151', color: '#d1d5db', border: '1px solid #4b5563' }}>
                    <FiX /> Cancelar
                  </Button>
                  <Button type="button" loading={loading} onClick={handleSave}>
                    <FiSave /> Salvar
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)} style={{ background: '#1f2937', color: '#60a5fa', border: '1px solid #3b82f6' }}>
                  <FiEdit2 /> Editar
                </Button>
              )}
            </div>
          </div>

          <S.InfoGroup>
            <div className="field">
              <label><FiUser /> NOME</label>
              {isEditing ? <input value={name} onChange={e => setName(e.target.value)} /> : <p>{name}</p>}
            </div>

            <div className="field">
              <label>E-MAIL</label>
              <p className="disabled-field">{email}</p>
            </div>

            <div className="field">
              <label><FiHash /> CPF</label>
              {/* EXIBIÇÃO SEMPRE FORMATADA */}
              <p className="disabled-field">{cpf}</p>
            </div>

            <div className="field">
              <label><FiPhone /> TELEFONE</label>
              {isEditing ? <input value={phone} onChange={e => setPhone(maskPhone(e.target.value))} /> : <p>{phone || 'Não informado'}</p>}
            </div>

            <div className="field full-width">
              <label><FiMapPin /> ENDEREÇO DE ENTREGA</label>
              {isEditing ? <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} /> : <p>{address || 'Não cadastrado'}</p>}
            </div>

            {isEditing && (
              <>
                <div className="field">
                  <label><FiLock /> NOVA SENHA (OPCIONAL)</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
                </div>
                <div className="field">
                  <label><FiLock /> CONFIRMAR NOVA SENHA</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
              </>
            )}
          </S.InfoGroup>
        </S.ProfileCard>

        <S.ProfileCard>
          <div className="card-header">
            <h3>Conta</h3>
          </div>

          <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
            Ao cancelar a conta, seu acesso será encerrado, mas o histórico de compras permanecerá no sistema.
          </p>

          <Button
            type="button"
            loading={isCancellingAccount}
            onClick={handleCancelAccount}
            style={{ background: '#7f1d1d', color: '#fecaca', border: '1px solid #ef4444' }}
          >
            Cancelar conta
          </Button>
        </S.ProfileCard>
      </S.Content>
    </S.Container>
  );
}