// tests/utils/firestore-emulator.ts
import * as admin from 'firebase-admin';
import net from 'net';

let firestore: FirebaseFirestore.Firestore | null = null;

/** Quick TCP wait so we fail fast if the emulator isn’t up yet. */
async function waitForEmulator(host: string, port: number): Promise<void> {
  const totalMs = 5000;
  const deadline = Date.now() + 5000;
  let lastErr: unknown = null;

  while (Date.now() < deadline) {
    try {
      await new Promise<void>((resolve, reject) => {
        const s = net.connect(port, host, () => { s.end(); resolve(); });
        s.setTimeout(2000, () => { s.destroy(); reject(new Error('timeout')); });
        s.on('error', reject);
      });
      return; // reachable
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, 300));
    }
  }
  throw new Error(
    `Emulator not reachable at ${host}:${port} within ${totalMs}ms: ${String(lastErr)}\n`
    + '\n'
    + `Hint: start the emulator with:\n`
    + `  npm run start:emulator\n`
    + '\n'
  );
}

/**
 * Bootstraps a Firestore emulator connection for tests.
 */
export async function setupFirestoreEmulator(): Promise<FirebaseFirestore.Firestore> {
  if (firestore) return firestore;

  // Respect an existing value (Docker uses "emulators:8085"); default only for host runs.
  process.env.FIRESTORE_EMULATOR_HOST ||= 'localhost:8085';

  // Initialize Firebase admin app (only once).
  if (admin.apps.length === 0) {
    const usingEmu = !!process.env.FIRESTORE_EMULATOR_HOST;
    admin.initializeApp(
      usingEmu
        ? { projectId: process.env.FIREBASE_PROJECT_ID || 'test-project' }
        : undefined // not used in tests, but keeps signature clean
    );
  }

  // Wait until the emulator is actually listening to avoid Jest timeouts.
  const [host, portStr] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
  await waitForEmulator(host, Number(portStr));

  // IMPORTANT: don’t call firestore.settings({ host, ssl:false }) here.
  // The Admin SDK automatically routes to the emulator when FIRESTORE_EMULATOR_HOST is set.
  firestore = admin.firestore();
  firestore.settings({ ignoreUndefinedProperties: true });

  return firestore;
}

/**
 * Clears all documents from the emulator.
 */
export async function clearFirestoreData(): Promise<void> {
  if (!firestore) return;

  const collections = await firestore.listCollections();
  for (const col of collections) {
    const snapshot = await col.get();
    if (snapshot.empty) continue;

    const batch = firestore.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}
