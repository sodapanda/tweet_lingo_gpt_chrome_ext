import {
  Anchor,
  Box,
  Button,
  Stack,
  Text,
  TextInput,
  createEmotionCache,
  rem
} from "@mantine/core"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

import { useMessage } from "@plasmohq/messaging/hook"

import { ThemeProvider } from "~theme"

export const config: PlasmoCSConfig = {
  matches: ["https://twitter.com/*"]
}

const styleElement = document.createElement("style")

const styleCache = createEmotionCache({
  key: "plasmo-mantine-cache",
  prepend: true,
  container: styleElement
})

export const getStyle = () => styleElement

export default function GptOverlay() {
  return (
    <ThemeProvider emotionCache={styleCache}>
      <Stack
        style={{
          position: "fixed",
          bottom: 53,
          right: 20
        }}
        bg="blue.7"
        miw={240}
        p="lg">
        <Text fw="bold" size="xl">
          Welcome to your{" "}
          <Anchor href="https://www.plasmo.com" target="_blank">
            Plasmo
          </Anchor>{" "}
          Extension!
        </Text>
        <TextInput />
        <Button component="a" href="https://docs.plasmo.com" target="_blank">
          View Docs
        </Button>
      </Stack>
    </ThemeProvider>
  )
}
