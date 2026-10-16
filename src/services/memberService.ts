import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { getDatabase } from '../config/firebase';

export async function ensureMemberProfile(user: User) {
  const db = await getDatabase();
  const profileRef = doc(db, 'users', user.uid);

  await runTransaction(db, async (transaction) => {
    const profile = await transaction.get(profileRef);
    const profileFields = {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      photoURL: user.photoURL ?? '',
      updatedAt: serverTimestamp(),
    };

    if (profile.exists()) {
      transaction.update(profileRef, profileFields);
    } else {
      transaction.set(profileRef, {
        ...profileFields,
        membershipStatus: 'Not Applied',
        createdAt: serverTimestamp(),
      });
    }
  });
}
