import { ModuleMetadata, Provider } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "./app.module";
import { CustomConfigService } from "./config/config.service"; // ← added import

export {};

const app_modules: any[] = Reflect.getMetadata("imports", AppModule).slice(1); // discard first element

const modules_to_providers = function (acc: Provider[], cur: any) {
  let module_providers = Reflect.getMetadata("providers", cur);
  return acc.concat(module_providers || []);
};

export const test_metadata: ModuleMetadata = {
  providers: app_modules.reduce(modules_to_providers, []) || [],
};

export async function create_testing_module(
  metadata: ModuleMetadata = {}
): Promise<TestingModule> {
  let module: TestingModule;

  if (Object.keys(metadata).length) {
    let all_providers: Provider[] = test_metadata["providers"] || [];

    let new_providers_tmp = metadata["providers"]
      ? metadata["providers"].concat(all_providers)
      : all_providers;

    // ✅ Ensure CustomConfigService is always provided
    if (
      !new_providers_tmp.find(
        (p) =>
          p === CustomConfigService || // class provider
          (typeof p === "object" &&
            "provide" in p &&
            p.provide === CustomConfigService) // object provider
      )
    ) {
      new_providers_tmp.push({
        provide: CustomConfigService,
        useValue: { get: (key: string) => null }, // minimal mock
      });
    }

    let new_providers_set = new Set(new_providers_tmp); // deduplicate
    let new_providers = Array.from(new_providers_set);

    let new_metadata = { ...metadata }; // copy metadata
    new_metadata["providers"] = new_providers; // replace providers with extended list

    module = await Test.createTestingModule(new_metadata).compile();
  } else {
    module = await Test.createTestingModule(test_metadata).compile();
  }

  return module;
}

console.log(app_modules);
console.log(Reflect.getMetadata("providers", test_metadata));
