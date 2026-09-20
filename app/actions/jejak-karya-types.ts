export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type CreateJejakKaryaInput = {
  title: string;
  category: string;
  year?: string;
  author: string;
  description: string;
  challenge?: string;
  approach?: string;
  outcome?: string;
  whatWeDid?: string;
  tags?: string[];
  coverImage?: string;
  galleryImages?: string[];
  demoUrl?: string;
  published: boolean;
};
