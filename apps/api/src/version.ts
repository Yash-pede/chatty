export async function getAppVersion(): Promise<string> {
  try {
    const packageJSON = await import("../package.json", {
      assert: { type: "json" },
    });
    return packageJSON.default.version;
  } catch (error) {
    return "unknown";
  }
}
