import process from "process";

async function main(): Promise<void> {
  console.log("Shop Checker is running.");
}

main().catch((error: unknown) => {
  console.error("Project error:", error);
  process.exitCode = 1;
});
