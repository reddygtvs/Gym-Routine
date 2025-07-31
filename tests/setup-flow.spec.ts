import { test, expect } from '@playwright/test';

test.describe('Setup Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should complete full setup flow with all steps', async ({ page }) => {
    await page.goto('/');
    
    // Should show setup page for new users
    await expect(page.locator('h1')).toContainText('Welcome to 5/3/1');
    await expect(page.locator('text=Let\'s set up your personalized strength training program')).toBeVisible();

    // Step 1: Basic Information
    await page.fill('input[placeholder="Enter your name"]', 'Test User');
    await page.selectOption('select', 'kg');
    await page.fill('input[placeholder="Enter your bodyweight"]', '80');
    await page.click('button:has-text("Continue")');

    // Step 2: Current Maxes
    await expect(page.locator('h2')).toContainText('Current Maxes');
    
    // Fill in current maxes for all exercises
    const exercises = [
      { name: 'Squat', weight: '100', reps: '5' },
      { name: 'Bench Press', weight: '80', reps: '3' },
      { name: 'Deadlift', weight: '120', reps: '2' },
      { name: 'Overhead Press', weight: '60', reps: '8' }
    ];

    for (const exercise of exercises) {
      const section = page.locator(`h3:has-text("${exercise.name}")`).locator('..');
      await section.locator('input').first().fill(exercise.weight);
      await section.locator('input').last().fill(exercise.reps);
    }

    // Check that training maxes are calculated
    await expect(page.locator('text=Training Max:')).toHaveCount(4);
    
    await page.click('button:has-text("Continue")');

    // Step 3: Choose Program
    await expect(page.locator('h2')).toContainText('Choose Your Program');
    
    // Should show program variants
    await expect(page.locator('text=Standard 5/3/1')).toBeVisible();
    await expect(page.locator('text=Boring But Big')).toBeVisible();
    await expect(page.locator('text=Building the Monolith')).toBeVisible();
    
    // Select Building the Monolith
    await page.click('text=Building the Monolith');
    await page.click('button:has-text("Start Training")');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Cycle 1 • Week 1 (5s)');
    await expect(page.locator('text=Building The Monolith Program')).toBeVisible();
  });

  test('should allow continuing through setup steps', async ({ page }) => {
    await page.goto('/');
    
    // Can continue without filling optional fields (no validation required)
    await page.click('button:has-text("Continue")');
    
    // Should be on step 2
    await expect(page.locator('h2')).toContainText('Current Maxes');
    
    // Go back to step 1
    await page.click('button:has-text("Back")');
    await expect(page.locator('h2')).toContainText('Basic Information');
    
    // Fill name and continue
    await page.fill('input[placeholder="Enter your name"]', 'Test');
    await page.click('button:has-text("Continue")');
    
    // Should be on step 2
    await expect(page.locator('h2')).toContainText('Current Maxes');
  });

  test('should calculate training maxes correctly', async ({ page }) => {
    await page.goto('/');
    
    // Go through basic info
    await page.fill('input[placeholder="Enter your name"]', 'Test');
    await page.click('button:has-text("Continue")');
    
    // Test training max calculation
    const squatSection = page.locator('h3:has-text("Squat")').locator('..');
    await squatSection.locator('input').first().fill('100');
    await squatSection.locator('input').last().fill('1');
    
    // Should show estimated 1RM: 100kg → Training Max: 90kg
    await expect(squatSection.locator('text=Estimated 1RM: 100kg → Training Max: 90kg')).toBeVisible();
    
    // Test with reps > 1
    await squatSection.locator('input').last().fill('5');
    // Should show estimated 1RM: 117kg → Training Max: 105kg (rounded)
    await expect(squatSection.locator('text=Estimated 1RM: 117kg')).toBeVisible();
  });

  test('should persist setup data in localStorage', async ({ page }) => {
    await page.goto('/');
    
    // Complete setup
    await page.fill('input[placeholder="Enter your name"]', 'Test User');
    await page.selectOption('select', 'lbs');
    await page.click('button:has-text("Continue")');
    
    // Fill maxes
    const squatSection = page.locator('h3:has-text("Squat")').locator('..');
    await squatSection.locator('input').first().fill('225');
    await squatSection.locator('input').last().fill('1');
    
    await page.click('button:has-text("Continue")');
    await page.click('text=Standard 5/3/1');
    await page.click('button:has-text("Start Training")');
    
    // Check localStorage
    const userData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('gym-routine-531') || '{}');
    });
    
    expect(userData.user.name).toBe('Test User');
    expect(userData.user.units).toBe('lbs');
    expect(userData.user.preferredVariant).toBe('standard');
    expect(userData.user.trainingMaxes.squat).toBe(203); // 90% of 225
  });
});