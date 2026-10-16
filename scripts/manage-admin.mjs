import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const [operation, uid] = process.argv.slice(2);
const projectId = process.env.GCLOUD_PROJECT || 'blackhumorproductions-1774c';

if (!['grant', 'revoke'].includes(operation) || !uid || uid.includes('@')) {
  console.error('Usage: node scripts/manage-admin.mjs <grant|revoke> <Firebase-Auth-UID>');
  process.exit(1);
}

async function main() {
  const app = initializeApp({
    credential: applicationDefault(),
    projectId,
  });
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = await auth.getUser(uid);
  const adminRef = db.collection('adminUsers').doc(uid);
  const remainingClaims = Object.fromEntries(
    Object.entries(user.customClaims || {}).filter(([key]) => key !== 'admin'),
  );

  if (operation === 'grant') {
    await auth.setCustomUserClaims(uid, { ...remainingClaims, admin: true });
    await adminRef.set({ uid, grantedAt: FieldValue.serverTimestamp() });
    console.log(`Administrator access granted to UID ${uid} in ${projectId}.`);
    console.log('The account must refresh its Firebase sign-in token before admin routes appear.');
    return;
  }

  await adminRef.delete();
  await auth.setCustomUserClaims(uid, remainingClaims);
  console.log(`Administrator access revoked for UID ${uid} in ${projectId}.`);
}

main().catch((error) => {
  console.error('Could not update administrator access:', error);
  process.exitCode = 1;
});
