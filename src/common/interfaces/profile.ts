export type Provider = 'google' | 'fb';

export interface Profile {
  provider: Provider;
  sub: string;
  id: string;
  displayName: string;
  name: {
    givenName: string;
    familyName: string;
  };
  email_verified: boolean;
  verified: boolean;
  email: string;
  emails: Array<{
    value: string;
    verified?: boolean;
  }>;
  picture: string;
}

export interface FbProfile {
  provider: Provider;
  sub: string;
  displayName: string;
  fb_link: string;
  picture: string;
}

