export type StaffMember = {
  id: string;
  name: string;
  role: string;
  image?: string;
  isPlaceholder?: boolean;
};

export type StaffCategory = {
  id: string;
  title: string;
  description: string;
  members: StaffMember[];
};
