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
    await expect(page).toHaveURL(/\/login$/, { timeout: 10000 });

    await loginUser(page, email, password);
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });

    const productCard = page.locator('h3').first();
    const productName = await productCard.textContent();
    await expect(productCard).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /Comprar/i }).first().click();
    await page.goto('/cart');

    await expect(page.getByText(productName || '')).toBeVisible({ timeout: 10000 });
    const quantityDisplay = page.locator('.qty-value').first();
    await expect(quantityDisplay).toHaveText('1');

    const btnMais = page.locator('.qty-btn').nth(1);
    await btnMais.waitFor({ state: 'visible', timeout: 5000 });
    await btnMais.scrollIntoViewIfNeeded();
    await btnMais.click();
    await expect(quantityDisplay).toHaveText('2');
    await expect(page.getByRole('button', { name: /Finalizar Pedido/i })).toBeVisible();

    await page.getByRole('button', { name: /Alterar/i }).click();
    await page.locator('textarea[placeholder*="endereço"]').fill('Rua Teste E2E, 100');
    await page.getByRole('button', { name: /Salvar/i }).click();
    await expect(page.getByText('Rua Teste E2E, 100')).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /Cartão de Crédito/i }).click();
    await Promise.all([
      page.waitForURL(/\/orders$/, { timeout: 15000 }),
      page.getByRole('button', { name: /Finalizar Pedido/i }).click()
    ]);

    await expect(page.getByText(/Meus Pedidos/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(productName || '')).toBeVisible({ timeout: 10000 });

    await page.goto('/profile');
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /Cancelar conta/i }).click();
    await expect(page).toHaveURL(/\/login$/, { timeout: 10000 });
  });

  test('Falha ao finalizar pedido sem endereço', async ({ page }) => {
    const suffix = Date.now();
    const email = `e2e-cart-fail-${suffix}@codewear.test`;
    const name = `Cliente Cart Fail ${suffix}`;
    const password = 'Codewear1234';

    await registerUser(page, email, password, name);
    await loginUser(page, email, password);

    await page.getByRole('button', { name: /Comprar/i }).first().click();
    await page.goto('/cart');

    await page.getByRole('button', { name: /Alterar/i }).click();
    await page.locator('textarea[placeholder*="endereço"]').fill('');
    await page.getByRole('button', { name: /Salvar/i }).click();

    await page.getByRole('button', { name: /Finalizar Pedido/i }).click();
    await expect(page.getByText(/endereço/i).first()).toBeVisible({ timeout: 10000 });

    await page.goto('/profile');
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /Cancelar conta/i }).click();
    await expect(page).toHaveURL(/\/login$/, { timeout: 10000 });
  });
});