# Connect Kittycara to Supabase

## 1. Create your project

Visit https://supabase.com/dashboard and create a project in your organization. Keep the database password in your password manager. Wait until the project is ready.

Open the project's SQL Editor, paste the contents of `supabase/setup.sql`, and run it once on the new project. The script creates `public.profiles`, constraints, grants, and row-level security policies. This bootstrap script is deliberately not an existing-data migration. Do not run it against a populated project without reviewing its schema first.

Profiles are created on the first authenticated login. No privileged triggers or service-role keys are needed. Users can read and update only their own row. Only the authenticated user ID can be inserted; profile fields are updated separately. There are no anonymous grants or client delete grants.

## 2. Configure authentication

In Authentication settings, enable the Email provider and keep email confirmation enabled. Configure the Site URL to a valid page you control for the browser to land on after confirmation. Confirmation happens in the browser; users then return to Kittycara and log in. The app does not currently handle password-recovery or auth deep links.

Use an inbox you control for testing. Supabase's built-in email delivery has restrictions; configure custom SMTP before inviting other users. This migration supports email/password accounts only. Phone authentication requires an SMS provider and an additional verification flow.

## 3. Configure the app

Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

From the project's Connect dialog, copy the Project URL and publishable API key into `.env`:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

These values are bundled into the app. Never put a database password, secret key, or service-role key here. The `.env` file is ignored by Git. Restart Expo after changing environment variables. Without configuration, the app displays a setup message.

## 4. Run and test

```powershell
npm install
npm test
npx expo export --platform android
npx expo start --clear
```

Use an SDK 49 compatible client or development build for this project. Create a test account, verify its email in the browser, and log in. Complete consent, name, sex, and age. Restart the app partway through and after completing onboarding. Verify that it resumes correctly. Sign out and verify that Back cannot restore signed-in screens.

In the Supabase Table Editor, check that the profile ID matches the Auth user's UUID. Create a second test user and confirm that each account receives its own profile. The automated database tests exercise isolation in embedded PostgreSQL; a test against the hosted project's Data API is still required after setup. The SQL Editor normally runs with privileged access, so seeing every row there does not test RLS.

## What migrated and what did not

- Account signup/login, persistent sessions, automatic session refresh, logout, and profile updates now use Supabase.
- Old account API tokens are discarded. Old accounts, password hashes, and profile records are not imported. Users must register again unless a separate migration is performed.
- AI analysis still calls the existing Hugging Face `/analyze` service directly. No chat history is stored in Supabase.
- Terms and privacy links still point to the old website and need replacement with working policy pages. Review their content for the new backend and AI data flow.
- Password recovery, phone signup, hosted RLS verification, and device testing remain outstanding.

Implementation follows Supabase's [React Native auth guide](https://supabase.com/docs/guides/auth/quickstarts/react-native) and [row-level security guide](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Local verification status

On October 19, 2026, all 14 automated tests passed, including database ownership/grant/constraint checks in embedded PostgreSQL, and the Android/Hermes export succeeded. No hosted project was connected and no hosted schema was changed. Supabase dashboard advisors, the hosted Data API, confirmation email delivery, and device interactions must be checked once your project exists.
