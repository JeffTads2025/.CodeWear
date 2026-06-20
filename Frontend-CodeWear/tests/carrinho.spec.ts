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

async function loginUser(page: any, email: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('Digite seu e-mail').fill(email);
  await page.getByPlaceholder('Digite sua senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

test.describe('Carrinho E2E - Codewear', () => {
  test('Fluxo completo de compra: login, escolher produto, alterar quantidade, pagar e ver meus pedidos', async ({ page }) => {
    const suffix = Date.now();
    const email = `clotilde-${suffix}@codewear.test`;
    const name = `Clotilde ${suffix}`;
    const password = 'Codewear1234';

    await registerUser(page, email, password, name);
    await expect(page).toHaveURL(/\/login$/);

    await loginUser(page, email, password);
    await expect(page).toHaveURL(/\/$/);

    const productCard = page.locator('h3').first();
    const productName = await productCard.textContent();
    await expect(productCard).toBeVisible();
    await page.getByRole('button', { name: 'Comprar' }).first().click();
    await page.goto('/cart');

    await expect(page.getByText(productName || '')).toBeVisible();
    const quantityDisplay = page.locator('.qty-value').first();
    await expect(quantityDisplay).toHaveText('1');

    await page.locator('.qty-btn').nth(1).click();
    await expect(quantityDisplay).toHaveText('2');
    await expect(page.getByRole('button', { name: /Finalizar Pedido/ })).toBeVisible();

    await page.getByRole('button', { name: 'Alterar' }).click();
    await page.locator('textarea[placeholder="Digite o endereço completo..."]').fill('Rua Teste E2E, 100');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Rua Teste E2E, 100')).toBeVisible();

    await page.getByRole('button', { name: 'Cartão de Crédito' }).click();
    await Promise.all([
      page.waitForURL(/\/orders$/),
      page.getByRole('button', { name: /Finalizar Pedido/ }).click()
    ]);

    await expect(page.getByText('Meus Pedidos')).toBeVisible();
    await expect(page.getByText(productName || '')).toBeVisible();

    await page.goto('/profile');
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Cancelar conta' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('Falha ao finalizar pedido sem endereço', async ({ page }) => {
    const suffix = Date.now();
    const email = `e2e-cart-fail-${suffix}@codewear.test`;
    const name = `Cliente Cart Fail ${suffix}`;
    const password = 'Codewear1234';

    await registerUser(page, email, password, name);
    await loginUser(page, email, password);

    await page.getByRole('button', { name: 'Comprar' }).first().click();
    await page.goto('/cart');

    await page.getByRole('button', { name: 'Alterar' }).click();
    await page.locator('textarea[placeholder="Digite o endereço completo..."]').fill('');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await page.getByRole('button', { name: /Finalizar Pedido/ }).click();
    await expect(page.getByText('Por favor, informe um endereço de entrega.')).toBeVisible();

    await page.goto('/profile');
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Cancelar conta' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});