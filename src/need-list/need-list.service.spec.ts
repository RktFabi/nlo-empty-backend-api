// import { Test, TestingModule } from "@nestjs/testing";
// import { ConfigModule } from "@nestjs/config";
// import { NeedListController } from "./need-list.controller";
// import { NeedListService } from "./need-list.service";
// import {
//   setupFirestoreEmulator,
//   clearFirestoreData,
// } from "../test/utils/firestore-emulator";
// import { create_testing_module } from "../create_testing_module";
// import { CustomConfigService } from "../config/config.service";
// import { AuthModule } from "../auth/auth.module";
// import { FirebaseModule } from "../firebase/firebase.module";

// // All documentation for testing will be added to this file
// describe("NeedListController (Integration)", () => {
//   let controller: NeedListController;
//   let firestore: FirebaseFirestore.Firestore;
//   let isEmulatorAvailable = true;

//   beforeAll(async () => {
//     // This test is called before all tests run
//     // Attempt to set up Firestore emulator, skip tests if not available
//     try {
//       firestore = await setupFirestoreEmulator();
//     } catch (error) {
//       isEmulatorAvailable = false;
//       throw new Error(
//         "Firestore emulator not available, please ensure that local Firebase Emulator Suite is running for tests.",
//         { cause: error }
//       );
//     }

//     const module: TestingModule = await create_testing_module({
//       controllers: [NeedListController],
//       providers: [
//         {
//           provide: CustomConfigService,
//           useValue: { get: (key: string) => null }, // dummy, safe for emulator
//         },
//       ],
//     });

//     controller = module.get<NeedListController>(NeedListController);
//   }, 60000);

//   afterEach(async () => {
//     // This test is called after each test run
//     if (isEmulatorAvailable) {
//       await clearFirestoreData();
//       console.log(
//         "Firestore Emulator Host:",
//         process.env.FIRESTORE_EMULATOR_HOST
//       );
//     }
//   }, 60000);

//   /*
//   All tests should be look like this, create a new test case for each functionality.
//   */
//   it("should be defined", () => {
//     if (!isEmulatorAvailable) {
//       console.log("Skipping test - Firestore emulator not available");
//       return;
//     }
//     expect(controller).toBeDefined(); // Assertion
//   });

//   /*
//   Another example of test case, repeat this structure for other test cases.
//   */
//   it("should create and then retrieve NeedLists from Firestore emulator", async () => {
//     if (!isEmulatorAvailable) {
//       console.log("Skipping test - Firestore emulator not available");
//       return;
//     }

//     // 1️⃣ Create NeedList using controller method (which calls real service)
//     const newNeedList = await controller.create({
//       needlist_name: "Test Need Fabien",
//       needlist_status: "Draft",
//       total_donated: 0,
//       total_items: 0,
//       total_price: 0,
//       total_tax: 0,
//       due_date: new Date().toISOString(),
//       created_at: new Date().toISOString(),
//       last_updated: new Date().toISOString(),
//       group_id: null,
//       location_id: null,
//       org_id: null,
//       user_id: null,
//     });

//     expect(newNeedList!.needlist_name).toBe("Test Need Fabien"); // Assertion

//     // 2️⃣ Call the GET route through controller
//     const allNeeds = await controller.findAll(""); // Pass 'sort' parameter as needed

//     // 3️⃣ Validate real data from Firestore Emulator
//     expect(allNeeds.length).toBe(1);
//     expect(allNeeds[0].needlist_name).toBe("Test Need Fabien");
//   });
// });
