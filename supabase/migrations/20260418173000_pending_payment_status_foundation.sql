alter type public.payment_status add value if not exists 'pending' before 'recorded';

comment on column public.payments.status is 'Canonical payment lifecycle status. Pending rows capture in-progress customer checkout on the same payment record until later provider completion finalizes them as recorded or void.';
