import { test, expect, Page } from '@playwright/test';

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

async function registerUser(page: Page, email: string, password: string, name: string) {
  await page.goto('/signup');
  await page.getByPlaceholder('Seu nome').fill(name);
  await page.getByPlaceholder('exemplo@email.com').fill(email);
  await page.getByPlaceholder('000.000.000-00').fill(generateCpf());
  await page.getByPlaceholder('(00) 00000-0000').fill('(11) 90000-0000');
  await page.getByPlaceholder('Rua, número, bairro e cidade').fill('Rua do Cliente, 123');
  await page.getByPlaceholder('Mínimo 8 caracteres').fill(password);
  await page.getByPlaceholder('Repita sua senha').fill(password);
  await page.getByRole('button', { name: 'Criar Conta' }).click();
}

async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('Digite seu e-mail').fill(email);
  await page.getByPlaceholder('Digite sua senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

test.describe('Cliente E2E - Codewear', () => {
  test('CRUD completo de cliente (cadastrar, editar, listar e excluir)', async ({ page }) => {
    const suffix = Date.now();
    const email = `joao-${suffix}@codewear.test`;
    const name = `Joao ${suffix}`;
    const password = 'Codewear1234';

    // 1. Cadastrar
    await registerUser(page, email, password, name);
    await expect(page).toHaveURL(/\/login$/);

    // 2. Listar / Logar
    await loginUser(page, email, password);
    await expect(page).toHaveURL(/\/$/);

    // Navegar para o perfil
    await page.getByRole('button', { name: /Olá, / }).click();
    await expect(page).toHaveURL(/\/profile$/);

    // 3. Editar
    await page.getByRole('button', { name: 'Editar' }).click();
    
    
    const inputNome = page.getByLabel(/nome/i);
    await inputNome.waitFor({ state: 'visible' });
    await inputNome.fill(`${name} Atualizado`);
    
    await page.getByLabel(/endereço de entrega/i).fill('Avenida Teste, 999');
    await page.getByRole('button', { name: 'Salvar' }).click();

    // Validar alteração em tela
    await expect(page.getByText('Avenida Teste, 999')).toBeVisible();
    await expect(page.getByText(`${name} Atualizado`)).toBeVisible();

    // 4. Excluir
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Cancelar conta' }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test('Falha ao criar usuário com CPF inválido', async ({ page }) => {
    await page.goto('/signup');
    await page.getByPlaceholder('Seu nome').fill('Falha Cliente');
    await page.getByPlaceholder('exemplo@email.com').fill(`fail-${Date.now()}@codewear.test`);
    await page.getByPlaceholder('000.000.000-00').fill('000.000.000-00');
    await page.getByPlaceholder('(00) 00000-0000').fill('(11) 90000-0000');
    await page.getByPlaceholder('Rua, número, bairro e cidade').fill('Rua da Falha, 45');
    await page.getByPlaceholder('Mínimo 8 caracteres').fill('Codewear1234');
    await page.getByPlaceholder('Repita sua senha').fill('Codewear1234');
    await page.getByRole('button', { name: 'Criar Conta' }).click();

    
    await expect(page.locator('.Toastify__toast-body').filter({ hasText: /cpf inválido/i }).first()).toBeVisible();
    await expect(page).toHaveURL(/\/signup$/);
  });
});