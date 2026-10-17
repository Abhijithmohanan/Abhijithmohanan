# Black Humor Productions

A responsive React website for Black Humor Productions, an independent creative media studio based in Nooranad, Kerala.

## Requirements

- Node.js 24.12+
- npm (included with Node.js)

## Run locally

```bash
npm ci
npm run dev
```

Vite prints the local development URL, usually `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

The optimized static site is written to `dist/`. The build checks TypeScript before bundling.

The site has separate routes for the home page, studio, services, six service detail pages,
portfolio concepts and concept details, and project inquiries. Portfolio concepts are clearly
identified as fictional demonstrations, not client case studies.

## Firebase membership portal

The site uses Firebase Authentication and Cloud Firestore for member accounts, membership
applications, service and support requests, notifications, review history, and the administrator
console. The member workspace reuses the public site’s configured service catalogue and account
profile; it does not create example memberships, requests, or notifications.

1. In the Firebase project `blackhumorproductions-1774c`, enable Google sign-in and the email/password
   provider under **Authentication → Sign-in method**. Add the production site and local development
   hostnames to **Authentication → Settings → Authorized domains**.
2. Create the Cloud Firestore database in production mode.
3. Deploy the rules in this repository with the Firebase CLI:

   ```bash
   npx firebase-tools deploy --only firestore --project blackhumorproductions-1774c
   ```

4. Use the registration or Google sign-in button to create a member account. Members can submit and
   track membership applications, service briefs, and support requests from `/dashboard`. Members
   can read only their own request and notification records. Only a trusted administrator can access
   the overview at `/admin`, the application queue at `/admin/membership-applications`, and service
   request management at `/admin/service-requests`.
5. To grant or revoke administrator access, install the Admin SDK as a local-only tool and configure
   Application Default Credentials for the Firebase project. Never commit a service-account key or
   enter an administrator email into the website:

   ```bash
   npm install --no-save --package-lock=false firebase-admin
   # Set GOOGLE_APPLICATION_CREDENTIALS to a securely stored service-account JSON file,
   # or authenticate with `gcloud auth application-default login`.
   node scripts/manage-admin.mjs grant FIREBASE_AUTH_UID
   node scripts/manage-admin.mjs revoke FIREBASE_AUTH_UID
   ```

   Find a user's UID in **Authentication → Users**. The script accepts a Firebase Auth UID only,
   preserves other custom claims, and updates both the `admin` custom claim and a server-managed
   `adminUsers/{uid}` marker. Firestore rules require both, so deleting the marker during revocation
   blocks admin data access immediately. After a grant, the user must refresh their sign-in session.
   Keep the Admin SDK credentials private and use a trusted workstation.

The Firebase web configuration in `src/config/firebase.ts` identifies the public client project; it
does not grant administrator access. `firestore.rules` denies all access outside the explicit
member/admin rules above. Deploy rule and index changes before enabling new member workflows in
production.

### Member workspace data

- `users/{uid}` contains the signed-in user's profile. Members may update their own contact profile
  fields; membership status, category, dates, reference ID, and configured `membershipBenefits`
  are administrator-controlled. Benefits are omitted from the UI until an administrator records
  them for an approved/active member.
- `membershipRequests/{requestId}` and its `history` subcollection are the existing membership
  application/review workflow. Members may submit an application and, when its status is
  `More Information Required`, update only the requested additional-information field.
- `serviceRequests/{requestId}` stores service and support briefs. Documents contain the owner's
  UID, authenticated email, title, category, description, optional deadline/budget, status,
  administrator message, member response, and server-managed timestamps. Members cannot change
  status or administrator messages. Authorized administrators can update the status and response
  message from `/admin/service-requests`.
- `users/{uid}/notifications/{notificationId}` stores notification title/message, event type,
  optional related record, server timestamp, and read state. A member can only read their own
  notifications and mark an unread item as read. Submission notifications are committed atomically
  with their corresponding request; administrator status/message notifications are written with
  the related update.
- Membership start date is recorded when an authorized administrator approves an application.
  Expiry date, member reference ID, and category-specific benefits are shown only when trusted
  administrator data exists; no default values are generated.

The notification schema accepts a `membership_expiry_upcoming` event for a trusted backend
sender, but this repository does not include a scheduled Cloud Function or other expiry scheduler.
Configure such a trusted server-side process before expecting automatic expiry reminders; never
create those reminders from the member client. No additional client Firebase configuration or
service-account credential is required for the dashboard. Continue to use the existing `vercel.json`
SPA rewrite for Vercel deployment.

### Administrator overview data

The `/admin` overview uses Firestore count aggregations for membership applications and service
requests by their recorded status. Its “Registered profiles” count is the number of documents in
`users`; it is not a count of Firebase Authentication accounts because profile creation is not
synchronized for every account. “Completed requests” counts records in `serviceRequests` with the
`Completed` status. There is no separate projects collection, payments system, or admin notification
inbox in this application, so the overview does not present those as existing business data.
Recent submissions and review queues are live Firestore queries; status charts show aggregate
counts rather than fabricated historical trends.

## Deploy to GitHub Pages

The included `.github/workflows/deploy.yml` builds and publishes the site to GitHub Pages when changes are pushed to `main` (or when manually started from the Actions tab).

1. Push this repository to GitHub and set the default deployment branch to `main`.
2. In **Settings → Pages**, select **GitHub Actions** as the build and deployment source.
3. Ensure the repository contains the existing `CNAME` file for `blackhumorproductions.qd.je` and configure that hostname’s DNS to point to GitHub Pages.
4. Push to `main`; follow the **Deploy to GitHub Pages** workflow in the Actions tab.
5. Once DNS resolves, enable **Enforce HTTPS** in the Pages settings.

The Vite build uses root-relative URLs for the configured custom domain. `public/404.html` preserves client-side routes on GitHub Pages, and the workflow copies `CNAME` into the built artifact.

For another static host, publish the contents of `dist/`, configure its SPA fallback to serve `index.html` for application routes, and point the domain at that host.

For Vercel, the included `vercel.json` rewrites application routes to `index.html`. This is
separate from `public/404.html`, which is a GitHub Pages-specific fallback and must not be used
to route requests on Vercel.

## Contact form

The contact form validates its fields in the browser and prepares an inquiry in WhatsApp using the configured business number. The visitor reviews and sends the message themselves; no form data is sent to or stored by this website. Visitors can also email the studio directly at `blackhumorproductions@outlook.com` using the site's `mailto:` link.

## Content and assets

The portfolio items are explicitly labelled demonstration concepts and are not client work or case studies. Studio and portfolio photography is illustrative stock photography from [Unsplash](https://unsplash.com/license); optimized WebP copies are stored in `public/images/` so the site does not depend on a third-party image CDN at runtime.

Business details are centralized in `src/config/site.ts`. Before launch, confirm the custom-domain DNS/HTTPS configuration and supply any official social profiles or real project material you want to add. No unverified client claims or social links are included.
