# Google OAuth Setup Instructions

To enable Google Sign-In for your Personal Finance Tracker, you need to configure Google OAuth in your Supabase project.

## Steps to Enable Google Authentication

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Go to "Providers" tab

3. **Enable Google Provider**
   - Find "Google" in the list of providers
   - Toggle it to "Enabled"

4. **Configure Google Cloud Console**
   - Follow the detailed guide at: https://supabase.com/docs/guides/auth/social-login/auth-google
   - You'll need to:
     - Create a Google Cloud Project
     - Enable the Google+ API
     - Create OAuth 2.0 credentials
     - Configure the authorized redirect URIs

5. **Add Credentials to Supabase**
   - Copy your Google Client ID and Client Secret
   - Paste them into the Supabase Google provider settings
   - Click "Save"

6. **Configure Redirect URL**
   - Your redirect URL should be: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - Add this to your Google OAuth credentials

## Testing

Once configured, the "Continue with Google" button on the login page will work seamlessly!

## Important Notes

- Without this setup, Google sign-in will show a "provider is not enabled" error
- Email/password authentication works out of the box without additional setup
- Email confirmation is automatically bypassed in this prototype since no email server is configured

For more information, visit the official Supabase documentation:
https://supabase.com/docs/guides/auth/social-login/auth-google
