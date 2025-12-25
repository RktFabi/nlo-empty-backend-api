// // Jest setup file for handling CI environment
// import { jest } from '@jest/globals';

// // Set default timeout for all tests
// jest.setTimeout(10000);

// // Handle CI environment - skip Firestore emulator tests if not available
// if (process.env.CI && !process.env.FIRESTORE_EMULATOR_HOST) {
//   console.log('Running in CI environment without Firestore emulator - skipping integration tests');
  
//   // Mock the Firestore emulator functions for CI
//   jest.mock('../test/utils/firestore-emulator', () => ({
//     // setupFirestoreEmulator: jest.fn().mockRejectedValue(new Error('Firestore emulator not available in CI')),
//     setupFirestoreEmulator: jest.fn().mockImplementation(() => Promise.reject(new Error('Firestore emulator not available in CI'))),
//     // clearFirestoreData: jest.fn().mockResolvedValue(undefined),
//     clearFirestoreData: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
//   }));
// }
