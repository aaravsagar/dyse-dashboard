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

export interface AuthContext {
  user: DiscordUser | null;
  token: string | null;
  guilds: DiscordGuild[];
  loading: boolean;
  login: () => void;
  logout: () => void;
}