import { Storage } from "@plasmohq/storage"

export async function getOpenAIKey() {
  const storage = new Storage()

  const selfKey = await storage.get("apikey")
  const sharedKey = await storage.get("sharedKey")

  if (selfKey) {
    return selfKey
  }

  if (sharedKey) {
    return sharedKey
  }

  return ""
}
