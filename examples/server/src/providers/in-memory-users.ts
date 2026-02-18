import type { MentionItem, MentionQuery, MentionSource } from "../types";

const USERS: MentionItem[] = [
  {
    id: "u-1001",
    displayName: "John Doe",
    description: "Engineering",
    image: "https://i.pravatar.cc/48?img=12",
    link: "https://example.local/users/u-1001"
  },
  {
    id: "u-1002",
    displayName: "Joanna Smith",
    description: "Product Management",
    image: "https://i.pravatar.cc/48?img=5",
    link: "https://example.local/users/u-1002"
  },
  {
    id: "u-1003",
    displayName: "Marta Novak",
    description: "Design",
    image: "https://i.pravatar.cc/48?img=33",
    link: "https://example.local/users/u-1003"
  },
  {
    id: "u-1004",
    displayName: "Raj Patel",
    description: "Platform Team",
    image: "https://i.pravatar.cc/48?img=49",
    link: "https://example.local/users/u-1004"
  },
  {
    id: "u-1005",
    displayName: "Alex Chen",
    description: "Security",
    image: "https://i.pravatar.cc/48?img=27",
    link: "https://example.local/users/u-1005"
  }
];

export class InMemoryUsersSource implements MentionSource {
  async search(query: MentionQuery): Promise<MentionItem[]> {
    const q = query.query.trim().toLowerCase();

    const filtered = q
      ? USERS.filter((user) => user.displayName.toLowerCase().includes(q))
      : USERS;

    return filtered.slice(0, query.limit);
  }
}
