export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

export interface AuthContextType {
  user: DiscordUser | null;
  guilds: DiscordGuild[];
  accessToken: string | null;
  login: (code: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}