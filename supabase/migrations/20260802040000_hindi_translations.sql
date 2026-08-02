-- Add Hindi column for UI translations

alter table public.ui_translations
  add column if not exists hi text;

-- Seed common chrome strings with Hindi where missing
update public.ui_translations set hi = 'होम' where key = 'nav.home' and hi is null;
update public.ui_translations set hi = 'परिचय' where key = 'nav.about' and hi is null;
update public.ui_translations set hi = 'समुदाय' where key = 'nav.community' and hi is null;
update public.ui_translations set hi = 'संसाधन' where key = 'nav.resources' and hi is null;
update public.ui_translations set hi = 'कार्यक्रम' where key = 'nav.events' and hi is null;
update public.ui_translations set hi = 'गैलरी' where key = 'nav.gallery' and hi is null;
update public.ui_translations set hi = 'संपर्क' where key = 'nav.contact' and hi is null;
update public.ui_translations set hi = 'लॉगिन' where key = 'nav.login' and hi is null;
update public.ui_translations set hi = 'सदस्य बनें' where key = 'nav.becomeMember' and hi is null;
update public.ui_translations set hi = 'सदस्य बनें' where key = 'membership.title' and hi is null;
