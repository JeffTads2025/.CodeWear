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
  const suffix = Date.now().toString().slice(-4);
  await page.goto('/signup');
  await page.getByPlaceholder('Seu nome').fill(name);
  await page.getByPlaceholder('exemplo@email.com').fill(email);
  await page.getByPlaceholder('000.000.000-00').fill(generateCpf());
  await page.getByPlaceholder('(00) 00000-0000').fill(`(11) 98888-${suffix}`);
  await page.getByPlaceholder('Rua, número, bairro e cidade').fill(`Rua do Cliente, ${suffix}`);
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
    await expect(page).toHaveURL(/\/login$/, { timeout: 15000 });

    // 2. Listar / Logar
    await loginUser(page, email, password);
    await expect(page).toHaveURL(/\/$/, { timeout: 12000 });

    // Clica fisicamente no menu para simular a navegação real e não perder o Token do React
    const userMenu = page.locator('text=/Olá/i')
      .or(page.getByRole('button', { name: /Olá/i }))
      .or(page.locator('header').getByRole('button').first())
      .first();
    
    await userMenu.waitFor({ state: 'visible', timeout: 10000 });
    await userMenu.click();
    await page.waitForTimeout(1000);

    // Seleciona e clica no link do perfil presente no Dropdown
    const linkPerfil = page.getByRole('link', { name: /Perfil|Minha Conta/i })
      .or(page.locator('a[href*="profile"]'))
      .or(page.locator('text=/Perfil/i'))
      .first();

    if (await linkPerfil.isVisible()) {
      await linkPerfil.click();
    } else {
      // Fallback de segurança caso o dropdown falhe por CSS
      await page.goto('/profile');
    }

    // Aguarda a URL e as requisições assíncronas (getProfile) do React terminarem
    await page.waitForURL(/\/profile$/, { timeout: 15000 });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2500); // Garante que o useEffect do React concluiu

    // 3. Editar
    // Localiza o botão "Editar" exatamente como mapeado no seu JSX (<Button><FiEdit2 /> Editar</Button>)
    const btnEditar = page.getByRole('button', { name: /Editar/i })
      .or(page.locator('button:has-text("Editar")'))
      .first();
    
    await btnEditar.waitFor({ state: 'visible', timeout: 15000 });
    await btnEditar.click({ force: true });
    
    // Aguarda o React renderizar a troca do <p> para o <input>
    await page.waitForTimeout(2000);

    // Localiza o input do nome de forma genérica, já que o seu JSX não possui name, id ou placeholder
    const inputNome = page.locator('input:not([type="password"])').first();
    await inputNome.waitFor({ state: 'visible', timeout: 15000 });
    await inputNome.click();
    await inputNome.fill('');
    await inputNome.fill(`${name} Atualizado`);
    
    // Localiza o campo de Endereço (<textarea>) do seu formulário
    const inputEndereco = page.locator('textarea').first();
    await inputEndereco.waitFor({ state: 'visible', timeout: 5000 });
    await inputEndereco.fill('');
    await inputEndereco.fill('Avenida Teste, 999');
    
    // Clica no botão Salvar
    await page.getByRole('button', { name: /Salvar/i }).click();

    // Valida que o estado voltou a exibir as tags <p> com os dados salvos
    await expect(page.getByText('Avenida Teste, 999').first()).toBeVisible({ timeout: 12000 });
    await expect(page.getByText(`${name} Atualizado`).first()).toBeVisible({ timeout: 12000 });

    // 4. Excluir (Cancelamento da conta)
    page.on('dialog', dialog => dialog.accept()); // Aceita o window.confirm nativo do navegador automaticamente
    await page.getByRole('button', { name: /Cancelar conta/i }).click();

    // Valida o redirecionamento final com sucesso para o login após deslogar
    await expect(page).toHaveURL(/\/login$/, { timeout: 12000 });
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

    await expect(page.getByText(/cpf inválido/i).first()).toBeVisible({ timeout: 12000 });
    await expect(page).toHaveURL(/\/signup$/);
  });
});