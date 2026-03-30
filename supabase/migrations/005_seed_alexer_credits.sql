update public.profiles p
set credits = 1000
from auth.users u
where p.id = u.id
  and lower(u.email) = 'alxerpaypal@gmail.com';
