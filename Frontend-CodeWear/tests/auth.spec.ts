import { test, expect } from '@playwright/test';

function generateCpf(): string {
  const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const calculateCheckDigit = (base: number[]) => {
    const factor = base.length + 1;
    const total = base.reduce((sum, num, index) => sum + num * (factor - index), 0);
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  const firstDigit = calculateCheckDigit(digits);
  const secondDigit = calculateCheckDigit([...digits, firstDigit]);
  const cpf = [...digits, firstDigit, secondDigit].join('');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

async function registerUser(page: any, email: string, password: string, name: string) {
  await page.goto('/signup');
  await page.getByPlaceholder('Seu nome').fill(name);
  await page.getByPlaceholder('exemplo@email.com').fill(email);
  await page.getByPlaceholder('000.000.000-00').fill(generateCpf());
  await page.getByPlaceholder('(00) 00000-0000').fill('(11) 90000-0000');
  await page.getByPlaceholder('Rua, número, bairro e cidade').fill('Rua do Teste, 123');
  await page.getByPlaceholder('Mínimo 8 caracteres').fill(password);
  await page.getByPlaceholder('Repita sua senha').fill(password);
  await page.getByRole('button', { name: 'Criar Conta' }).click();
}

test.describe('Auth E2E - Codewear', () => {
  test('Cadastro de Usuário (Sucesso)', async ({ page }) => {
    const suffix = Date.now();
    const email = `maria-${suffix}@codewear.test`;
    const name = `Maria ${suffix}`;
    const password = 'Codewear1234';

    await registerUser(page, email, password, name);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('Conta criada com sucesso! Faça login para continuar.')).toBeVisible();
  });

  test('Cadastro de Usuário (Falha) com CPF inválido', async ({ page }) => {
    await page.goto('/signup');
    await page.getByPlaceholder('Seu nome').fill('Usuário Teste');
    await page.getByPlaceholder('exemplo@email.com').fill(`e2e-fail-${Date.now()}@codewear.test`);
    await page.getByPlaceholder('000.000.000-00').fill('000.000.000-00');
    await page.getByPlaceholder('(00) 00000-0000').fill('(11) 90000-0000');
    await page.getByPlaceholder('Rua, número, bairro e cidade').fill('Rua dos Erros, 1');
    await page.getByPlaceholder('Mínimo 8 caracteres').fill('Codewear1234');
    await page.getByPlaceholder('Repita sua senha').fill('Codewear1234');
    await page.getByRole('button', { name: 'Criar Conta' }).click();

    
    await expect(page.locator('.Toastify__toast-body').filter({ hasText: /cpf inválido/i }).first()).toBeVisible();
    await expect(page).toHaveURL(/\/signup$/);
  });

  test('Login (Sucesso)', async ({ page }) => {
    const suffix = Date.now();
    const email = `sebastiao-${suffix}@codewear.test`;
    const name = `Sebastiao ${suffix}`;
    const password = 'Codewear1234';

    await registerUser(page, email, password, name);
    await expect(page).toHaveURL(/\/login$/);

    await page.getByPlaceholder('Digite seu e-mail').fill(email);
    await page.getByPlaceholder('Digite sua senha').fill(password);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(/Bem-vindo, /)).toBeVisible();
  });

  test('Login (Falha) com dados inválidos', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Digite seu e-mail').fill('nao-existe@codewear.test');
    await page.getByPlaceholder('Digite sua senha').fill('senhaerrada');
    await page.getByRole('button', { name: 'Entrar' }).click();

    
    await expect(page.locator('.Toastify__toast-body').filter({ hasText: /e-mail ou senha incorretos/i }).first()).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});