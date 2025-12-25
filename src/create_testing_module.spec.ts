import { ConfigService } from "@nestjs/config";
import { create_testing_module, test_metadata } from "./create_testing_module";
import { FirebaseModule } from "./firebase/firebase.module";
import { FirebaseService } from "./firebase/firebase.service";
// import { JaydenTestTestService } from "./jayden_test_test/jayden_test_test.service";
import { NeedListService } from "./need-list/need-list.service";
import { Test, TestingModule } from "@nestjs/testing";
import { firebaseProviders } from "./firebase/firebase.providers";
import { FirestoreService } from "node_modules/firebase-admin/lib/firestore/firestore-internal";

describe("testing function that creates test modules", () => {
  // these tests run on
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [FirebaseModule],
      providers: [
        ConfigService,
        FirebaseService,
        NeedListService,
        // JaydenTestTestService
      ],
    }).compile();
  });

  it("extend providers but avoid duplicates", () => {
    return create_testing_module({
      providers: [
        // JaydenTestTestService,
        FirebaseService,
        NeedListService,
      ],
    }).then((result) => {
      const expected_providers = test_metadata["providers"]
        ? test_metadata["providers"].concat([
            //JaydenTestTestService,
            FirebaseService,
          ])
        : [];
      const result_providers = result["providers"] ? result["providers"] : [];
      //console.log(expected_providers);
      expect(result_providers.sort()).toStrictEqual(expected_providers.sort());
    });
  });

  it("extra metadata", () => {
    return create_testing_module({ imports: [FirebaseModule] }).then(
      (result) => {
        let expected_metadata = { ...test_metadata };
        expected_metadata["imports"] = [FirebaseModule];
        expect(result).toStrictEqual(expected_metadata);
      }
    );
  });

  it("nothing", () => {
    return create_testing_module().then((result) => {
      expect(result).toBe(test_metadata);
    });
  });
});
