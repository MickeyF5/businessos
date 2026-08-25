insert into public.projects (id, icon, name, description, details)
values
  (gen_random_uuid(), '🚗', 'Vehicle Business', 'Managing automotive imports, tuning parts, and customer builds.', '[]'::jsonb),
  (gen_random_uuid(), '📱', 'Marketing Agency', 'Social media branding, TikTok content generation, and client outreach.', '[]'::jsonb),
  (gen_random_uuid(), '💻', 'Internal Software', 'Building custom automation scripts, Discord bots, and tools.', '[]'::jsonb)
on conflict do nothing;

insert into public.tasks (id, title, assignee, assignee_id, done, overdue)
values
  (gen_random_uuid(), 'Contact 3 potential customers', 'Makailen', null, false, false),
  (gen_random_uuid(), 'Finish website', 'Viresh', null, false, false),
  (gen_random_uuid(), 'Create TikTok content', 'Zenden', null, false, false),
  (gen_random_uuid(), 'Register business', 'Makailen', null, true, true)
on conflict do nothing;

insert into public.inventory_items (id, name, sku, quantity, price)
values
  (gen_random_uuid(), 'E92 Custom Tuning Chip', 'TUN-E92-01', 12, 4500),
  (gen_random_uuid(), 'Branding Watermark Asset Kit', 'DIG-BM-04', 50, 850)
on conflict (sku) do nothing;

insert into public.customers (id, name, company, email, phone, status, total_spent)
values
  (gen_random_uuid(), 'Alex Rivera', 'Apex Performance', 'alex@apex.com', '+1 (415) 555-0137', 'VIP', 18500),
  (gen_random_uuid(), 'Jordan Vance', 'Vance Logistics', 'jordan@vance.io', '+1 (310) 555-0112', 'Active', 9200)
on conflict do nothing;

insert into public.partners (id, name, business, role, contact)
values
  (gen_random_uuid(), 'Liam Ross', 'Ross Audio Labs', 'Hardware Collab', 'liam@rosslabs.com'),
  (gen_random_uuid(), 'Sarah Chen', 'Chen Media', 'Influencer Growth Partner', 'sarah@chenmedia.com')
on conflict do nothing;

insert into public.strategies (id, title, description, priority, status)
values
  (gen_random_uuid(), 'Customer acquisition', 'Accelerate acquisition through premium service bundles.', 'High', 'In progress'),
  (gen_random_uuid(), 'Operational efficiency', 'Streamline project delivery and internal automation.', 'Medium', 'Planned'),
  (gen_random_uuid(), 'Partner-led growth', 'Expand productized offers and partner-led lead generation.', 'Medium', 'Planned')
on conflict do nothing;
