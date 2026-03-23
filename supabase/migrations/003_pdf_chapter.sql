alter table public.pdf_documents
  add column if not exists chapter text;

create index if not exists idx_pdf_documents_user_chapter
  on public.pdf_documents(user_id, chapter);
