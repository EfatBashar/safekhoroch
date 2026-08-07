# Premium System + Admin Users View

## লক্ষ্য
Admin panel থেকে অ্যাপের যেকোনো option/feature-কে **premium** করা যাবে, আর কে কে sign up করেছে সেটা বিস্তারিত দেখা যাবে।

## Premium কীভাবে কাজ করবে
- Admin panel-এর নতুন **প্রিমিয়াম** ট্যাবে অ্যাপের সব option (bottom nav + drawer-এর প্রতিটি আইটেম) লিস্ট আকারে আসবে, প্রতিটির পাশে একটা toggle — চাপলেই ওই option premium।
- সাধারণ ইউজার premium option-এ ছোট **lock আইকন** দেখবে; tap করলে "এটি প্রিমিয়াম ফিচার" মেসেজ আসবে, পেজে ঢুকতে পারবে না।
- Premium ইউজার ও admin সবকিছু আগের মতোই পাবে।
- ইউজারকে premium করার একমাত্র উপায় — **admin panel-এর ইউজার ট্যাবে toggle** (কোনো পেমেন্ট নেই)।

## ইউজার (sign up) ভিউ
ইউজার ট্যাব উন্নত হবে:
- নাম, ইমেইল, **sign up করার তারিখ ও সময়**
- ব্যাজ: Admin / Premium / Free
- নাম-ইমেইল দিয়ে সার্চ, নতুন আগে সাজানো
- প্রতিটি ইউজারে দুটি toggle: Admin এবং Premium
- উপরে সারাংশ: মোট ইউজার / premium / আজ যোগ হয়েছে

## টেকনিক্যাল বিবরণ
- Migration: `app_role` enum-এ `premium` value যোগ; premium status রাখা হবে বিদ্যমান `user_roles` টেবিলে (`role = 'premium'`) — আলাদা টেবিল লাগবে না, `has_role()` ফাংশনই কাজ করবে।
- Premium option list রাখা হবে `app_settings` টেবিলে `premium_features` key-তে (route path-এর array), যেটা `appConfig.tsx`-এর মতোই public read + admin write।
- `src/lib/premium.tsx`: context — `premiumRoutes`, `isPremium`, `canAccess(route)`; `auth.tsx`-এর মতো `has_role` RPC দিয়ে নিজের premium status লোড করবে।
- `src/components/admin/PremiumTab.tsx`: config থেকে সব nav/drawer item নিয়ে toggle UI + save।
- `src/routes/admin.tsx`: নতুন "প্রিমিয়াম" ট্যাব, আর `UsersTab` rewrite (search, badges, premium toggle, signup তারিখ)।
- `src/components/AppShell.tsx` + `src/routes/index.tsx`: locked item-এ lock আইকন ও ব্লক করা navigation।
- সব route-এ একটি shared `PremiumGate` — সরাসরি URL দিয়ে ঢুকলেও lock স্ক্রিন দেখাবে।
