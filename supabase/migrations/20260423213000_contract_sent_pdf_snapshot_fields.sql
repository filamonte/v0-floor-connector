alter table public.contracts
  add column if not exists sent_pdf_storage_path text,
  add column if not exists sent_pdf_file_name text,
  add column if not exists sent_pdf_mime_type text,
  add column if not exists sent_pdf_generated_at timestamptz;

comment on column public.contracts.sent_pdf_storage_path is 'Storage path in the shared documents bucket for the official contract PDF generated at send time.';
comment on column public.contracts.sent_pdf_file_name is 'Display filename for the official sent contract PDF snapshot.';
comment on column public.contracts.sent_pdf_mime_type is 'MIME type for the sent contract PDF snapshot.';
comment on column public.contracts.sent_pdf_generated_at is 'Timestamp when the official sent contract PDF snapshot was generated from canonical contract HTML.';
