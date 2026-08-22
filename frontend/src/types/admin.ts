export type UserRow = {
  id: number;
  username: string;
  email: string;
  role: "admin" | "agent";
  status: string;
  phone_number: string;
};

export type ChatRow = {
  id: number;
  lead: { id: number; name: string; phone_number: string };
  assigned_user: number | null;
  assigned_user_username: string | null;
  status: string;
  last_message_at: string | null;
  has_unread: boolean;
};

export type Message = {
  id: number;
  chat: number;
  direction: "in" | "out";
  body: string;
  delivery_status: string;
  sent_at: string;
};

export type ChatDetail = ChatRow & { messages: Message[] };
