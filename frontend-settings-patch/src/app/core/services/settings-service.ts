import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../globals';

export type AppearanceTheme = 'light' | 'dark' | 'system';

export interface UserSettings {
  emailNewLeads: boolean;
  pushNewLeads: boolean;
  weeklyDigest: boolean;
  theme: AppearanceTheme;
  compactMode: boolean;
  reducedMotion: boolean;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly api = `${API_URL}/settings`;

  get() {
    return this.http.get<UserSettings>(this.api, { withCredentials: true });
  }

  update(values: Partial<UserSettings>) {
    return this.http.patch<UserSettings>(this.api, values, { withCredentials: true });
  }

  changePassword(values: { currentPassword: string; newPassword: string }) {
    return this.http.patch<{ message: string }>(
      `${API_URL}/user/security/password`,
      values,
      { withCredentials: true },
    );
  }
}
