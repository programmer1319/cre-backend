import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth-service';
import {
  AppearanceTheme,
  SettingsService,
  UserSettings,
} from '../../../core/services/settings-service';
import { ThemeService } from '../../../core/services/theme-service';

type SettingsSection = 'profile' | 'notifications' | 'security' | 'appearance';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(SettingsService);
  private readonly themes = inject(ThemeService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly active = signal<SettingsSection>('profile');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly error = signal('');

  readonly notificationsForm = this.fb.nonNullable.group({
    emailNewLeads: true,
    pushNewLeads: true,
    weeklyDigest: false,
  });

  readonly securityForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: (group) => group.value.newPassword === group.value.confirmPassword ? null : { mismatch: true } },
  );

  readonly appearanceForm = this.fb.nonNullable.group({
    theme: 'system' as AppearanceTheme,
    compactMode: false,
    reducedMotion: false,
  });

  constructor() {
    this.api.get().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (settings) => {
        this.notificationsForm.patchValue(settings);
        this.appearanceForm.patchValue(settings);
        this.applyAppearance(settings);
      },
      error: () => this.error.set('Settings could not be loaded. Please refresh and try again.'),
    });
  }

  select(section: SettingsSection): void {
    this.active.set(section);
    this.clearStatus();
  }

  saveNotifications(): void {
    this.save(this.notificationsForm.getRawValue(), 'Notification preferences saved.');
  }

  saveAppearance(): void {
    const values = this.appearanceForm.getRawValue();
    this.save(values, 'Appearance preferences saved.', (settings) => this.applyAppearance(settings));
  }

  changePassword(): void {
    this.securityForm.markAllAsTouched();
    if (this.securityForm.invalid || this.saving()) return;
    this.beginSave();
    const { currentPassword, newPassword } = this.securityForm.getRawValue();
    this.api.changePassword({ currentPassword, newPassword })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: ({ message }) => {
          this.message.set(message);
          this.securityForm.reset();
        },
        error: (err) => this.error.set(err?.error?.message ?? 'Password could not be updated.'),
      });
  }

  private save(
    values: Partial<UserSettings>,
    message: string,
    afterSave?: (settings: UserSettings) => void,
  ): void {
    if (this.saving()) return;
    this.beginSave();
    this.api.update(values).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (settings) => {
        afterSave?.(settings);
        this.message.set(message);
      },
      error: () => this.error.set('Changes could not be saved. Please try again.'),
    });
  }

  private beginSave(): void {
    this.clearStatus();
    this.saving.set(true);
  }

  private clearStatus(): void {
    this.message.set('');
    this.error.set('');
  }

  private applyAppearance(settings: Pick<UserSettings, 'theme' | 'compactMode' | 'reducedMotion'>): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const resolved = settings.theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : settings.theme;
    this.themes.select(resolved);
    document.documentElement.classList.toggle('compact', settings.compactMode);
    document.documentElement.classList.toggle('reduce-motion', settings.reducedMotion);
  }
}
